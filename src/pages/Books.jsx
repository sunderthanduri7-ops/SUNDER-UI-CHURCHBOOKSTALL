import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import { StorageService } from '../services/storageService'
import BookCard from '../components/BookCard'
import Cart from '../components/Cart'
import { showToast } from '../services/toastService'
import { fetchBooksFromSheets, saveBooksToSheets, DEFAULT_SHEETS_ENDPOINT } from '../services/sheetsService'

function BookForm({initial, onCancel, onSave}){
  const [name,setName] = useState(initial.name||'')
  const [price,setPrice] = useState(initial.price||0)
  const [category,setCategory] = useState(initial.category||'')
  return (
    <div className="card p-3">
      <div className="mb-2">
        <input className="form-control" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="mb-2 d-flex gap-2">
        <input className="form-control" placeholder="Price" type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <input className="form-control" placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={() => onSave({ ...initial, name, price, category })}>Save</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function Books(){
  const [books,setBooks] = useState([])
  const [editing,setEditing] = useState(null)
  const [showForm,setShowForm] = useState(false)
  const [loading,setLoading] = useState(true)
  const [query,setQuery] = useState('')

  const role = StorageService.getUserRole()
  const isAdmin = role === 'admin'
  const [cart,setCart] = useState(StorageService.getCart())

  useEffect(()=>{
    const loadBooks = async ()=>{
      setLoading(true)
      const localBooks = StorageService.getBooks()
      setBooks(localBooks)
      setCart(StorageService.getCart())
      try{
        const remoteBooks = await fetchBooksFromSheets(DEFAULT_SHEETS_ENDPOINT)
        if(Array.isArray(remoteBooks) && remoteBooks.length > 0){
          setBooks(remoteBooks)
          StorageService.saveBooks(remoteBooks)
        }
      }catch(err){
        console.warn('Book sync failed, using local books', err)
      }
      setLoading(false)
    }
    loadBooks()
  },[])

  useEffect(()=>{ StorageService.saveCart(cart) },[cart])

  function addBook(){
    setEditing({})
    setShowForm(true)
  }
  function editBook(b){ setEditing(b); setShowForm(true) }
  async function deleteBook(b){
    if(!confirm(`Delete ${b.name}?`)) return
    const next = books.filter(x=> x.id!==b.id)
    setBooks(next)
    StorageService.saveBooks(next)
    try{
      await saveBooksToSheets(DEFAULT_SHEETS_ENDPOINT, next)
      showToast('Book deleted and synced', 'warning')
    }catch(err){
      showToast('Book deleted locally, sync failed: ' + (err.message || err))
    }
  }
  async function saveBook(book){
    let next
    if(book.id){
      next = books.map(b=> b.id===book.id?book:b)
    } else {
      const id = books.reduce((m,b)=>Math.max(m,b.id),0)+1
      next = [...books, {...book, id}]
    }
    setBooks(next)
    StorageService.saveBooks(next)
    setShowForm(false)
    setEditing(null)
    try{
      await saveBooksToSheets(DEFAULT_SHEETS_ENDPOINT, next)
      showToast('Saved book and synced')
    }catch(err){
      showToast('Saved book locally, sync failed: ' + (err.message || err))
    }
  }

  if(loading) return <div className="text-center py-5">Loading...</div>

  const filteredBooks = books.filter(b => {
    const term = query.trim().toLowerCase()
    if(!term) return true
    return b.name.toLowerCase().includes(term) || (b.category||'').toLowerCase().includes(term)
  })

  function handleAddToCart(b){
    const uid = `book-${b.id}`
    setCart(prev=>{
      const exists = prev.find(p=>p.id===uid)
      if(exists) return prev.map(p=> p.id===uid?{...p, qty: p.qty+1}: p)
      return [...prev, {...b, id: uid, qty:1}]
    })
    try{ showToast && showToast(`${b.name} added to cart`) }catch(e){}
  }

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4>Books</h4>
            {!isAdmin && <div className="text-muted">Search books by name or category</div>}
          </div>
          <div>
            {isAdmin && <button className="btn btn-primary" onClick={addBook}>Add Book</button>}
          </div>
        </div>
        {!isAdmin && (
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Search books..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        )}
        {showForm && isAdmin && <BookForm initial={editing||{}} onCancel={() => {setShowForm(false); setEditing(null)}} onSave={saveBook} />}
        <div className="row g-3 mt-3">
          {filteredBooks.length === 0 && <div className="col-12"><p className="text-muted">No books match your search.</p></div>}
          {filteredBooks.map(b=> (
            <div key={b.id} className="col-sm-6 col-md-4">
              {isAdmin ? (
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{b.name}</h5>
                    <p className="card-text">Category: {b.category}</p>
                    <div className="mt-auto d-flex justify-content-between">
                      <div className="fw-bold">₹{b.price}</div>
                      <div>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>editBook(b)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={()=>deleteBook(b)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <BookCard book={b} onAdd={handleAddToCart} />
              )}
            </div>
          ))}
        </div>
      </div>
      {!isAdmin && (
        <div className="col-md-4">
          <Cart title="Sales Counter" items={cart} onIncrease={id=>setCart(prev=> prev.map(p=> p.id===id?{...p,qty:p.qty+1}:p))} onDecrease={id=>setCart(prev=> prev.map(p=> p.id===id?{...p,qty: Math.max(1,p.qty-1)}:p))} onRemove={id=>setCart(prev=> prev.filter(p=>p.id!==id))} />
          <div className="mt-3">
            <Link to="/payment" className="btn btn-success w-100">Proceed to Payment</Link>
          </div>
        </div>
      )}
    </div>
  )
}
