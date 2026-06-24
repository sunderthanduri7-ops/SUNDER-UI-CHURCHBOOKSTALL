import React, {useEffect, useState} from 'react'
import { StorageService } from '../services/storageService'
import BillModal from '../components/BillModal'

export default function SalesHistory(){
  const [sales,setSales] = useState([])
  const [query,setQuery] = useState('')
  const [dateFilter,setDateFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    const role = StorageService.getUserRole()
    if(role!=='admin'){
      setSales([])
      setLoading(false)
      return
    }
    setSales(StorageService.getSales())
    setLoading(false)
    // listen for updates when sales are changed elsewhere
    const handler = ()=> setSales(StorageService.getSales())
    window.addEventListener('salesUpdated', handler)
    return ()=> window.removeEventListener('salesUpdated', handler)
  },[])

  function open(b){ setSelected(b) }
  function close(){ setSelected(null) }

  const filtered = sales.filter(s=>{
    if(query && !s.billNumber.toLowerCase().includes(query.toLowerCase())) return false
    if(dateFilter && s.date!==dateFilter) return false
    return true
  })

  const totalAmount = filtered.reduce((s,x)=>s+x.total,0)

  if(loading) return <div className="text-center py-5">Loading...</div>
  const role = StorageService.getUserRole()
  if(role!=='admin') return (
    <div className="text-center py-5">
      <h5>Access denied</h5>
      <p className="text-muted">Sales history is visible to admin only.</p>
    </div>
  )

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Search by bill number" value={query} onChange={e=>setQuery(e.target.value)} />
        <input className="form-control" type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} />
      </div>
      <div className="mb-2">Total: <strong>₹{totalAmount}</strong></div>
      {filtered.length===0 && <p className="text-muted">No sales yet.</p>}
      <div className="list-group">
        {filtered.map(s=> (
          <button key={s.billNumber} className="list-group-item list-group-item-action d-flex justify-content-between" onClick={()=>open(s)}>
            <div>
              <div><strong>{s.billNumber}</strong></div>
              <div className="text-muted">{s.date} — {s.items.length} items — {s.type || '—'}</div>
            </div>
            <div className="fw-bold">₹{s.total}</div>
          </button>
        ))}
      </div>
      <BillModal show={!!selected} bill={selected} onClose={close} />
    </div>
  )
}
