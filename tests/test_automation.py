"""
Tests for Google Ads Automation
Empire Amplify

Run with: pytest tests/ -v
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import pandas as pd
import os


class TestAutomationRules:
    """Test automation rules logic."""
    
    def test_rules_config_exists(self):
        """Verify default rule thresholds are set."""
        # Import the rules config
        import sys
        sys.path.insert(0, '.')
        
        from automation_rules import RULES
        
        assert "pause_if_cpa_above" in RULES
        assert "pause_if_ctr_below" in RULES
        assert "increase_budget_if_roas_above" in RULES
        assert RULES["pause_if_cpa_above"] > 0
    
    def test_evaluate_campaigns_empty_df(self):
        """Test evaluation with empty dataframe."""
        from automation_rules import evaluate_campaigns
        
        df = pd.DataFrame()
        actions = evaluate_campaigns(df)
        
        assert actions == []
    
    def test_evaluate_campaigns_high_cpa(self):
        """Test that high CPA campaigns are flagged for pause."""
        from automation_rules import evaluate_campaigns, RULES
        
        # Create test data with high CPA
        df = pd.DataFrame([{
            "campaign_id": "123",
            "campaign_name": "Test Campaign",
            "cost": 500,
            "conversions": 2,  # CPA = $250
            "ctr": 2.0,
            "daily_budget": 100
        }])
        
        actions = evaluate_campaigns(df)
        
        # Should recommend pause due to high CPA
        pause_actions = [a for a in actions if a["action"] == "PAUSE"]
        assert len(pause_actions) > 0 or RULES["pause_if_cpa_above"] > 250
    
    def test_evaluate_campaigns_low_ctr(self):
        """Test that low CTR campaigns are flagged."""
        from automation_rules import evaluate_campaigns, RULES
        
        df = pd.DataFrame([{
            "campaign_id": "456",
            "campaign_name": "Low CTR Campaign",
            "cost": 100,
            "conversions": 10,
            "ctr": 0.1,  # Very low CTR
            "daily_budget": 50
        }])
        
        actions = evaluate_campaigns(df)
        
        # Check if low CTR triggered a pause
        ctr_threshold = RULES["pause_if_ctr_below"]
        if 0.1 < ctr_threshold:
            assert any(a["action"] == "PAUSE" for a in actions)


class TestListCampaigns:
    """Test campaign listing functionality."""
    
    def test_performance_summary_empty(self):
        """Test summary with empty data."""
        from list_campaigns import get_campaign_performance_summary
        
        df = pd.DataFrame()
        summary = get_campaign_performance_summary(df)
        
        assert "error" in summary
    
    def test_performance_summary_calculation(self):
        """Test summary calculations are correct."""
        from list_campaigns import get_campaign_performance_summary
        
        df = pd.DataFrame([
            {"status": "ENABLED", "cost": 100, "clicks": 50, "conversions": 5, "ctr": 2.0, "avg_cpc": 2.0},
            {"status": "ENABLED", "cost": 200, "clicks": 100, "conversions": 10, "ctr": 3.0, "avg_cpc": 2.0},
        ])
        
        summary = get_campaign_performance_summary(df)
        
        assert summary["total_campaigns"] == 2
        assert summary["total_spend"] == 300
        assert summary["total_conversions"] == 15


class TestGoogleAdsClient:
    """Test client configuration."""
    
    def test_get_customer_id_format(self):
        """Test customer ID formatting."""
        # Mock environment
        with patch.dict(os.environ, {"GOOGLE_ADS_CUSTOMER_ID": "123-456-7890"}):
            from google_ads_client import get_customer_id
            
            customer_id = get_customer_id()
            assert "-" not in customer_id
            assert customer_id == "1234567890"
    
    def test_missing_credentials_raises_error(self):
        """Test that missing credentials raise appropriate error."""
        with patch.dict(os.environ, {}, clear=True):
            # Remove all env vars
            os.environ.pop("GOOGLE_ADS_CUSTOMER_ID", None)
            
            from google_ads_client import get_customer_id
            
            with pytest.raises(ValueError):
                get_customer_id()


# Fixtures for reusable test data
@pytest.fixture
def sample_campaign_df():
    """Sample campaign data for testing."""
    return pd.DataFrame([
        {
            "campaign_id": "1",
            "campaign_name": "Brand Campaign",
            "status": "ENABLED",
            "cost": 500,
            "clicks": 250,
            "conversions": 25,
            "ctr": 2.5,
            "avg_cpc": 2.0,
            "daily_budget": 100
        },
        {
            "campaign_id": "2", 
            "campaign_name": "Generic Campaign",
            "status": "ENABLED",
            "cost": 1000,
            "clicks": 200,
            "conversions": 5,
            "ctr": 0.5,
            "avg_cpc": 5.0,
            "daily_budget": 200
        }
    ])


@pytest.fixture
def mock_google_ads_client():
    """Mock Google Ads client for testing."""
    mock_client = MagicMock()
    mock_service = MagicMock()
    mock_client.get_service.return_value = mock_service
    return mock_client
