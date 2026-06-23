import React from 'react'

export default function CoffeeCard({coffee, onAdd}){
  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{coffee.name}</h5>
        {coffee.size && <p className="card-text mb-2">Size: {coffee.size}</p>}
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="fw-bold">₹{coffee.price}</div>
          <button className="btn btn-sm btn-primary" onClick={() => onAdd(coffee)}>Add</button>
        </div>
      </div>
    </div>
  )
}
