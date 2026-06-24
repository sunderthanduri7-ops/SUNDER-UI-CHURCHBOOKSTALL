import React, {useEffect, useState} from 'react'
import { StorageService } from '../services/storageService'
import { showToast } from '../services/toastService'
import { generateUpiLink } from '../utils/upiGenerator'
import { syncSalesToSheets, DEFAULT_SHEETS_ENDPOINT } from '../services/sheetsService'
import generateBillNo from '../utils/generateBillNo'

function formatDate(d=new Date()){
  return d.toISOString().slice(0,10)
}

export default function Payment(){
  const [cart,setCart] = useState([])
  const [sales,setSales] = useState([])
  const [loading,setLoading] = useState(true)
  const [paidMsg,setPaidMsg] = useState('')

  const [showQr,setShowQr] = useState(false)
  const [qrImg,setQrImg] = useState('')
  const [role,setRole] = useState(StorageService.getUserRole())

  useEffect(()=>{
    setLoading(true)
    setCart(StorageService.getCart())
    setSales(StorageService.getSales())
    setRole(StorageService.getUserRole())
    setLoading(false)
  },[])

  const total = cart.reduce((s,it)=>s+it.price*it.qty,0)

  function openUpi(){
    const link = generateUpiLink(total)
    window.location.href = link
  }

  function isMobile(){
    if(typeof navigator === 'undefined') return false
    return /Mobi|Android|iPhone|iPad|Phone/i.test(navigator.userAgent)
  }

  

  function handlePay(){
    const link = generateUpiLink(total)
    if(isMobile()){
      // on mobile, open UPI link which should invoke installed UPI apps
      window.location.href = link
      return
    }
    // on desktop/laptop, show QR code
    const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(link)
    setQrImg(qr)
    setShowQr(true)
  }

  async function markAsPaid(){
    // ask customer mobile to produce a unique bill id across multiple browsers
    let mobile = ''
    try{ mobile = prompt('Enter customer mobile number') || '' }catch(e){ mobile = '' }
    const billNumber = generateBillNo(mobile)
    const date = formatDate()
    // determine sale type: books, coffee, or mixed
    let type = 'mixed'
    if(cart.length>0){
      const allBooks = cart.every(i=> i.category !== undefined)
      const allCoffee = cart.every(i=> i.size !== undefined)
      if(allBooks) type = 'books'
      else if(allCoffee) type = 'coffee'
    }
    const record = { billNumber, date, items: cart, total, type, mobile: mobile || '' }
    const updated = [...sales, record]
    StorageService.saveSales(updated)
    // update local state and notify other pages
    setSales(updated)
    window.dispatchEvent(new CustomEvent('salesUpdated'))
    StorageService.clearCart()
    setPaidMsg(`Saved ${billNumber}`)
    setCart([])
    showToast(`Saved ${billNumber}`)

    // try to auto-sync this new bill to Google Sheets (for all users)
    try{
      showToast('Syncing bill to Google Sheets...')
      await syncSalesToSheets(DEFAULT_SHEETS_ENDPOINT, [record])
      showToast('Bill synced to Google Sheets')
    }catch(err){
      // don't block the user — just notify
      showToast('Auto-sync failed: ' + (err.message || err))
    }
  }

  if(loading) return <div className="text-center py-5">Loading...</div>

  return (
    <div className="row">
      <div className="col-md-8">
        <h4>Payment</h4>
        {cart.length===0 && <p className="text-muted">Cart is empty. Add books from Sales Counter.</p>}
        {cart.map(it=> (
          <div key={it.id} className="d-flex justify-content-between my-2">
            <div>{it.name} x {it.qty}</div>
            <div>₹{it.price * it.qty}</div>
          </div>
        ))}
        <hr/>
        <div className="d-flex justify-content-between mb-3">
          <strong>Total</strong>
          <strong>₹{total}</strong>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handlePay} disabled={cart.length===0}>Pay via UPI</button>
          <button className="btn btn-success" onClick={markAsPaid} disabled={cart.length===0}>Mark As Paid</button>
        </div>
        {paidMsg && <div className="alert alert-success mt-3">{paidMsg}</div>}
        {showQr && qrImg && (
          <div className="mt-3">
            <h6>Scan to Pay</h6>
            <img src={qrImg} alt="UPI QR" style={{maxWidth:'100%'}} />
            <div className="mt-2">
              <a href={generateUpiLink(total)} target="_blank" rel="noreferrer" className="btn btn-sm btn-link">Open UPI Link</a>
              <button className="btn btn-sm btn-secondary ms-2" onClick={()=>{navigator.clipboard?.writeText(generateUpiLink(total)); showToast('UPI link copied')}}>Copy UPI Link</button>
            </div>
          </div>
        )}
      </div>
      <div className="col-md-4">
        <div className="card">
          <div className="card-body">
            <h6>Quick Info</h6>
            <div>Date: {formatDate()}</div>
            <div>Items: {cart.reduce((s,i)=>s+i.qty,0)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
