# Google Ads Campaign Automation

> **Automatically pause bad campaigns, scale winners, and get alerts — no coding required.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⏱️ Setup Time: 15 Minutes | 💻 Difficulty: Easy

This script runs inside your Google Ads account and automatically:
- ⏸️ **Pauses** campaigns with high CPA (wasting money)
- ⏸️ **Pauses** campaigns with low CTR (poor performance)
- 📈 **Increases budgets** for campaigns with high ROAS (winners)
- 📧 **Emails you** when changes are made
- 📊 **Logs everything** to Google Sheets

---

## 🎯 Who Is This For?

| ✅ Perfect For | ❌ Not For |
|----------------|------------|
| Google Ads managers who want to save time | Accounts using only Smart Bidding |
| Agencies managing multiple accounts | Very small accounts (<$500/month) |
| E-commerce stores with clear ROAS targets | Brand-only campaigns |
| Lead gen businesses with CPA targets | Accounts with no conversion tracking |

---

## 📋 What You'll Need

Before starting, make sure you have:

- [ ] Access to a Google Ads account (Admin or Standard access)
- [ ] Conversion tracking set up (so we can measure CPA/ROAS)
- [ ] 15 minutes of time
- [ ] (Optional) A Google account for Google Sheets logging

---

# 🚀 Step-by-Step Setup Guide

## Step 1: Open Google Ads Scripts

1. Log into your [Google Ads account](https://ads.google.com)
2. Click the **Tools & Settings** icon (🔧 wrench) in the top menu
3. Under "Bulk Actions", click **Scripts**

![Step 1](https://i.imgur.com/tools-menu.png)

> 💡 **Can't find Scripts?** You need Admin or Standard access. Ask your account owner for access.

---

## Step 2: Create a New Script

1. Click the big blue **"+"** button
2. If prompted, click **"Skip tutorial"**
3. You'll see a code editor with some default text

![Step 2](https://i.imgur.com/new-script.png)

---

## Step 3: Copy the Script

1. Open this file: **[google-ads-scripts/CampaignAutomation.js](google-ads-scripts/CampaignAutomation.js)**
2. Click the **"Copy raw file"** button (or press Ctrl+A then Ctrl+C)
3. Go back to Google Ads
4. **Delete all the default text** in the editor
5. **Paste** the script (Ctrl+V)

---

## Step 4: Configure Your Settings

Find the **SETTINGS** section near the top (around line 50). Update these values:

### 📧 Email (Optional)
```javascript
EMAIL: 'your.email@company.com',
```
> Enter your email to receive alerts when changes are made.

### 🎯 Your Automation Rules

| Setting | What It Does | Recommended Value |
|---------|--------------|-------------------|
| `PAUSE_CPA_ABOVE` | Pause campaigns costing more than this per conversion | Your target CPA + 30% |
| `PAUSE_CTR_BELOW` | Pause campaigns with click-through rate below this | 1.0 for Search, 0.3 for Display |
| `INCREASE_BUDGET_ROAS_ABOVE` | Increase budget when ROAS exceeds this | 3.0 (means 3x return) |
| `BUDGET_INCREASE_PERCENT` | How much to increase budget | 20 |
| `MAX_BUDGET` | Never exceed this daily budget | Your max comfortable budget |

### Example Settings by Business Type:

**🛒 E-Commerce (Shopify, WooCommerce)**
```javascript
PAUSE_CPA_ABOVE: 35,              // If CPA > $35, pause
PAUSE_CTR_BELOW: 1.0,             // If CTR < 1%, pause
INCREASE_BUDGET_ROAS_ABOVE: 3.0,  // If ROAS > 3x, increase budget
BUDGET_INCREASE_PERCENT: 25,      // Increase by 25%
MAX_BUDGET: 500,                  // Never exceed $500/day
```

**📞 Lead Generation (Services, B2B)**
```javascript
PAUSE_CPA_ABOVE: 75,              // If cost per lead > $75, pause
PAUSE_CTR_BELOW: 1.5,             // If CTR < 1.5%, pause
INCREASE_BUDGET_ROAS_ABOVE: 2.0,  // If ROAS > 2x, increase budget
BUDGET_INCREASE_PERCENT: 20,      // Increase by 20%
MAX_BUDGET: 300,                  // Never exceed $300/day
```

**🏪 Local Business (Dentist, Plumber, etc.)**
```javascript
PAUSE_CPA_ABOVE: 50,              // If cost per lead > $50, pause
PAUSE_CTR_BELOW: 2.0,             // If CTR < 2%, pause
INCREASE_BUDGET_ROAS_ABOVE: 2.5,  // If ROAS > 2.5x, increase budget
BUDGET_INCREASE_PERCENT: 15,      // Increase by 15%
MAX_BUDGET: 200,                  // Never exceed $200/day
```

---

## Step 5: Authorize the Script

1. Click the **"Preview"** button (blue button at top)
2. A popup will appear asking for authorization
3. Click **"Authorize"**
4. Select your Google account
5. Click **"Allow"** to grant permissions

> 🔒 **Is this safe?** Yes! The script only accesses your Google Ads account. It cannot access other Google services or your personal data.

---

## Step 6: Test in Preview Mode

The script starts in **Preview Mode** — it will show you what it WOULD do, but won't make any changes.

1. Make sure this line says `true`:
   ```javascript
   PREVIEW_MODE: true,
   ```
2. Click **"Preview"**
3. Look at the **Logs** panel at the bottom
4. Review what actions the script would take

**Example Preview Output:**
```
═══════════════════════════════════════════════════════════
   EMPIRE AMPLIFY - GOOGLE ADS AUTOMATION
═══════════════════════════════════════════════════════════

📋 Settings:
   • Mode: 🔍 PREVIEW (no changes)
   • Pause if CPA > $100
   • Pause if CTR < 1%
   • Scale if ROAS > 3x

📊 Results:
   • Campaigns analyzed: 8
   • Actions to take: 2

📋 Actions to be taken:

   ⏸️ PAUSE: Generic Keywords - Broad
      └─ High CPA: $145.00 (threshold: $100)

   📈 INCREASE_BUDGET: Brand - Exact Match
      └─ High ROAS: 5.20x (threshold: 3x)
      └─ Budget: $50.00 → $60.00

✅ Preview complete. No changes were made.
```

---

## Step 7: Go Live!

Once you're happy with the preview:

1. Change this line to `false`:
   ```javascript
   PREVIEW_MODE: false,
   ```
2. Click **"Preview"** one more time to confirm
3. Click **"Run"** to execute the changes
4. Check the Logs to see "Changes applied"

---

## Step 8: Schedule Daily Runs

Set up the script to run automatically every day:

1. Click **"Save"** (name it "Campaign Automation")
2. Close the script editor
3. Find your script in the Scripts list
4. Click the **pencil icon** ✏️ next to "Frequency"
5. Select **"Daily"**
6. Choose a time (we recommend **6:00 AM**)
7. Click **"Save"**

**🎉 Done! Your automation is now running every day!**

---

## 📊 Optional: Add Google Sheets Logging

Keep a permanent record of all changes:

### Create Your Log Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a **new blank spreadsheet**
3. Name it "Google Ads Automation Log"
4. Copy the URL from your browser's address bar

### Add the URL to Your Script

1. Open your script in Google Ads
2. Find this line:
   ```javascript
   GOOGLE_SHEET_URL: '',
   ```
3. Paste your sheet URL:
   ```javascript
   GOOGLE_SHEET_URL: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit',
   ```
4. Save and run the script
5. Check your sheet — you'll see an "Automation Log" tab!

---

## 🛡️ Safety Features

This script includes multiple safety features:

| Feature | What It Does |
|---------|--------------|
| **Preview Mode** | Test without making any changes |
| **Minimum Spend** | Won't judge campaigns until they have enough data |
| **Maximum Budget Cap** | Never increases budget beyond your limit |
| **Campaign Filters** | Optionally only automate certain campaigns |
| **Email Alerts** | Know exactly what changed |
| **Google Sheets Log** | Complete audit trail |

---

## ❓ Troubleshooting

### "Authorization required"
Click "Authorize", sign in, and click "Allow".

### "No campaigns found"
- Make sure you have active campaigns with impressions
- Check that conversion tracking is set up
- Verify the date range has data

### "Changes not applying"
- Confirm `PREVIEW_MODE` is set to `false`
- Make sure you have edit access to the account
- Check the Logs for error messages

### "Script takes too long"
Large accounts may timeout. Add campaign filters to process fewer campaigns at a time.

### "Email not sending"
Google Ads scripts can only email the account owner. Make sure you're using your own email.

---

## 🔧 Advanced: Campaign Filters

### Only Automate Search Campaigns
```javascript
ONLY_CAMPAIGNS_CONTAINING: 'Search',
```

### Protect Brand Campaigns
```javascript
EXCLUDE_CAMPAIGNS_CONTAINING: 'Brand',
```

### Only Automate Specific Client
```javascript
ONLY_CAMPAIGNS_CONTAINING: 'ClientName',
```

---

## 📁 Other Files in This Repository

| File | Description | Who It's For |
|------|-------------|--------------|
| `google-ads-scripts/CampaignAutomation.js` | Main automation script | Everyone |
| `google-apps-script/GoogleAdsAutomation.gs` | Google Sheets version | Spreadsheet users |
| `*.py` | Python scripts | Developers |
| `tests/` | Unit tests | Developers |

---

## 🔗 Related Automation Scripts

| Script | What It Does |
|--------|--------------|
| [Bid Optimization](https://github.com/gordongeraghty/google-ads-bid-optimization) | Automatically adjust keyword bids |
| [Keyword Management](https://github.com/gordongeraghty/google-ads-keyword-management) | Find new keywords, add negatives |
| [Quality Control](https://github.com/gordongeraghty/google-ads-quality-control) | Check naming conventions |
| [Reporting](https://github.com/gordongeraghty/google-ads-reporting-analytics) | Daily performance reports |

---

## 📞 Need Help?

- **Email:** gordon@empireamplify.com.au
- **Issues:** [Open a GitHub issue](https://github.com/gordongeraghty/google-ads-automation/issues)
- **Location:** Melbourne, Australia

---

## 📄 License

MIT License - Free to use and modify.

**Empire Amplify** | Melbourne, Australia | 2025
