// Code.gs (referencia)
const SHEET_NAME = "Leads";
const HEADER = ["timestamp", "email", "studio", "igweb", "qualified", "source"];

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet_(ss, SHEET_NAME);
    ensureHeader_(sheet);

    const data = parseBody_(e);
    const ts = new Date();

    sheet.appendRow([
      ts.toISOString(),
      safe_(data.email),
      safe_(data.studio),
      safe_(data.igweb),
      String(Boolean(data.qualified)),
      safe_(data.source),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    const raw = e.postData.contents;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return Object.fromEntries(
        raw.split("&").map(kv => kv.split("=").map(decodeURIComponent))
      );
    }
  }
  return {};
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeader_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADER.length).getValues()[0];
  const isEmpty = firstRow.every(v => !v);
  if (isEmpty) sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
}

function safe_(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}
