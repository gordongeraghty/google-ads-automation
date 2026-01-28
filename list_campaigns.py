"""
List and analyze Google Ads campaigns
Empire Amplify - Campaign Management

This script retrieves all campaigns and their performance metrics.
"""

from datetime import datetime, timedelta

import pandas as pd
from google.ads.googleads.errors import GoogleAdsException
from loguru import logger

from google_ads_client import get_customer_id, get_google_ads_client, handle_google_ads_exception


def list_campaigns(client, customer_id, include_metrics=True, days_back=30):
    """
    List all campaigns with optional performance metrics.

    Args:
        client: Google Ads client
        customer_id: Customer ID to query
        include_metrics: Whether to include performance metrics
        days_back: Number of days to look back for metrics

    Returns:
        pandas.DataFrame: Campaign data
    """
    ga_service = client.get_service("GoogleAdsService")

    # Base query
    query = """
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.bidding_strategy_type,
            campaign_budget.amount_micros
    """

    if include_metrics:
        query += """,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.ctr,
            metrics.average_cpc
        """

    query += f"""
        FROM campaign
        WHERE campaign.status != 'REMOVED'
    """

    if include_metrics:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        query += f"""
            AND segments.date BETWEEN '{start_date.strftime('%Y-%m-%d')}' 
            AND '{end_date.strftime('%Y-%m-%d')}'
        """

    logger.info(f"Fetching campaigns for customer {customer_id}")

    campaigns = []
    response = ga_service.search(customer_id=customer_id, query=query)

    for row in response:
        campaign_data = {
            "campaign_id": row.campaign.id,
            "campaign_name": row.campaign.name,
            "status": row.campaign.status.name,
            "channel_type": row.campaign.advertising_channel_type.name,
            "bidding_strategy": row.campaign.bidding_strategy_type.name,
            "daily_budget": row.campaign_budget.amount_micros / 1_000_000,
        }

        if include_metrics:
            campaign_data.update(
                {
                    "impressions": row.metrics.impressions,
                    "clicks": row.metrics.clicks,
                    "cost": row.metrics.cost_micros / 1_000_000,
                    "conversions": row.metrics.conversions,
                    "conversion_value": row.metrics.conversions_value,
                    "ctr": row.metrics.ctr * 100,
                    "avg_cpc": row.metrics.average_cpc / 1_000_000,
                }
            )

        campaigns.append(campaign_data)

    df = pd.DataFrame(campaigns)
    logger.info(f"Found {len(df)} campaigns")
    return df


def get_campaign_performance_summary(df):
    """
    Generate a performance summary from campaign data.

    Args:
        df: DataFrame with campaign metrics

    Returns:
        dict: Summary statistics
    """
    if df.empty:
        return {"error": "No campaigns found"}

    summary = {
        "total_campaigns": len(df),
        "active_campaigns": len(df[df["status"] == "ENABLED"]),
        "total_spend": df["cost"].sum() if "cost" in df.columns else 0,
        "total_clicks": df["clicks"].sum() if "clicks" in df.columns else 0,
        "total_conversions": df["conversions"].sum() if "conversions" in df.columns else 0,
        "avg_ctr": df["ctr"].mean() if "ctr" in df.columns else 0,
        "avg_cpc": df["avg_cpc"].mean() if "avg_cpc" in df.columns else 0,
    }

    if summary["total_clicks"] > 0:
        summary["overall_ctr"] = (summary["total_clicks"] / df["impressions"].sum()) * 100

    if summary["total_conversions"] > 0 and summary["total_spend"] > 0:
        summary["cpa"] = summary["total_spend"] / summary["total_conversions"]

    return summary


if __name__ == "__main__":
    try:
        client = get_google_ads_client()
        customer_id = get_customer_id()

        # Get campaigns with metrics
        df = list_campaigns(client, customer_id, include_metrics=True, days_back=30)

        if not df.empty:
            print("\n📊 Campaign Overview:")
            print(df.to_string(index=False))

            summary = get_campaign_performance_summary(df)
            print("\n📈 Performance Summary:")
            for key, value in summary.items():
                if isinstance(value, float):
                    print(f"  {key}: {value:.2f}")
                else:
                    print(f"  {key}: {value}")

    except GoogleAdsException as ex:
        handle_google_ads_exception(ex)
    except Exception as e:
        logger.error(f"Error: {e}")
