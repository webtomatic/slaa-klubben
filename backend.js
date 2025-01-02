// Backed by Google Sheets (Apps Script)

function doPost(e) {
  try {
    const sheetName = "Gennemførsler"; // Replace with the name of your primary sheet for POST updates
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Arket med navnet '${sheetName}' blev ikke fundet`);
    }

    const data = JSON.parse(e.postData.contents);
    const deviceId = data.device_id;
    const userName = data.user_name
    const climb = data.climb
    const climbCompletion = data.completion

    const currentTime = new Date();

    const numRows = sheet.getLastRow() - 1;
    const values = numRows > 0 ? sheet.getRange(2, 1, numRows, sheet.getLastColumn()).getValues() : [];

    let updated = false;

    // Update or append logic
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === deviceId && values[i][1] === userName && values[i][2] === climb) { // Assuming the key is in the first column
        if (climbCompletion !== null) {
          sheet.getRange(i + 2, 3).setValue(climb);
          sheet.getRange(i + 2, 4).setValue(climbCompletion);
          sheet.getRange(i + 2, 5).setValue(currentTime);
        } else {
          sheet.getRange(i + 2, 1).setValue(null);
          sheet.getRange(i + 2, 2).setValue(null);
          sheet.getRange(i + 2, 3).setValue(null);
          sheet.getRange(i + 2, 4).setValue(null);
          sheet.getRange(i + 2, 5).setValue(null);
        }
        updated = true;
        break;
      }
    }

    if (!updated) {
      sheet.appendRow([deviceId, userName, climb, climbCompletion, currentTime]); // If no match, append to the sheet
    }

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }

}

function doGet(e) {
  try {

    const action = e.parameter.action
    if (!action) {
      return err('No action specified.')
    }

    switch (action) {

      case "climbs":
        const climbs = getClimbs()
        return jsonOut(climbs)

      case 'completion':
        const completion = getCompletion()
        return jsonOut(completion)

      default:
        return err('Unknown action: ' + action)

    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function requireParam(e, name) {
  if (!e.hasOwnProperty('name')) {
    throw new Error('Required parameter missing: ' + name)
  }
}

function err(text) {
  return ContentService.createTextOutput(JSON.stringify({success: false, text}))
    .setMimeType(ContentService.MimeType.TEXT)
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify({success: true, data}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getClimbs() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const mergeClimbSheetsNames = ['Ruter', 'Problemer'];
  const sheetNameToType = {Ruter: 'route', Problemer: 'problem'}
  const climbs = [];

  for (const sheetName of mergeClimbSheetsNames) {
    const sheet = spreadsheet.getSheetByName(sheetName)
    if (!sheet) {
      throw new Error(`Arket med navnet '${sheetName}' blev ikke fundet`);
    }
    const pointOffset = 2;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
    const pointHeaders = headers[0].slice(pointOffset)

    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
    for (const val of values) {
      const climb = {
        id: val[0],
        name: val[1],
        type: sheetNameToType[sheetName],
        points: [],
      }

      for (let i = pointOffset; i < val.length; i++) {
        climb.points.push({key: pointHeaders[i - pointOffset], value: val[i]})
      }

      climbs.push(climb)
    }

  }


  return climbs;
}

function getCompletion() {
  const sheetName = "Gennemførsler"; // Replace with the name of your primary sheet for POST updates
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Arket med navnet '${sheetName}' blev ikke fundet`);
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
  const completion = []
  for (const val of values) {
    const c = {
      device_id: val[0],
      user_name: val[1],
      climb: val[2],
      completion: val[3],
    }

    completion.push(c)
  }

  return completion
}
