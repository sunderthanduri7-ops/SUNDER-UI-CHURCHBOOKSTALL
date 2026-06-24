export async function pingSheetsEndpoint(endpoint){
  if(!endpoint) throw new Error('Missing endpoint')
  const resp = await fetch(endpoint, { method: 'GET', mode: 'cors' })
  if(!resp.ok) throw new Error(`Ping failed: ${resp.status}`)
  return resp.json()
}

export async function syncSalesToSheets(endpoint, sales){
  if(!endpoint) throw new Error('Missing endpoint')
  try{
    // send as form-encoded to avoid CORS preflight (servers accept form-encoded and Apps Script will parse)
    const payload = new URLSearchParams()
    payload.append('payload', JSON.stringify({ sales }))
    const resp = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString()
    })
    // if server returns opaque response (no-cors) resp.ok may be false or response unusable
    if(!resp.ok){
      const text = await resp.text().catch(()=>'<no body>')
      throw new Error(`Sheets sync failed: ${resp.status} ${text}`)
    }
    return resp.json()
  }catch(err){
    // network/CORS errors end up here
    throw new Error(err.message || 'Network error')
  }
}

export async function clearSalesOnSheets(endpoint){
  if(!endpoint) throw new Error('Missing endpoint')
  try{
    const payload = new URLSearchParams()
    payload.append('payload', JSON.stringify({ clear: true }))
    const resp = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString()
    })
    if(!resp.ok){
      const text = await resp.text().catch(()=>'<no body>')
      throw new Error(`Clear failed: ${resp.status} ${text}`)
    }
    return resp.json()
  }catch(err){
    throw new Error(err.message || 'Network error')
  }
}
