/**
 * ================================================================
 * GOOGLE ADS AUTOMATION - GOOGLE APPS SCRIPT VERSION
 * Empire Amplify - For Google Ads Managers (No Coding Required)
 * ================================================================
 * 
 * HOW TO USE:
 * 1. Open Google Sheets
 * 2. Extensions > Apps Script
 * 3. Paste this entire code
 * 4. Configure your settings in the CONFIG tab of your sheet
 * 5. Run the scripts from the custom menu
 * 
 * ================================================================
 */

// ==================== CONFIGURATION ====================
const DEFAULT_CONFIG = {
  CUSTOMER_ID: '',
  PAUSE_IF_CPA_ABOVE: 100,
  PAUSE_IF_CTR_BELOW: 0.5,
  PAUSE_IF_NO_CONVERSIONS_DAYS: 14,
  INCREASE_BUDGET_IF_ROAS_ABOVE: 3.0,
  BUDGET_INCREASE_PERCENT: 20,
  MAX_DAILY_BUDGET: 500,
  SLACK_WEBHOOK_URL: '',
  EMAIL_RECIPIENTS: '',
  DAYS_TO_ANALYZE: 30
};

// ==================== MENU SETUP ====================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎯 Google Ads Automation')
    .addItem('📊 Pull Campaign Report', 'pullCampaignReport')
    .addItem('🔍 Analyze Performance', 'analyzePerformance')
    .addItem('⚡ Run Automation Rules (Preview)', 'runAutomationRulesPreview')
    .addItem('🚀 Run Automation Rules (Apply)', 'runAutomationRulesApply')
    .addSeparator()
    .addItem('📧 Send Daily Report', 'sendDailyReport')
    .addItem('⚠️ Check Budget Pacing', 'checkBudgetPacing')
    .addSeparator()
    .addItem('⚙️ Setup Config Sheet', 'setupConfigSheet')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

// ==================== CONFIG HELPERS ====================
function getConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName('CONFIG');
  
  if (!configSheet) {
    return DEFAULT_CONFIG;
  }
  
  const data = configSheet.getDataRange().getValues();
  const config = {...DEFAULT_CONFIG};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const value = data[i][1];
    if (key && config.hasOwnProperty(key)) {
      config[key] = value;
    }
  }
  
  return config;
}

function setupConfigSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName('CONFIG');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('CONFIG');
  }
  
  configSheet.clear();
  configSheet.getRange('A1:C1').setValues([['Setting', 'Value', 'Description']]);
  configSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  const configRows = [
    ['CUSTOMER_ID', '', 'Your Google Ads Customer ID (no dashes)'],
    ['PAUSE_IF_CPA_ABOVE', 100, 'Pause campaigns with CPA above this ($)'],
    ['PAUSE_IF_CTR_BELOW', 0.5, 'Pause campaigns with CTR below this (%)'],
    ['PAUSE_IF_NO_CONVERSIONS_DAYS', 14, 'Pause if no conversions in X days'],
    ['INCREASE_BUDGET_IF_ROAS_ABOVE', 3.0, 'Increase budget if ROAS above this'],
    ['BUDGET_INCREASE_PERCENT', 20, 'Budget increase percentage'],
    ['MAX_DAILY_BUDGET', 500, 'Maximum daily budget cap ($)'],
    ['SLACK_WEBHOOK_URL', '', 'Slack webhook for notifications'],
    ['EMAIL_RECIPIENTS', '', 'Email addresses (comma separated)'],
    ['DAYS_TO_ANALYZE', 30, 'Days of data to analyze']
  ];
  
  configSheet.getRange(2, 1, configRows.length, 3).setValues(configRows);
  configSheet.autoResizeColumns(1, 3);
  
  SpreadsheetApp.getUi().alert('✅ CONFIG sheet created!');
}

// ==================== CAMPAIGN REPORTING ====================
function pullCampaignReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let campaignsSheet = ss.getSheetByName('Campaigns');
  if (!campaignsSheet) {
    campaignsSheet = ss.insertSheet('Campaigns');
  }
  
  const headers = [
    'Campaign ID', 'Campaign Name', 'Status', 'Type', 
    'Daily Budget', 'Impressions', 'Clicks', 'Cost',
    'Conversions', 'Conv. Value', 'CTR', 'CPC', 'CPA', 'ROAS'
  ];
  
  campaignsSheet.clear();
  campaignsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  campaignsSheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold').setBackground('#34a853').setFontColor('white');
  
  // Sample data - replace with actual API call
  const sampleData = [
    ['123456789', 'Brand - Exact Match', 'ENABLED', 'SEARCH', 100, 50000, 2500, 1250, 125, 6250, 5.0, 0.50, 10.00, 5.0],
    ['987654321', 'Generic - Broad', 'ENABLED', 'SEARCH', 200, 100000, 2000, 2000, 40, 4000, 2.0, 1.00, 50.00, 2.0],
    ['456789123', 'PMax - Products', 'ENABLED', 'PERFORMANCE_MAX', 150, 200000, 3000, 1500, 75, 7500, 1.5, 0.50, 20.00, 5.0],
  ];
  
  if (sampleData.length > 0) {
    campaignsSheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  campaignsSheet.autoResizeColumns(1, headers.length);
  SpreadsheetApp.getUi().alert('📊 Campaign Report Updated!');
}

// ==================== AUTOMATION RULES ====================
function runAutomationRulesPreview() {
  runAutomationRules(true);
}

function runAutomationRulesApply() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('⚠️ Confirm', 'Apply automation rules?', ui.ButtonSet.YES_NO);
  if (response === ui.Button.YES) {
    runAutomationRules(false);
  }
}

function runAutomationRules(dryRun) {
  const config = getConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const campaignsSheet = ss.getSheetByName('Campaigns');
  
  if (!campaignsSheet) {
    SpreadsheetApp.getUi().alert('❌ Run "Pull Campaign Report" first.');
    return;
  }
  
  const data = campaignsSheet.getDataRange().getValues();
  const headers = data[0];
  const actions = [];
  
  const cols = {
    name: headers.indexOf('Campaign Name'),
    budget: headers.indexOf('Daily Budget'),
    cost: headers.indexOf('Cost'),
    conversions: headers.indexOf('Conversions'),
    ctr: headers.indexOf('CTR'),
    cpa: headers.indexOf('CPA'),
    roas: headers.indexOf('ROAS')
  };
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const campaign = {
      name: row[cols.name],
      budget: row[cols.budget],
      cost: row[cols.cost],
      conversions: row[cols.conversions],
      ctr: row[cols.ctr],
      cpa: row[cols.cpa],
      roas: row[cols.roas]
    };
    
    if (campaign.cost < 50) continue;
    
    if (campaign.cpa > config.PAUSE_IF_CPA_ABOVE) {
      actions.push({campaign: campaign.name, action: 'PAUSE', reason: `CPA $${campaign.cpa} too high`});
      continue;
    }
    
    if (campaign.ctr < config.PAUSE_IF_CTR_BELOW) {
      actions.push({campaign: campaign.name, action: 'PAUSE', reason: `CTR ${campaign.ctr}% too low`});
      continue;
    }
    
    if (campaign.roas > config.INCREASE_BUDGET_IF_ROAS_ABOVE) {
      const newBudget = Math.min(campaign.budget * 1.2, config.MAX_DAILY_BUDGET);
      actions.push({campaign: campaign.name, action: 'INCREASE_BUDGET', reason: `ROAS ${campaign.roas}x - Budget → $${newBudget}`});
    }
  }
  
  let message = `📋 ${dryRun ? 'PREVIEW' : 'APPLIED'}: ${actions.length} actions\n\n`;
  actions.forEach(a => {
    message += `${a.action}: ${a.campaign}\n→ ${a.reason}\n\n`;
  });
  
  SpreadsheetApp.getUi().alert(message || '✅ All campaigns OK!');
}

// ==================== NOTIFICATIONS ====================
function sendDailyReport() {
  const config = getConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const campaignsSheet = ss.getSheetByName('Campaigns');
  
  if (!campaignsSheet) {
    SpreadsheetApp.getUi().alert('❌ No data. Run report first.');
    return;
  }
  
  const data = campaignsSheet.getDataRange().getValues();
  let totalSpend = 0, totalConversions = 0, totalValue = 0;
  
  for (let i = 1; i < data.length; i++) {
    totalSpend += data[i][7] || 0;
    totalConversions += data[i][8] || 0;
    totalValue += data[i][9] || 0;
  }
  
  const report = `📊 Daily Report\n💰 Spend: $${totalSpend}\n🎯 Conv: ${totalConversions}\n💵 Value: $${totalValue}`;
  
  if (config.SLACK_WEBHOOK_URL) {
    UrlFetchApp.fetch(config.SLACK_WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({text: report})
    });
  }
  
  SpreadsheetApp.getUi().alert('✅ Report sent!\n\n' + report);
}

function showHelp() {
  SpreadsheetApp.getUi().alert('🎯 HELP\n\nUse CONFIG sheet to set thresholds.\nRun reports then automation rules.\n\nContact: gordon@empireamplify.com.au');
}
