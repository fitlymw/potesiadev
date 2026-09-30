/**
 * Google Apps Script — Matrix Reasoning response log (optional)
 *
 * Stores anonymous test results in a Google Sheet so the items can later be
 * calibrated (real difficulty per level) and norms can be built. Players only
 * send data when they tick the consent checkbox; no personal data is sent.
 *
 * SETUP:
 * 1. Create a Google Sheet, then Extensions > Apps Script.
 * 2. Paste this file into the editor and save.
 * 3. Deploy > New deployment > type "Web app".
 *    Execute as: Me · Who has access: Anyone.
 * 4. Copy the Web App URL into app/.env as VITE_IQ_LOG_URL=<url>
 *    and rebuild (npm run build).
 *
 * Each row: timestamp, attempt, language, theta, se, score, correct, total,
 * then the full response list as JSON. Every response includes the item's
 * level and seed, so the exact puzzle can be regenerated for item analysis.
 */

const SHEET_NAME = 'responses';
const HEADER = ['timestamp', 'attempt', 'lang', 'theta', 'se', 'score', 'correct', 'total', 'version', 'responses_json'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const responses = Array.isArray(data.responses) ? data.responses : [];
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.attempt || '',
      data.lang || '',
      data.theta,
      data.se,
      data.score,
      responses.filter(function (r) { return r.correct; }).length,
      responses.length,
      data.version || '',
      JSON.stringify(responses),
    ]);
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
