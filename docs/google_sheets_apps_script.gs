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
const SALES_SHEET_NAME = 'sales'
const BOOKS_SHEET_NAME = 'books'
const COFFEES_SHEET_NAME = 'coffees'

function getSheet(ss, name){
  let sheet = ss.getSheetByName(name)
  if(!sheet){
    sheet = ss.insertSheet(name)
  }
  return sheet
}

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

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID)

    if(Array.isArray(payload.books)){
      const sheet = getSheet(ss, BOOKS_SHEET_NAME)
      sheet.clearContents()
      const rows = [['id','name','price','category']]
      payload.books.forEach(book => {
        rows.push([book.id||'', book.name||'', book.price||'', book.category||''])
      })
      if(rows.length > 0){
        sheet.getRange(1,1,rows.length, rows[0].length).setValues(rows)
      }
      return _json({status:'ok', books: payload.books.length})
    }

    if(Array.isArray(payload.coffees)){
      const sheet = getSheet(ss, COFFEES_SHEET_NAME)
      sheet.clearContents()
      const rows = [['id','name','price','size']]
      payload.coffees.forEach(coffee => {
        rows.push([coffee.id||'', coffee.name||'', coffee.price||'', coffee.size||''])
      })
      if(rows.length > 0){
        sheet.getRange(1,1,rows.length, rows[0].length).setValues(rows)
      }
      return _json({status:'ok', coffees: payload.coffees.length})
    }

    const sales = payload.sales || []
    if(payload.clear){
      const sheet = getSheet(ss, SALES_SHEET_NAME)
      const last = sheet.getLastRow()
      if(last > 1){
        sheet.getRange(2,1,last-1,sheet.getLastColumn()).clearContent()
      }
      return _json({status:'ok', cleared: true})
    }

    const sheet = getSheet(ss, SALES_SHEET_NAME)
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
  const type = (e.parameter.type || '').toLowerCase()
  if(type === 'books'){
    try{
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
      const sheet = getSheet(ss, BOOKS_SHEET_NAME)
      const data = sheet.getDataRange().getValues()
      const books = []
      const headers = data[0] || []
      const idIndex = headers.indexOf('id')
      const nameIndex = headers.indexOf('name')
      const priceIndex = headers.indexOf('price')
      const categoryIndex = headers.indexOf('category')
      for(let i=1;i<data.length;i++){
        const row = data[i]
        if(!row || row.length === 0) continue
        books.push({
          id: row[idIndex] || '',
          name: row[nameIndex] || '',
          price: Number(row[priceIndex] || 0),
          category: row[categoryIndex] || ''
        })
      }
      return _json({status:'ok', books})
    }catch(err){
      return _json({error: err.message})
    }
  }

  if(type === 'coffees'){
    try{
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
      const sheet = getSheet(ss, COFFEES_SHEET_NAME)
      const data = sheet.getDataRange().getValues()
      const coffees = []
      const headers = data[0] || []
      const idIndex = headers.indexOf('id')
      const nameIndex = headers.indexOf('name')
      const priceIndex = headers.indexOf('price')
      const sizeIndex = headers.indexOf('size')
      for(let i=1;i<data.length;i++){
        const row = data[i]
        if(!row || row.length === 0) continue
        coffees.push({
          id: row[idIndex] || '',
          name: row[nameIndex] || '',
          price: Number(row[priceIndex] || 0),
          size: row[sizeIndex] || ''
        })
      }
      return _json({status:'ok', coffees})
    }catch(err){
      return _json({error: err.message})
    }
  }
  return _json({status: 'ok', message: 'Apps Script reachable'})
}

function _json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
