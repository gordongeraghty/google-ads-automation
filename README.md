# Google Ads Automation

> **Empire Amplify** - Automated Google Ads campaign management.
>
> **Choose your path:** No-code setup for marketers OR full API access for developers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Choose Your Setup Method

| Method | Difficulty | Suitable For |
|--------|------------|----------|
| [**Google Ads Scripts**](#option-1-google-ads-scripts-no-code) | Easy | Marketers, non-technical users |
| [**Google Sheets + Apps Script**](#option-2-google-sheets-version) | Easy | Users who want spreadsheet control |
| [**Python API**](#option-3-python-api-developers) | Advanced | Developers, custom integrations |

---

# Option 1: Google Ads Scripts (No-Code)

**Suitable for:** Non-technical users who want automation without any coding.

## What You'll Get

- Automatic campaign monitoring
- Auto-pause underperforming campaigns
- Auto-increase budgets for high performers
- Email alerts when changes happen
- Activity log in Google Sheets  

---

## Step-by-Step Setup Guide

### Step 1: Open Google Ads Scripts

1. Log into your Google Ads account
2. Click Tools & Settings (wrench icon in top menu)
3. Under "Bulk Actions", click Scripts

---

### Step 2: Create a New Script

1. Click the big blue + button
2. Delete all the default text in the editor
3. Name your script: `Campaign Automation`

---

### Step 3: Copy Our Script

1. Open this file: [`google-ads-scripts/CampaignAutomation.js`](google-ads-scripts/CampaignAutomation.js)
2. Select all and copy the entire code
3. Paste into the Google Ads script editor

---

### Step 4: Configure Your Settings

Find the `CONFIG` section near the top (around line 30):

```javascript
var CONFIG = {
  
  // Your email for alerts
  EMAIL_ADDRESS: 'your.email@company.com',
  
  // Pause campaigns if CPA exceeds this
  PAUSE_IF_CPA_ABOVE: 100,  // Change to your target
  
  // Increase budget if ROAS exceeds this
  INCREASE_BUDGET_IF_ROAS_ABOVE: 3.0,
  
  // Start in preview mode (recommended)
  PREVIEW_MODE: true,
};
```

#### Recommended Settings by Business Type:

| Business Type | CPA Threshold | CTR Threshold | ROAS Threshold |
|---------------|---------------|---------------|----------------|
| **E-Commerce** | Target CPA × 1.3 | 0.5% | 3.0 |
| **Lead Gen** | Max cost/lead | 1.0% | 2.0 |
| **B2B** | Max cost/lead | 0.5% | 2.0 |
| **Local Services** | Max cost/lead | 1.5% | N/A |

---

### Step 5: Authorise & Test

1. Click Preview (blue button)
2. Click Authorise when prompted
3. Sign in and click Allow
4. Review the logs - you'll see what changes would be made

---

### Step 6: Go Live

1. Change `PREVIEW_MODE: true` to `PREVIEW_MODE: false`
2. Click Run to execute
3. Schedule: Daily at 6:00 AM (recommended)

---

## Optional: Google Sheets Logging

1. Create a new Google Sheet
2. Copy the URL
3. Add to your script config:
   ```javascript
   SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/YOUR_ID/edit',
   ```

---

# Option 2: Google Sheets Version

For users who prefer managing everything from a spreadsheet.

**File:** [`google-apps-script/GoogleAdsAutomation.gs`](google-apps-script/GoogleAdsAutomation.gs)

### Setup:
1. Create a new Google Sheet
2. Go to Extensions → Apps Script
3. Paste the code from the file above
4. Save and refresh your sheet
5. Use the new "Google Ads Automation" menu

---

# Option 3: Python API (Developers)

**Suitable for:** Developers who need custom integrations, multi-account management, or connections to other APIs.

## Features

- Full Google Ads API access
- Connect to multiple APIs (CRM, analytics, databases)
- Custom automation logic
- Scheduled via cron, Airflow, or cloud functions
- MCC (multi-account) support

---

## Prerequisites

- Python 3.8+
- Google Ads API credentials ([Setup Guide](https://developers.google.com/google-ads/api/docs/first-call/overview))
- `google-ads.yaml` configuration file

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/gordongeraghty/google-ads-automation.git
cd google-ads-automation
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Credentials

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
```

Or create `google-ads.yaml`:

```yaml
developer_token: "YOUR_DEVELOPER_TOKEN"
client_id: "YOUR_CLIENT_ID"
client_secret: "YOUR_CLIENT_SECRET"
refresh_token: "YOUR_REFRESH_TOKEN"
login_customer_id: "YOUR_MCC_ID"
```

### 4. Test Connection

```bash
python list_campaigns.py
```

---

## Python Scripts

### `list_campaigns.py`
List all campaigns with basic metrics.

```bash
python list_campaigns.py
```

### `google_ads_client.py`
Core client wrapper for API calls.

```python
from google_ads_client import GoogleAdsClient

client = GoogleAdsClient()
campaigns = client.get_campaigns()

for campaign in campaigns:
    print(f"{campaign.name}: {campaign.status}")
```

### `automation_rules.py`
Apply automation rules programmatically.

```bash
python automation_rules.py --preview  # Preview mode
python automation_rules.py --apply    # Apply changes
```

**Configuration in script:**

```python
RULES = {
    'pause_if_cpa_above': 100,
    'pause_if_ctr_below': 0.5,
    'increase_budget_if_roas_above': 3.0,
    'budget_increase_percent': 20,
    'max_daily_budget': 500,
}
```

---

## Advanced Usage

### Multi-Account (MCC) Management

```python
from google_ads_client import GoogleAdsClient

# List all accounts under MCC
client = GoogleAdsClient(login_customer_id='YOUR_MCC_ID')
accounts = client.get_accessible_accounts()

for account_id in accounts:
    client.set_customer_id(account_id)
    campaigns = client.get_campaigns()
    # Process each account...
```

### Custom Automation Rules

```python
from automation_rules import AutomationEngine

engine = AutomationEngine()

# Add custom rule
engine.add_rule(
    name='pause_weekend_campaigns',
    condition=lambda c: 'Weekend' in c.name and c.cost > 100,
    action='pause',
)

# Run all rules
results = engine.run(preview=True)
```

### Integration with Other APIs

```python
from google_ads_client import GoogleAdsClient
import requests

# Get Google Ads data
client = GoogleAdsClient()
campaigns = client.get_campaigns_with_metrics(days=7)

# Send to your CRM/database
for campaign in campaigns:
    requests.post('https://your-api.com/campaigns', json={
        'name': campaign.name,
        'spend': campaign.cost,
        'conversions': campaign.conversions,
    })
```

### Scheduled Execution

**Using cron (Linux/Mac):**

```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/repo && python automation_rules.py --apply
```

**Using Task Scheduler (Windows):**

Create a scheduled task to run:
```
python C:\path\to\automation_rules.py --apply
```

**Using Cloud Functions:**

Deploy to AWS Lambda, Google Cloud Functions, or Azure Functions for serverless execution.

---

## API Reference

### GoogleAdsClient

```python
client = GoogleAdsClient(
    customer_id='123-456-7890',      # Target account
    login_customer_id='111-222-3333', # MCC ID (optional)
)

# Get campaigns
campaigns = client.get_campaigns()
campaigns = client.get_campaigns_with_metrics(days=30)

# Get keywords
keywords = client.get_keywords(campaign_id='123')

# Make changes
client.pause_campaign(campaign_id='123')
client.set_campaign_budget(campaign_id='123', budget=100.00)
client.add_negative_keyword(campaign_id='123', keyword='free')
```

### AutomationEngine

```python
engine = AutomationEngine(client)

# Built-in rules
engine.add_cpa_rule(threshold=100, action='pause')
engine.add_roas_rule(threshold=3.0, action='increase_budget', percent=20)
engine.add_ctr_rule(threshold=0.5, action='pause')

# Run
results = engine.run(preview=True)
print(f"Actions: {len(results)}")
```

---

## Running Tests

```bash
# Install test dependencies
pip install pytest pytest-mock

# Run tests
pytest tests/ -v
```

---

## Project Structure

```
google-ads-automation/
│
├── README.md                          # This file
├── LICENSE                            # MIT License
├── requirements.txt                   # Python dependencies
├── .env.example                       # Environment template
│
├── google-ads-scripts/                # 🎯 No-code option
│   └── CampaignAutomation.js          # Copy into Google Ads
│
├── google-apps-script/                # 📊 Sheets option
│   └── GoogleAdsAutomation.gs         # Copy into Apps Script
│
├── google_ads_client.py               # 🔧 Python API client
├── automation_rules.py                # 🔧 Automation engine
├── list_campaigns.py                  # 🔧 Utility script
│
├── tests/                             # Unit tests
│   ├── __init__.py
│   └── test_automation.py
│
└── .github/workflows/                 # CI/CD
    └── lint.yml
```

---

## Troubleshooting

### Google Ads Scripts Issues

| Issue | Solution |
|-------|----------|
| "Authorisation required" | Click Authorise, sign in, Allow |
| "No campaigns found" | Check filters, ensure campaigns are active |
| "Changes not applying" | Set `PREVIEW_MODE: false` |

### Python API Issues

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Check credentials in `.env` or `google-ads.yaml` |
| "Customer not found" | Verify customer ID format (no dashes in API) |
| "Permission denied" | Ensure API access is enabled for account |
| "Developer token invalid" | Apply for API access at Google Ads |

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [google-ads-bid-optimization](../google-ads-bid-optimization) | Keyword bid management |
| [google-ads-keyword-management](../google-ads-keyword-management) | Search terms & negatives |
| [google-ads-quality-control](../google-ads-quality-control) | Account health checks |
| [google-ads-reporting-analytics](../google-ads-reporting-analytics) | Automated reports |

---

## Need Help?

- Email: gordon@empireamplify.com.au
- Issues: Open a GitHub issue
- API Docs: [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)

---

## Licence

MIT Licence - Free to use and modify.

**Empire Amplify** | Melbourne, Australia | 2025
