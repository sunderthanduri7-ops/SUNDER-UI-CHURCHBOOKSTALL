import React, {useEffect, useState} from 'react'
import { StorageService } from '../services/storageService'
import { showToast } from '../services/toastService'
import { generateUpiLink } from '../utils/upiGenerator'
import generateBillNo from '../utils/generateBillNo'

function formatDate(d=new Date()){
  return d.toISOString().slice(0,10)
}

export default function Payment(){
  const [cart,setCart] = useState([])
  const [sales,setSales] = useState([])
  const [loading,setLoading] = useState(true)
  const [paidMsg,setPaidMsg] = useState('')

  useEffect(()=>{
    setLoading(true)
    setCart(StorageService.getCart())
    setSales(StorageService.getSales())
    setLoading(false)
  },[])

  const total = cart.reduce((s,it)=>s+it.price*it.qty,0)

  function openUpi(){
    const link = generateUpiLink(total)
    window.location.href = link
  }

  function markAsPaid(){
    const billNumber = generateBillNo()
    const date = formatDate()
    const record = { billNumber, date, items: cart, total }
    const updated = [...sales, record]
    StorageService.saveSales(updated)
    StorageService.clearCart()
    setPaidMsg(`Saved ${billNumber}`)
    setCart([])
    showToast(`Saved ${billNumber}`)
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
          <button className="btn btn-primary" onClick={openUpi} disabled={cart.length===0}>Pay via UPI</button>
          <button className="btn btn-success" onClick={markAsPaid} disabled={cart.length===0}>Mark As Paid</button>
        </div>
        {paidMsg && <div className="alert alert-success mt-3">{paidMsg}</div>}
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
