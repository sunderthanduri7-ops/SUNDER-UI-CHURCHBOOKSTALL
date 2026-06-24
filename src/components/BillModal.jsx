import React from 'react'

export default function BillModal({show, onClose, bill}){
  if(!show || !bill) return null
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Bill {bill.billNumber}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div>Date: {bill.date}</div>
            <div>Type: {bill.type || '—'}</div>
            <hr/>
            {bill.items.map(it=> (
              <div key={it.id} className="d-flex justify-content-between my-1">
                <div>{it.name} x {it.qty}</div>
                <div>₹{it.price * it.qty}</div>
              </div>
            ))}
            <hr/>
            <div className="d-flex justify-content-between">
              <strong>Total</strong>
              <strong>₹{bill.total}</strong>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
