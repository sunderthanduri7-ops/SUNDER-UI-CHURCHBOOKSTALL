import React from 'react'

export default function Cart({items, onIncrease, onDecrease, onRemove}){
  const total = items.reduce((s,it)=>s+it.price*it.qty,0)
  const totalCount = items.reduce((s,it)=>s+it.qty,0)
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Cart</h5>
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
  )
}
