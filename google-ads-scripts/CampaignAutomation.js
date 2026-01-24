/**
 * =====================================================================
 * GOOGLE ADS CAMPAIGN AUTOMATION SCRIPT
 * Empire Amplify - Automated Campaign Management
 * =====================================================================
 * 
 * WHAT THIS SCRIPT DOES:
 * ✅ Monitors all your campaigns automatically
 * ✅ Pauses campaigns with high CPA (cost per conversion)
 * ✅ Pauses campaigns with low CTR (poor performance)
 * ✅ Increases budget for high ROAS campaigns (winners)
 * ✅ Sends you email alerts when changes happen
 * ✅ Logs everything to Google Sheets for your records
 * 
 * SETUP TIME: 15 minutes
 * DIFFICULTY: Easy (no coding required)
 * 
 * =====================================================================
 * HOW TO SET UP (Step-by-Step):
 * =====================================================================
 * 
 * STEP 1: Copy this entire script (Ctrl+A, then Ctrl+C)
 * 
 * STEP 2: Go to Google Ads
 *         - Click "Tools & Settings" (wrench icon)
 *         - Click "Scripts" under Bulk Actions
 * 
 * STEP 3: Click the blue "+" button to create new script
 * 
 * STEP 4: Delete any default code, paste this script (Ctrl+V)
 * 
 * STEP 5: Edit the SETTINGS section below with your values
 * 
 * STEP 6: Click "Preview" to test (no changes will be made)
 * 
 * STEP 7: Click "Run" when ready to execute
 * 
 * STEP 8: Schedule to run daily (recommended)
 * 
 * =====================================================================
 */


// =====================================================================
// ⚙️ SETTINGS - EDIT THESE VALUES FOR YOUR ACCOUNT
// =====================================================================

var SETTINGS = {
  
  // =========================================
  // 📧 YOUR EMAIL (for alerts)
  // =========================================
  // Enter your email address to receive alerts when changes are made
  // Example: 'john@company.com'
  // Leave blank '' to skip email alerts
  
  EMAIL: '',
  
  
  // =========================================
  // 📊 YOUR GOOGLE SHEET (for logging)
  // =========================================
  // Create a new Google Sheet, copy the URL, paste here
  // Example: 'https://docs.google.com/spreadsheets/d/abc123/edit'
  // Leave blank '' to skip logging
  
  GOOGLE_SHEET_URL: '',
  
  
  // =========================================
  // 🎯 AUTOMATION RULES
  // =========================================
  
  // PAUSE if Cost Per Acquisition is above this amount
  // 💡 Tip: Set this to your target CPA + 30%
  // Example: If your target CPA is $50, set this to 65
  PAUSE_CPA_ABOVE: 100,
  
  // PAUSE if Click-Through Rate is below this percentage
  // 💡 Tip: Most Search campaigns should have CTR above 2%
  // Use 0.5 for Display campaigns
  PAUSE_CTR_BELOW: 1.0,
  
  // INCREASE BUDGET if ROAS (Return on Ad Spend) is above this
  // 💡 Tip: ROAS of 3 means $3 revenue for every $1 spent
  INCREASE_BUDGET_ROAS_ABOVE: 3.0,
  
  // How much to increase budget by (percentage)
  // 💡 Tip: 20% is conservative, 50% is aggressive
  BUDGET_INCREASE_PERCENT: 20,
  
  // Never increase budget above this amount
  MAX_BUDGET: 500,
  
  
  // =========================================
  // 🔒 SAFETY SETTINGS
  // =========================================
  
  // Minimum spend before making decisions (don't judge too early)
  // 💡 Tip: Set this to at least 2x your target CPA
  MIN_SPEND_TO_EVALUATE: 50,
  
  // Days of data to analyze
  // 💡 Tip: 14 days for most accounts, 30 days for low-volume
  DAYS_TO_ANALYZE: 14,
  
  // PREVIEW MODE: Set to true to TEST without making changes
  // ⚠️ IMPORTANT: Always test with true first!
  // Change to false when ready to automate
  PREVIEW_MODE: true,
  
  
  // =========================================
  // 🏷️ CAMPAIGN FILTERS (Optional)
  // =========================================
  
  // Only automate campaigns containing this text
  // Example: 'Search' to only automate Search campaigns
  // Leave blank '' to include all campaigns
  ONLY_CAMPAIGNS_CONTAINING: '',
  
  // Never automate campaigns containing this text
  // Example: 'Brand' to protect brand campaigns
  // Leave blank '' to not exclude any
  EXCLUDE_CAMPAIGNS_CONTAINING: ''
};


// =====================================================================
// 🚀 MAIN SCRIPT - DO NOT EDIT BELOW THIS LINE
// =====================================================================

function main() {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('   EMPIRE AMPLIFY - GOOGLE ADS AUTOMATION');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('📋 Settings:');
  Logger.log('   • Mode: ' + (SETTINGS.PREVIEW_MODE ? '🔍 PREVIEW (no changes)' : '🚀 LIVE (applying changes)'));
  Logger.log('   • Pause if CPA > $' + SETTINGS.PAUSE_CPA_ABOVE);
  Logger.log('   • Pause if CTR < ' + SETTINGS.PAUSE_CTR_BELOW + '%');
  Logger.log('   • Scale if ROAS > ' + SETTINGS.INCREASE_BUDGET_ROAS_ABOVE + 'x');
  Logger.log('   • Analyzing last ' + SETTINGS.DAYS_TO_ANALYZE + ' days');
  Logger.log('');
  
  var campaigns = getCampaignData();
  var actions = evaluateCampaigns(campaigns);
  
  Logger.log('');
  Logger.log('📊 Results:');
  Logger.log('   • Campaigns analyzed: ' + campaigns.length);
  Logger.log('   • Actions to take: ' + actions.length);
  Logger.log('');
  
  if (actions.length > 0) {
    displayActions(actions);
    
    if (!SETTINGS.PREVIEW_MODE) {
      applyActions(actions);
    }
    
    logToGoogleSheet(actions);
    sendEmailAlert(actions);
  } else {
    Logger.log('✅ All campaigns are performing within your thresholds!');
    Logger.log('   No changes needed.');
  }
  
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('   SCRIPT COMPLETE');
  Logger.log('═══════════════════════════════════════════════════════════');
}

function getCampaignData() {
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - SETTINGS.DAYS_TO_ANALYZE);
  
  var dateRange = Utilities.formatDate(startDate, 'GMT', 'yyyyMMdd') + ',' +
                  Utilities.formatDate(endDate, 'GMT', 'yyyyMMdd');
  
  var query = 
    'SELECT ' +
    '  campaign.id, ' +
    '  campaign.name, ' +
    '  campaign.status, ' +
    '  campaign_budget.amount_micros, ' +
    '  metrics.impressions, ' +
    '  metrics.clicks, ' +
    '  metrics.cost_micros, ' +
    '  metrics.conversions, ' +
    '  metrics.conversions_value ' +
    'FROM campaign ' +
    'WHERE campaign.status = "ENABLED" ' +
    '  AND metrics.impressions > 100 ' +
    '  AND segments.date DURING LAST_' + SETTINGS.DAYS_TO_ANALYZE + '_DAYS';
  
  var campaigns = [];
  
  try {
    var report = AdsApp.report(query);
    var rows = report.rows();
    
    while (rows.hasNext()) {
      var row = rows.next();
      var name = row['campaign.name'];
      
      // Apply filters
      if (SETTINGS.ONLY_CAMPAIGNS_CONTAINING && 
          name.toLowerCase().indexOf(SETTINGS.ONLY_CAMPAIGNS_CONTAINING.toLowerCase()) === -1) {
        continue;
      }
      if (SETTINGS.EXCLUDE_CAMPAIGNS_CONTAINING && 
          name.toLowerCase().indexOf(SETTINGS.EXCLUDE_CAMPAIGNS_CONTAINING.toLowerCase()) !== -1) {
        continue;
      }
      
      var cost = parseFloat(row['metrics.cost_micros']) / 1000000;
      var clicks = parseInt(row['metrics.clicks']) || 0;
      var impressions = parseInt(row['metrics.impressions']) || 0;
      var conversions = parseFloat(row['metrics.conversions']) || 0;
      var convValue = parseFloat(row['metrics.conversions_value']) || 0;
      var budget = parseFloat(row['campaign_budget.amount_micros']) / 1000000;
      
      campaigns.push({
        id: row['campaign.id'],
        name: name,
        budget: budget,
        cost: cost,
        clicks: clicks,
        impressions: impressions,
        conversions: conversions,
        convValue: convValue,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpa: conversions > 0 ? cost / conversions : null,
        roas: cost > 0 ? convValue / cost : 0
      });
    }
  } catch (e) {
    Logger.log('⚠️ Error getting campaign data: ' + e.message);
  }
  
  return campaigns;
}

function evaluateCampaigns(campaigns) {
  var actions = [];
  
  for (var i = 0; i < campaigns.length; i++) {
    var c = campaigns[i];
    
    // Skip if not enough spend
    if (c.cost < SETTINGS.MIN_SPEND_TO_EVALUATE) {
      continue;
    }
    
    // Rule 1: High CPA - Pause
    if (c.cpa !== null && c.cpa > SETTINGS.PAUSE_CPA_ABOVE) {
      actions.push({
        campaignId: c.id,
        campaignName: c.name,
        action: 'PAUSE',
        reason: 'High CPA: $' + c.cpa.toFixed(2) + ' (threshold: $' + SETTINGS.PAUSE_CPA_ABOVE + ')',
        icon: '⏸️',
        currentValue: c.cpa.toFixed(2),
        threshold: SETTINGS.PAUSE_CPA_ABOVE
      });
      continue;
    }
    
    // Rule 2: Low CTR - Pause
    if (c.ctr < SETTINGS.PAUSE_CTR_BELOW) {
      actions.push({
        campaignId: c.id,
        campaignName: c.name,
        action: 'PAUSE',
        reason: 'Low CTR: ' + c.ctr.toFixed(2) + '% (threshold: ' + SETTINGS.PAUSE_CTR_BELOW + '%)',
        icon: '⏸️',
        currentValue: c.ctr.toFixed(2) + '%',
        threshold: SETTINGS.PAUSE_CTR_BELOW + '%'
      });
      continue;
    }
    
    // Rule 3: High ROAS - Increase Budget
    if (c.roas > SETTINGS.INCREASE_BUDGET_ROAS_ABOVE && c.conversions >= 1) {
      var newBudget = Math.min(
        c.budget * (1 + SETTINGS.BUDGET_INCREASE_PERCENT / 100),
        SETTINGS.MAX_BUDGET
      );
      
      if (newBudget > c.budget) {
        actions.push({
          campaignId: c.id,
          campaignName: c.name,
          action: 'INCREASE_BUDGET',
          reason: 'High ROAS: ' + c.roas.toFixed(2) + 'x (threshold: ' + SETTINGS.INCREASE_BUDGET_ROAS_ABOVE + 'x)',
          icon: '📈',
          currentBudget: c.budget,
          newBudget: newBudget,
          currentValue: c.roas.toFixed(2) + 'x',
          threshold: SETTINGS.INCREASE_BUDGET_ROAS_ABOVE + 'x'
        });
      }
    }
  }
  
  return actions;
}

function displayActions(actions) {
  Logger.log('📋 Actions to be taken:');
  Logger.log('');
  
  for (var i = 0; i < actions.length; i++) {
    var a = actions[i];
    Logger.log('   ' + a.icon + ' ' + a.action + ': ' + a.campaignName);
    Logger.log('      └─ ' + a.reason);
    if (a.newBudget) {
      Logger.log('      └─ Budget: $' + a.currentBudget.toFixed(2) + ' → $' + a.newBudget.toFixed(2));
    }
    Logger.log('');
  }
}

function applyActions(actions) {
  Logger.log('🚀 Applying changes...');
  Logger.log('');
  
  for (var i = 0; i < actions.length; i++) {
    var a = actions[i];
    
    try {
      var campaignIterator = AdsApp.campaigns()
        .withCondition("campaign.id = '" + a.campaignId + "'")
        .get();
      
      if (campaignIterator.hasNext()) {
        var campaign = campaignIterator.next();
        
        if (a.action === 'PAUSE') {
          campaign.pause();
          Logger.log('   ✅ Paused: ' + a.campaignName);
        } else if (a.action === 'INCREASE_BUDGET') {
          campaign.getBudget().setAmount(a.newBudget);
          Logger.log('   ✅ Budget increased: ' + a.campaignName);
        }
      }
    } catch (e) {
      Logger.log('   ❌ Error with ' + a.campaignName + ': ' + e.message);
    }
  }
}

function logToGoogleSheet(actions) {
  if (!SETTINGS.GOOGLE_SHEET_URL) {
    return;
  }
  
  try {
    var ss = SpreadsheetApp.openByUrl(SETTINGS.GOOGLE_SHEET_URL);
    var sheet = ss.getSheetByName('Automation Log');
    
    if (!sheet) {
      sheet = ss.insertSheet('Automation Log');
      sheet.getRange('A1:F1').setValues([['Date/Time', 'Campaign', 'Action', 'Reason', 'Value', 'Status']]);
      sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      sheet.setFrozenRows(1);
    }
    
    var timestamp = new Date().toLocaleString();
    var status = SETTINGS.PREVIEW_MODE ? 'PREVIEW' : 'APPLIED';
    
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      sheet.appendRow([timestamp, a.campaignName, a.action, a.reason, a.currentValue, status]);
    }
    
    Logger.log('');
    Logger.log('📝 Logged ' + actions.length + ' actions to Google Sheet');
  } catch (e) {
    Logger.log('⚠️ Could not log to sheet: ' + e.message);
  }
}

function sendEmailAlert(actions) {
  if (!SETTINGS.EMAIL) {
    return;
  }
  
  var pauseCount = actions.filter(function(a) { return a.action === 'PAUSE'; }).length;
  var budgetCount = actions.filter(function(a) { return a.action === 'INCREASE_BUDGET'; }).length;
  
  var subject = '🎯 Google Ads Automation: ' + actions.length + ' Actions';
  if (SETTINGS.PREVIEW_MODE) {
    subject += ' (Preview Mode)';
  }
  
  var body = 'Google Ads Automation Report\n';
  body += '════════════════════════════════\n\n';
  body += 'Mode: ' + (SETTINGS.PREVIEW_MODE ? 'PREVIEW (no changes made)' : 'LIVE (changes applied)') + '\n';
  body += 'Date: ' + new Date().toLocaleString() + '\n\n';
  body += 'Summary:\n';
  body += '• Campaigns paused: ' + pauseCount + '\n';
  body += '• Budgets increased: ' + budgetCount + '\n\n';
  body += 'Details:\n';
  body += '────────────────────────────────\n\n';
  
  for (var i = 0; i < actions.length; i++) {
    var a = actions[i];
    body += (i + 1) + '. ' + a.action + ': ' + a.campaignName + '\n';
    body += '   Reason: ' + a.reason + '\n';
    if (a.newBudget) {
      body += '   Budget: $' + a.currentBudget.toFixed(2) + ' → $' + a.newBudget.toFixed(2) + '\n';
    }
    body += '\n';
  }
  
  body += '\n────────────────────────────────\n';
  body += 'Empire Amplify Automation\n';
  body += 'github.com/gordongeraghty/google-ads-automation\n';
  
  try {
    MailApp.sendEmail(SETTINGS.EMAIL, subject, body);
    Logger.log('');
    Logger.log('📧 Email alert sent to ' + SETTINGS.EMAIL);
  } catch (e) {
    Logger.log('⚠️ Could not send email: ' + e.message);
  }
}
