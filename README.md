# Google Ads Automation

> **Empire Amplify** - Core Google Ads API automation library for managing campaigns at scale.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Google Ads API](https://img.shields.io/badge/Google%20Ads%20API-v18-green.svg)](https://developers.google.com/google-ads/api/docs/start)

## Overview

This repository contains Python scripts for automating Google Ads management tasks:

- **Campaign Management** - List, create, update, and pause campaigns
- **Automation Rules** - Automatically optimize based on performance thresholds
- **Performance Reporting** - Generate insights and export to Google Sheets
- **Budget Management** - Dynamic budget allocation based on ROAS

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/gordongeraghty/google-ads-automation.git
cd google-ads-automation

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

Required credentials:
- **Developer Token** - Get from Google Ads UI > Tools & Settings > API Center
- **OAuth2 Credentials** - Create in Google Cloud Console
- **Customer ID** - Your Google Ads account ID

### 3. Test Connection

```bash
python google_ads_client.py
```

## Scripts

### `list_campaigns.py`
List all campaigns with performance metrics.

```bash
python list_campaigns.py
```

Output:
```
📊 Campaign Overview:
campaign_id  campaign_name       status   impressions  clicks  cost    conversions
123456789    Search - Brand      ENABLED  50000        2500    1250.00 125
987654321    PMax - Products     ENABLED  100000       3000    2000.00 80

📈 Performance Summary:
  total_campaigns: 2
  total_spend: 3250.00
  total_conversions: 205
  avg_ctr: 3.5%
```

### `automation_rules.py`
Run automated optimization rules.

```bash
# Dry run (preview only)
python automation_rules.py

# Apply changes
python automation_rules.py --apply
```

**Built-in Rules:**
| Rule | Threshold | Action |
|------|-----------|--------|
| High CPA | > $100 | Pause campaign |
| Low CTR | < 0.5% | Pause campaign |
| High ROAS | > 3x | Increase budget 20% |
| No conversions | 14 days | Pause campaign |

### `google_ads_client.py`
Core client configuration module. Import in other scripts:

```python
from google_ads_client import get_google_ads_client, get_customer_id

client = get_google_ads_client()
customer_id = get_customer_id()
```

## Configuration Options

Edit `automation_rules.py` to customize thresholds:

```python
RULES = {
    "pause_if_cpa_above": 100.0,
    "pause_if_ctr_below": 0.5,
    "increase_budget_if_roas_above": 3.0,
    "budget_increase_percent": 20,
    "max_daily_budget": 500.0
}
```

## Scheduling

### Using cron (Linux/Mac)
```bash
# Run automation rules daily at 6 AM
0 6 * * * cd /path/to/google-ads-automation && python automation_rules.py --apply
```

### Using n8n
Import the workflow from `../n8n-google-ads-workflows/daily-automation.json`

### Using Zapier
See `../zapier-google-ads-integration/` for Zapier webhook triggers.

## API Rate Limits

Google Ads API has rate limits. This library handles them automatically with:
- Exponential backoff on rate limit errors
- Batch operations for efficiency
- Request throttling

## Related Repositories

| Repository | Purpose |
|------------|---------|
| [google-ads-bid-optimization](../google-ads-bid-optimization) | Bid strategy automation |
| [google-ads-reporting-analytics](../google-ads-reporting-analytics) | Reporting & dashboards |
| [google-ads-quality-control](../google-ads-quality-control) | QA & naming conventions |
| [n8n-google-ads-workflows](../n8n-google-ads-workflows) | n8n workflow templates |

## Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [Python Client Library](https://github.com/googleads/google-ads-python)
- [API Rate Limits](https://developers.google.com/google-ads/api/docs/best-practices/quotas)

## License

MIT License - Empire Amplify 2025
