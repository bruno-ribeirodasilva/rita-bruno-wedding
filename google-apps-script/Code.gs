/**
 * Google Apps Script — RSVP Backend
 * Rita & Bruno Wedding
 *
 * SETUP:
 * 1. Create a Google Sheet named "RSVP - Rita & Bruno"
 * 2. Add headers in row 1: Timestamp | Nome | Email | Adultos | Crianças | Restrições | Presença | Mensagem
 * 3. Go to Extensions → Apps Script → paste this code
 * 4. Deploy → Web App → Execute as "Me", Access "Anyone"
 * 5. Copy the deployment URL and paste it into main.js (APPS_SCRIPT_URL)
 */

// Optional: set your email to receive notifications
var NOTIFY_EMAIL = ''; // e.g. 'rita.bruno@email.com'

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

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

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'error', message: 'Use POST method' }))
    .setMimeType(ContentService.MimeType.JSON);
}
