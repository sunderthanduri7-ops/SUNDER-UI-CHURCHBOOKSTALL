import React from 'react'

export default function BookCard({book, onAdd}){
  return (
    <div className="card book-card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{book.name}</h5>
        <p className="card-text mb-2">Category: {book.category}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="fw-bold">₹{book.price}</div>
          <button className="btn btn-sm btn-primary" onClick={() => onAdd(book)}>Add</button>
        </div>
      </div>
    </div>
  )
}
