import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Cart({title='Cart', items, onIncrease, onDecrease, onRemove}){
  const [mobile, setMobile] = useState(false)
  const [open, setOpen] = useState(true)

  useEffect(()=>{
    const update = ()=> setMobile(window.innerWidth < 768)
    update()
    window.addEventListener('resize', update)
    return ()=> window.removeEventListener('resize', update)
  },[])

  useEffect(()=>{
    if(mobile) setOpen(false)
    else setOpen(true)
  },[mobile])

  const total = items.reduce((s,it)=>s+it.price*it.qty,0)
  const totalCount = items.reduce((s,it)=>s+it.qty,0)
  const showCartDetails = !mobile || open

  return (
    <>
      {mobile && (
        <div className="cart-mobile-banner">
          <div>
            <div className="fw-bold">Sales Counter</div>
            <div className="text-muted">{totalCount} item(s), ₹{total}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to="/payment" className="btn btn-sm btn-success">Pay</Link>
            <button className="btn btn-sm btn-outline-primary cart-details-btn" onClick={()=>setOpen(prev=>!prev)}>
              {open ? 'Hide' : 'View'} Cart
            </button>
          </div>
        </div>
      )}

      {showCartDetails && (
        <div className="card cart-details-card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">{title}</h5>
              {mobile && (
                <button className="btn btn-sm btn-link" onClick={()=>setOpen(false)}>Close</button>
              )}
            </div>
            {items.length===0 && <p className="text-muted">Cart is empty</p>}
            {items.map(it=> (
              <div className="d-flex align-items-center mb-2" key={it.id}>
                <div className="me-3">
                  <strong>{it.name}</strong>
                  <div className="text-muted">₹{it.price}</div>
                </div>
                <div className="ms-auto d-flex align-items-center">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => onDecrease(it.id)}>-</button>
                  <div className="px-2">{it.qty}</div>
                  <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => onIncrease(it.id)}>+</button>
                  <button className="btn btn-sm btn-danger ms-3" onClick={() => onRemove(it.id)}>Remove</button>
                </div>
              </div>
            ))}
            <hr/>
            <div className="d-flex justify-content-between">
              <div>Total items: <strong>{totalCount}</strong></div>
              <div>Total: <strong>₹{total}</strong></div>
            </div>
          </div>
        </div>
      )}

      {mobile && showCartDetails && <div className="cart-mobile-spacer" />}

      {mobile && showCartDetails && (
        <div className="mt-3 d-grid gap-2">
          <Link to="/payment" className="btn btn-success w-100">Proceed to Payment</Link>
        </div>
      )}
    </>
  )
}
