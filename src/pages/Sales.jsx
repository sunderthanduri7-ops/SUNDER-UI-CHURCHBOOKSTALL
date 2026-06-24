import React, {useEffect, useState} from 'react'
import BookCard from '../components/BookCard'
import Cart from '../components/Cart'
import { StorageService } from '../services/storageService'
import { showToast } from '../services/toastService'
import { syncSalesToSheets, pingSheetsEndpoint } from '../services/sheetsService'

export default function Sales(){
  const [books,setBooks] = useState([])
  const [coffees,setCoffees] = useState([])
  const [query,setQuery] = useState('')
  const [cart,setCart] = useState([])
  const [loading,setLoading] = useState(true)

  const role = StorageService.getUserRole()
  const isAdmin = role === 'admin'

  useEffect(()=>{
    setLoading(true)
    const b = StorageService.getBooks()
    const c = StorageService.getCoffees()
    setBooks(b)
    setCoffees(c)
    setCart(StorageService.getCart())
    setLoading(false)
  },[])

  useEffect(()=>{ StorageService.saveCart(cart) },[cart])

  function handleAdd(book){
    setCart(prev=>{
      const uid = `${book.type || 'book'}-${book.id}`
      const exists = prev.find(p=>p.id===uid)
      if(exists){
        return prev.map(p=> p.id===uid?{...p, qty: p.qty+1}: p)
      }
      return [...prev, { ...book, id: uid, qty:1 }]
    })
    try{ showToast && showToast(`${book.name} added to cart`) }catch(e){}
  }
  function increase(id){ setCart(prev=> prev.map(p=> p.id===id?{...p,qty:p.qty+1}:p)) }
  function decrease(id){ setCart(prev=> prev.map(p=> p.id===id?{...p,qty: Math.max(1,p.qty-1)}:p)) }
  function removeItem(id){ setCart(prev=> prev.filter(p=>p.id!==id)) }

  const products = [
    ...books.map(b=> ({...b, type: 'book'})),
    ...coffees.map(c=> ({...c, type: 'coffee'}))
  ]

  const filtered = products.filter(b=> b.name.toLowerCase().includes(query.toLowerCase()))

  if(loading) return <div className="text-center py-5">Loading...</div>

  if(!isAdmin) return (
    <div className="text-center py-5">
      <h5>Access denied</h5>
      <p className="text-muted">Sales Counter is for admin only. Customers can order from Books or Coffee pages.</p>
    </div>
  )

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="d-flex mb-3">
          <input className="form-control me-2" placeholder="Search products..." value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        <div className="row g-3">
          {filtered.length===0 && <p className="text-muted">No products found.</p>}
          {filtered.map(book => (
            <div className="col-sm-6 col-lg-4" key={`${book.type}-${book.id}`}>
              <BookCard book={book} onAdd={handleAdd} />
            </div>
          ))}
        </div>
      </div>
      <div className="col-md-4">
        <Cart items={cart} onIncrease={increase} onDecrease={decrease} onRemove={removeItem} />
        <div className="mt-3">
          <a href="/payment" className="btn btn-success w-100">Proceed to Payment</a>
        </div>
        {isAdmin && (
          <div className="mt-3 d-grid gap-2">
            <button className="btn btn-outline-secondary" onClick={async ()=>{
              try{
                const ep = localStorage.getItem('sheetsEndpoint') || prompt('Enter Google Sheets Apps Script URL')
                if(!ep) return
                localStorage.setItem('sheetsEndpoint', ep)
                showToast('Pinging endpoint...')
                const ping = await pingSheetsEndpoint(ep).catch(e=>{throw new Error('Ping failed: '+e.message)})
                showToast('Endpoint reachable: ' + (ping.message || ping.status || 'OK'))
                showToast('Syncing sales...')
                const res = await syncSalesToSheets(ep, StorageService.getSales())
                showToast('Synced to Google Sheets: ' + (res.appended || res.status || JSON.stringify(res)))
              }catch(ex){
                showToast('Sheets sync failed: ' + ex.message)
              }
            }} disabled={StorageService.getSales().length===0}>Sync Sales to Google Sheets</button>

            <button className="btn btn-danger" onClick={()=>{
              if(!confirm('Clear local sales? This cannot be undone locally.')) return
              try{
                StorageService.saveSales([])
                showToast('Local sales cleared')
                window.dispatchEvent(new CustomEvent('salesUpdated'))
              }catch(err){
                showToast('Clear failed: ' + (err.message || err))
              }
            }} disabled={StorageService.getSales().length===0}>Clear Local Sales</button>
          </div>
        )}
      </div>
    </div>
  )
}
