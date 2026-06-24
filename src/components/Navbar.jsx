import React, {useEffect, useState} from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { StorageService } from '../services/storageService'

export default function Navbar(){
  const [role,setRole] = useState(StorageService.getUserRole())
  const navigate = useNavigate()

  useEffect(()=>{
    setRole(StorageService.getUserRole())
  },[])

  function changeRole(e){
    const r = e.target.value
    StorageService.setUserRole(r)
    setRole(r)
    if(r==='admin') navigate('/login')
    else navigate('/')
  }

  const isAdmin = role === 'admin'

  function gotoBooks(e){
    try{ localStorage.setItem('openCategory','books') }catch(_){}
  }
  function gotoCoffee(e){
    try{ localStorage.setItem('openCategory','coffee') }catch(_){}
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand brand" to={isAdmin?'/sales':'/books'}>Church Book Stall</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto">
            {isAdmin && <li className="nav-item"><NavLink className="nav-link" to="/sales">Sales Counter</NavLink></li>}
            <li className="nav-item"><NavLink className="nav-link" to="/books" onClick={gotoBooks}>Books</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/coffee" onClick={gotoCoffee}>Coffee</NavLink></li>
            {isAdmin && <li className="nav-item"><NavLink className="nav-link" to="/history">Sales History</NavLink></li>}
            <li className="nav-item d-flex align-items-center ms-3">
              {role==='admin' ? (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => { StorageService.setUserRole('customer'); navigate('/') }}>Logout</button>
              ) : (
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/login')}>Admin Login</button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
