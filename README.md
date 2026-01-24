# Google Ads Automation

> **Empire Amplify** - Automated Google Ads management for agencies and in-house teams.
> 
> **No coding required!** Use our Google Sheets + Apps Script version for easy implementation.

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Google Ads API](https://img.shields.io/badge/Google%20Ads%20API-v18-green.svg)](https://developers.google.com/google-ads/api/docs/start)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Who Is This For?

| User Type | Recommended Version | Setup Time |
|-----------|---------------------|------------|
| **Google Ads Managers** (non-technical) | Google Sheets + Apps Script | 15 minutes |
| **Marketing Teams** | Google Sheets + n8n workflows | 30 minutes |
| **Developers / Agencies** | Python scripts | 1-2 hours |

---

## 🚀 Quick Start (No Coding Required)

### Option 1: Google Sheets Version (Recommended for Beginners)

1. **Create a new Google Sheet**
2. **Go to Extensions → Apps Script**
3. **Copy/paste the code from** `google-apps-script/GoogleAdsAutomation.gs`
4. **Save and refresh your sheet**
5. **Use the new "🎯 Google Ads Automation" menu**

That's it! You'll get:
- ✅ Custom menu in your spreadsheet
- ✅ One-click campaign reporting
- ✅ Automated optimization rules
- ✅ Slack/Email notifications

### Option 2: Python Scripts (For Developers)

```bash
git clone https://github.com/gordongeraghty/google-ads-automation.git
cd google-ads-automation
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python list_campaigns.py
```

---

## 📊 Use Cases & Examples

### 🛒 E-Commerce / Shopping Campaigns

**Your situation:** You manage Shopping or Performance Max campaigns for an online store. You need to maximize ROAS while keeping CPA under control.

**Recommended settings:**
```
PAUSE_IF_CPA_ABOVE: [Your target CPA × 1.5]
INCREASE_BUDGET_IF_ROAS_ABOVE: 3.0
MAX_DAILY_BUDGET: [Your max budget per campaign]
```

**What happens:**
- Campaigns with ROAS > 3x automatically get 20% budget increases
- Campaigns with CPA 50% above target get paused
- You get daily Slack alerts on top performers

**Example:**
> "My client sells shoes online. Target CPA is $30. I set PAUSE_IF_CPA_ABOVE to $45. 
> Any campaign spending $50+ with CPA over $45 gets paused automatically. 
> Campaigns with ROAS over 3x get more budget. I check results once a day instead of constantly monitoring."

---

### 📞 Lead Generation / Service Business

**Your situation:** You run Search campaigns for a service business (plumber, lawyer, dentist, etc.). You need to generate leads at a target cost.

**Recommended settings:**
```
PAUSE_IF_CPA_ABOVE: [Your max cost per lead]
PAUSE_IF_CTR_BELOW: 1.0
INCREASE_BUDGET_IF_ROAS_ABOVE: 2.0
DAYS_TO_ANALYZE: 14
```

**What happens:**
- Campaigns with cost/lead above threshold get paused
- Low CTR campaigns (poor ad relevance) get flagged
- High-converting campaigns get more budget

**Example:**
> "My client is a dentist. A new patient is worth $500. We pay up to $100/lead.
> I set PAUSE_IF_CPA_ABOVE to $100. Any campaign with CPA over $100 gets paused.
> We focus budget on campaigns that bring leads under $100."

---

### 🏢 B2B / High-Value Sales

**Your situation:** Long sales cycles, high-value deals, fewer conversions. You need to be patient but still optimize.

**Recommended settings:**
```
PAUSE_IF_CPA_ABOVE: 500  # Higher threshold for B2B
PAUSE_IF_CTR_BELOW: 0.5
DAYS_TO_ANALYZE: 30  # Longer window for B2B
MIN_SPEND_FOR_EVALUATION: 200  # Need more data
```

**What happens:**
- Uses 30-day windows for better data
- Higher CPA thresholds (B2B has higher margins)
- Requires more spend before making decisions

**Example:**
> "My client sells enterprise software at $50k/deal. A lead is worth $500+.
> I use 30-day windows and higher thresholds because we need more data.
> The script only makes changes when there's enough data to be confident."

---

### 🏷️ Brand Campaigns

**Your situation:** You run brand campaigns to protect your client's brand terms. Low CPA, high ROAS, but you want to catch any issues.

**Recommended settings:**
```
PAUSE_IF_CPA_ABOVE: 20  # Brand should be cheap
PAUSE_IF_CTR_BELOW: 5.0  # Brand should have high CTR
ALERT_ON_IMPRESSION_DROP: 20  # Alert if impressions drop 20%
```

**What happens:**
- Flags if brand campaign CPA rises (competitor activity?)
- Alerts on CTR drops (ad issues?)
- Monitors for impression share changes

---

## 📁 Files In This Repository

```
google-ads-automation/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── requirements.txt             # Python dependencies (pinned)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
│
├── google-apps-script/          # NO-CODE VERSION
│   └── GoogleAdsAutomation.gs   # Copy this to Google Sheets
│
├── google_ads_client.py         # Core API client
├── list_campaigns.py            # List campaigns with metrics
├── automation_rules.py          # Automated optimization rules
│
├── tests/                       # Unit tests
│   ├── __init__.py
│   └── test_automation.py
│
└── .github/
    └── workflows/
        └── lint.yml             # GitHub Actions for linting
```

---

## ⚙️ Configuration via Google Sheets

All settings are managed in a **CONFIG** sheet (created automatically):

| Setting | Default | Description |
|---------|---------|-------------|
| `CUSTOMER_ID` | - | Your Google Ads Customer ID |
| `PAUSE_IF_CPA_ABOVE` | 100 | Pause if CPA exceeds this ($) |
| `PAUSE_IF_CTR_BELOW` | 0.5 | Pause if CTR below this (%) |
| `INCREASE_BUDGET_IF_ROAS_ABOVE` | 3.0 | Scale budget if ROAS above this |
| `BUDGET_INCREASE_PERCENT` | 20 | Budget increase amount (%) |
| `MAX_DAILY_BUDGET` | 500 | Maximum daily budget cap ($) |
| `SLACK_WEBHOOK_URL` | - | Slack webhook for alerts |
| `EMAIL_RECIPIENTS` | - | Email addresses for reports |
| `DAYS_TO_ANALYZE` | 30 | Days of data to analyze |

---

## 🔔 Notifications

### Slack Integration
1. Create a Slack webhook at https://api.slack.com/apps
2. Add the webhook URL to your CONFIG sheet
3. Get alerts for:
   - Daily performance summaries
   - Campaigns paused automatically
   - Budget increases applied

### Email Reports
1. Add email addresses to CONFIG (comma-separated)
2. Get daily/weekly reports automatically
3. Works with any email address

---

## 🔗 Related Repositories

| Repo | Description | Best For |
|------|-------------|----------|
| [google-ads-bid-optimization](../google-ads-bid-optimization) | Automated bid management | Fine-tuning keyword bids |
| [google-ads-keyword-management](../google-ads-keyword-management) | Keyword & negative management | Search campaigns |
| [google-ads-quality-control](../google-ads-quality-control) | Naming conventions & QA | Account organization |
| [google-ads-reporting-analytics](../google-ads-reporting-analytics) | Advanced reporting | Dashboards & analytics |
| [n8n-google-ads-workflows](../n8n-google-ads-workflows) | n8n workflow templates | Complex automation |
| [zapier-google-ads-integration](../zapier-google-ads-integration) | Zapier integrations | App connections |

---

## ❓ FAQ

**Q: Do I need to know Python?**
A: No! Use the Google Sheets version - just copy/paste the code.

**Q: Is this safe? Will it break my campaigns?**
A: Always run in "Preview" mode first. The script shows what it WOULD do before doing it.

**Q: How often should I run the automation?**
A: Daily is recommended. Set up a time-based trigger in Apps Script.

**Q: Can I customize the rules?**
A: Yes! All thresholds are in the CONFIG sheet. Change them anytime.

**Q: Does this work with MCC accounts?**
A: Yes, just enter the correct Customer ID for each account.

---

## 📞 Support

- **Email:** gordon@empireamplify.com.au
- **Issues:** Open a GitHub issue
- **Location:** Melbourne, Australia

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

**Empire Amplify** | Melbourne, Australia | 2025
