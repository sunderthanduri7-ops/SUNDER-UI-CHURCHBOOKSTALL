/**
 * Google Apps Script to receive sales JSON and append to a Sheet.
 *
 * Usage:
 * 1. Create a Google Spreadsheet and note its ID (from the URL).
 * 2. Create a new Apps Script project, paste this code, set `SPREADSHEET_ID`.
 * 3. Deploy -> New deployment -> Select "Web app" -> Execute as: Me -> Who has access: Anyone
 * 4. Use the deployed URL as the endpoint in the app.
 */

const SPREADSHEET_ID = '1iGFk4GIwiEihxomDH0x21_PiXjyuPZpLIORAb0bYWYg'

function doPost(e){
  try{
    if(!e.postData || !e.postData.contents) return _json({error:'no payload'})
    let payload = null
    try{
      payload = JSON.parse(e.postData.contents)
    }catch(err){
      // maybe form-encoded like 'payload=%7B...%7D'
      try{
        const raw = e.postData.contents
        const m = raw.match(/payload=(.*)$/)
        if(m && m[1]){
          payload = JSON.parse(decodeURIComponent(m[1]))
        }
      }catch(e2){
        throw new Error('Unable to parse postData contents')
      }
    }
    const sales = payload.sales || []
    // handle clear request
    if(payload.clear){
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
      const sheet = ss.getSheets()[0]
      // clear all content but keep header row if present
      const last = sheet.getLastRow()
      if(last > 1){
        sheet.getRange(2,1,last-1,sheet.getLastColumn()).clearContent()
      }
      return _json({status:'ok', cleared: true})
    }
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
    const sheet = ss.getSheets()[0]
    sales.forEach(sale => {
      const bill = sale.billNumber || ''
      const date = sale.date || ''
      const type = sale.type || ''
      const total = sale.total || ''
      const items = (sale.items || []).map(i=> (i.name||i.title||'') + ' x' + (i.qty||1)).join(' | ')
      sheet.appendRow([bill, date, type, items, total])
    })
    return _json({status:'ok', appended: sales.length})
  }catch(err){
    return _json({error: err.message})
  }
}

function doGet(e){
  // simple health check to verify deployment and reachability
  return _json({status: 'ok', message: 'Apps Script reachable'})
}

function _json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
