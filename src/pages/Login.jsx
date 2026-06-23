import React, {useState} from 'react'
import { StorageService } from '../services/storageService'

export default function Login(){
  const [pwd,setPwd] = useState('')
  const [msg,setMsg] = useState('')

  function submit(){
    if(pwd==='1234'){
      StorageService.setUserRole('admin')
      window.location.href = '/'
    } else {
      setMsg('Invalid password')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}>
      <div className="card p-3" style={{width:360}}>
        <h5 className="mb-3">Admin Login</h5>
        <input className="form-control mb-2" type="password" placeholder="Enter admin password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={submit}>Login</button>
          <button className="btn btn-secondary" onClick={()=>{StorageService.setUserRole('customer'); window.location.href='/'}}>Continue as Customer</button>
        </div>
        {msg && <div className="text-danger mt-2">{msg}</div>}
      </div>
    </div>
  )
}
