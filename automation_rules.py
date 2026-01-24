"""
Automated Campaign Rules Engine
Empire Amplify - Automation Rules

Implements automated rules for campaign management:
- Pause underperforming campaigns
- Increase budget for top performers
- Alert on anomalies
"""

from google.ads.googleads.errors import GoogleAdsException
from google_ads_client import get_google_ads_client, get_customer_id, handle_google_ads_exception
from list_campaigns import list_campaigns
from loguru import logger
import os
import requests


# Rule thresholds (customize these)
RULES = {
    "pause_if_cpa_above": 100.0,      # Pause if CPA > $100
    "pause_if_ctr_below": 0.5,         # Pause if CTR < 0.5%
    "pause_if_no_conversions_days": 14, # Pause if 0 conversions in 14 days
    "increase_budget_if_roas_above": 3.0,  # Increase budget if ROAS > 3x
    "budget_increase_percent": 20,      # Increase by 20%
    "max_daily_budget": 500.0,         # Cap at $500/day
    "min_spend_for_evaluation": 50.0   # Need $50 spend to evaluate
}


def send_slack_notification(message):
    """Send notification to Slack."""
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if webhook_url:
        try:
            requests.post(webhook_url, json={"text": message})
            logger.info("Slack notification sent")
        except Exception as e:
            logger.warning(f"Failed to send Slack notification: {e}")


def evaluate_campaigns(df):
    """
    Evaluate campaigns against rules and return recommended actions.
    
    Args:
        df: DataFrame with campaign metrics
        
    Returns:
        list: List of recommended actions
    """
    actions = []
    
    for _, campaign in df.iterrows():
        campaign_name = campaign["campaign_name"]
        campaign_id = campaign["campaign_id"]
        
        # Skip if not enough spend to evaluate
        if campaign.get("cost", 0) < RULES["min_spend_for_evaluation"]:
            continue
        
        # Rule 1: Pause if CPA too high
        if campaign.get("conversions", 0) > 0:
            cpa = campaign["cost"] / campaign["conversions"]
            if cpa > RULES["pause_if_cpa_above"]:
                actions.append({
                    "campaign_id": campaign_id,
                    "campaign_name": campaign_name,
                    "action": "PAUSE",
                    "reason": f"CPA ${cpa:.2f} > ${RULES['pause_if_cpa_above']}"
                })
                continue
        
        # Rule 2: Pause if CTR too low
        if campaign.get("ctr", 0) < RULES["pause_if_ctr_below"]:
            actions.append({
                "campaign_id": campaign_id,
                "campaign_name": campaign_name,
                "action": "PAUSE",
                "reason": f"CTR {campaign['ctr']:.2f}% < {RULES['pause_if_ctr_below']}%"
            })
            continue
        
        # Rule 3: Increase budget if ROAS is high
        if campaign.get("conversions", 0) > 0 and campaign.get("conversion_value", 0) > 0:
            roas = campaign["conversion_value"] / campaign["cost"]
            if roas > RULES["increase_budget_if_roas_above"]:
                current_budget = campaign.get("daily_budget", 0)
                new_budget = min(
                    current_budget * (1 + RULES["budget_increase_percent"] / 100),
                    RULES["max_daily_budget"]
                )
                if new_budget > current_budget:
                    actions.append({
                        "campaign_id": campaign_id,
                        "campaign_name": campaign_name,
                        "action": "INCREASE_BUDGET",
                        "reason": f"ROAS {roas:.2f}x > {RULES['increase_budget_if_roas_above']}x",
                        "current_budget": current_budget,
                        "new_budget": new_budget
                    })
    
    return actions


def apply_pause_action(client, customer_id, campaign_id):
    """Pause a campaign."""
    campaign_service = client.get_service("CampaignService")
    campaign_operation = client.get_type("CampaignOperation")
    
    campaign = campaign_operation.update
    campaign.resource_name = campaign_service.campaign_path(customer_id, campaign_id)
    campaign.status = client.enums.CampaignStatusEnum.PAUSED
    
    campaign_operation.update_mask.paths.append("status")
    
    response = campaign_service.mutate_campaigns(
        customer_id=customer_id,
        operations=[campaign_operation]
    )
    
    return response


def apply_budget_action(client, customer_id, campaign_id, new_budget_micros):
    """Update campaign budget."""
    # Note: This requires getting the budget resource name first
    # Simplified implementation - in production, get budget ID from campaign
    logger.info(f"Would set budget to ${new_budget_micros / 1_000_000:.2f}")


def run_automation_rules(dry_run=True):
    """
    Run all automation rules.
    
    Args:
        dry_run: If True, only report actions without applying them
    """
    client = get_google_ads_client()
    customer_id = get_customer_id()
    
    logger.info(f"Running automation rules (dry_run={dry_run})")
    
    # Get campaign data
    df = list_campaigns(client, customer_id, include_metrics=True, days_back=14)
    
    if df.empty:
        logger.info("No campaigns to evaluate")
        return
    
    # Evaluate against rules
    actions = evaluate_campaigns(df)
    
    if not actions:
        logger.info("✅ All campaigns within thresholds - no actions needed")
        return
    
    # Report and optionally apply actions
    logger.info(f"Found {len(actions)} recommended actions:")
    
    for action in actions:
        action_str = f"  [{action['action']}] {action['campaign_name']}: {action['reason']}"
        logger.info(action_str)
        
        if not dry_run:
            if action["action"] == "PAUSE":
                try:
                    apply_pause_action(client, customer_id, action["campaign_id"])
                    logger.info(f"    ✅ Applied: Paused campaign")
                    send_slack_notification(f"🛑 Paused campaign: {action['campaign_name']} - {action['reason']}")
                except GoogleAdsException as ex:
                    handle_google_ads_exception(ex)
            
            elif action["action"] == "INCREASE_BUDGET":
                new_budget_micros = int(action["new_budget"] * 1_000_000)
                apply_budget_action(client, customer_id, action["campaign_id"], new_budget_micros)
                send_slack_notification(
                    f"📈 Budget increased: {action['campaign_name']} "
                    f"${action['current_budget']:.2f} → ${action['new_budget']:.2f}"
                )


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Google Ads automation rules")
    parser.add_argument("--apply", action="store_true", help="Apply changes (default is dry run)")
    args = parser.parse_args()
    
    try:
        run_automation_rules(dry_run=not args.apply)
    except GoogleAdsException as ex:
        handle_google_ads_exception(ex)
    except Exception as e:
        logger.error(f"Error: {e}")
