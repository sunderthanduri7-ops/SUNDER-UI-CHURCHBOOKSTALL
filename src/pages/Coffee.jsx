import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import { StorageService } from '../services/storageService'
import { showToast } from '../services/toastService'
import CoffeeCard from '../components/CoffeeCard'
import Cart from '../components/Cart'
import { fetchCoffeesFromSheets, saveCoffeesToSheets, DEFAULT_SHEETS_ENDPOINT } from '../services/sheetsService'

function CoffeeForm({initial, onCancel, onSave}){
  const [name,setName] = useState(initial.name||'')
  const [price,setPrice] = useState(initial.price||0)
  const [size,setSize] = useState(initial.size||'')
  return (
    <div className="card p-3">
      <div className="mb-2">
        <input className="form-control" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div className="mb-2 d-flex gap-2">
        <input className="form-control" placeholder="Price" type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} />
        <input className="form-control" placeholder="Size" value={size} onChange={e=>setSize(e.target.value)} />
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={() => onSave({ ...initial, name, price, size })}>Save</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function Coffee(){
  const [coffees,setCoffees] = useState([])
  const [editing,setEditing] = useState(null)
  const [showForm,setShowForm] = useState(false)
  const [loading,setLoading] = useState(true)

  const role = StorageService.getUserRole()
  const isAdmin = role === 'admin'
  const [cart,setCart] = useState(StorageService.getCart())

  useEffect(()=>{
    const loadCoffees = async ()=>{
      setLoading(true)
      const localCoffees = StorageService.getCoffees()
      setCoffees(localCoffees)
      setCart(StorageService.getCart())
      try{
        const remoteCoffees = await fetchCoffeesFromSheets(DEFAULT_SHEETS_ENDPOINT)
        if(Array.isArray(remoteCoffees) && remoteCoffees.length > 0){
          setCoffees(remoteCoffees)
          StorageService.saveCoffees(remoteCoffees)
        }
      }catch(err){
        console.warn('Coffee sync failed, using local coffees', err)
      }
      setLoading(false)
    }
    loadCoffees()
  },[])

  useEffect(()=>{ StorageService.saveCart(cart) },[cart])

  function addCoffee(){ setEditing({}); setShowForm(true) }
  function editCoffee(c){ setEditing(c); setShowForm(true) }
  async function deleteCoffee(c){
    if(!confirm(`Delete ${c.name}?`)) return
    const next = coffees.filter(x=> x.id!==c.id)
    setCoffees(next)
    StorageService.saveCoffees(next)
    try{
      await saveCoffeesToSheets(DEFAULT_SHEETS_ENDPOINT, next)
      showToast('Coffee deleted and synced', 'warning')
    }catch(err){
      showToast('Coffee deleted locally, sync failed: ' + (err.message || err))
    }
  }
  async function saveCoffee(c){
    let next
    if(c.id){ next = coffees.map(x=> x.id===c.id?c:x) }
    else { const id = coffees.reduce((m,b)=>Math.max(m,b.id),0)+1; next = [...coffees, {...c,id}] }
    setCoffees(next)
    StorageService.saveCoffees(next)
    setShowForm(false); setEditing(null)
    try{
      await saveCoffeesToSheets(DEFAULT_SHEETS_ENDPOINT, next)
      showToast('Saved coffee and synced')
    }catch(err){
      showToast('Saved coffee locally, sync failed: ' + (err.message || err))
    }
  }

  if(loading) return <div className="text-center py-5">Loading...</div>

  function handleAddToCart(c){
    const uid = `coffee-${c.id}`
    setCart(prev=>{
      const exists = prev.find(p=>p.id===uid)
      if(exists) return prev.map(p=> p.id===uid?{...p, qty: p.qty+1}: p)
      return [...prev, {...c, id: uid, qty:1}]
    })
    try{ showToast && showToast(`${c.name} added to cart`) }catch(e){}
  }

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Coffees</h4>
          <div>
            {isAdmin && <button className="btn btn-primary" onClick={addCoffee}>Add Coffee</button>}
          </div>
        </div>
        {showForm && isAdmin && <CoffeeForm initial={editing||{}} onCancel={() => {setShowForm(false); setEditing(null)}} onSave={saveCoffee} />}
        <div className="row g-3 mt-3">
          {coffees.map(c=> (
            <div key={c.id} className="col-sm-6 col-md-4">
              {isAdmin ? (
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{c.name}</h5>
                    <p className="card-text">Size: {c.size}</p>
                    <div className="mt-auto d-flex justify-content-between">
                      <div className="fw-bold">₹{c.price}</div>
                      <div>
                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>editCoffee(c)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={()=>deleteCoffee(c)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <CoffeeCard coffee={c} onAdd={handleAddToCart} />
              )}
            </div>
          ))}
        </div>
      </div>
      {!isAdmin && (
        <div className="col-md-4">
          <Cart items={cart} onIncrease={id=>setCart(prev=> prev.map(p=> p.id===id?{...p,qty:p.qty+1}:p))} onDecrease={id=>setCart(prev=> prev.map(p=> p.id===id?{...p,qty: Math.max(1,p.qty-1)}:p))} onRemove={id=>setCart(prev=> prev.filter(p=>p.id!==id))} />
          <div className="mt-3">
            <Link to="/payment" className="btn btn-success w-100">Proceed to Payment</Link>
          </div>
        </div>
      )}
    </div>
  )
}
