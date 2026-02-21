/**
 * Google Apps Script — RSVP + Reactions Backend
 * Rita & Bruno Wedding
 *
 * SETUP:
 * 1. Create a Google Sheet named "RSVP - Rita & Bruno"
 * 2. First tab: headers in row 1: Timestamp | Nome | Email | Adultos | Crianças | Restrições | Presença | Mensagem
 * 3. Second tab named "Reactions": headers in row 1: Emoji | Count
 *    Add rows: heart 0, champagne 0, party 0, sparkles 0, ring 0
 * 4. Go to Extensions → Apps Script → paste this code
 * 5. Deploy → Web App → Execute as "Me", Access "Anyone"
 * 6. Copy the deployment URL and paste it into main.js (APPS_SCRIPT_URL)
 */

// Optional: set your email to receive notifications
var NOTIFY_EMAIL = ''; // e.g. 'rita.bruno@email.com'

/* -------------------------------------------------
   doGet — Returns reaction counts
   ------------------------------------------------- */
function doGet(e) {
  try {
    var type = (e && e.parameter && e.parameter.type) || '';

    if (type === 'reactions') {
      return getReactions();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: 'Use POST method for RSVP' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* -------------------------------------------------
   doPost — Routes between RSVP and Reactions
   ------------------------------------------------- */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.type === 'reaction') {
      return handleReaction(data);
    }

    // Default: RSVP
    return handleRSVP(data);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* -------------------------------------------------
   RSVP handler
   ------------------------------------------------- */
function handleRSVP(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.appendRow([
    new Date(),             // Timestamp
    data.nome || '',        // Nome
    data.email || '',       // Email
    data.adultos || '',     // Adultos
    data.criancas || '0',   // Crianças
    data.restricoes || '',  // Restrições alimentares
    data.presenca || '',    // Presença (Sim/Não)
    data.mensagem || '',    // Mensagem
  ]);

  // Optional email notification
  if (NOTIFY_EMAIL) {
    var subject = 'Novo RSVP: ' + (data.nome || 'Sem nome');
    var body = 'Nome: ' + data.nome + '\n'
      + 'Email: ' + data.email + '\n'
      + 'Adultos: ' + data.adultos + '\n'
      + 'Crianças: ' + data.criancas + '\n'
      + 'Restrições: ' + (data.restricoes || 'Nenhuma') + '\n'
      + 'Presença: ' + data.presenca + '\n'
      + 'Mensagem: ' + (data.mensagem || '-');
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* -------------------------------------------------
   Reactions: get all counts
   ------------------------------------------------- */
function getReactions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reactions');
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: 'Reactions sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var counts = {};

  // Skip header row (row 0)
  for (var i = 1; i < data.length; i++) {
    counts[data[i][0]] = Number(data[i][1]) || 0;
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success', counts: counts }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* -------------------------------------------------
   Reactions: add or remove a reaction
   ------------------------------------------------- */
function handleReaction(data) {
  var emoji = data.emoji;
  var action = data.action; // "add" or "remove"

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reactions');
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: 'Reactions sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var rows = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === emoji) {
      rowIndex = i + 1; // Sheets is 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: 'Unknown emoji: ' + emoji }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var currentCount = Number(sheet.getRange(rowIndex, 2).getValue()) || 0;

  if (action === 'add') {
    currentCount += 1;
  } else if (action === 'remove') {
    currentCount = Math.max(0, currentCount - 1);
  }

  sheet.getRange(rowIndex, 2).setValue(currentCount);

  // Return all updated counts
  return getReactions();
}
