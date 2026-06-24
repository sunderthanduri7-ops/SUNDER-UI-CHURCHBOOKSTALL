import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sales from './pages/Sales'
import Payment from './pages/Payment'
import Books from './pages/Books'
import Coffee from './pages/Coffee'
import SalesHistory from './pages/SalesHistory'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import { StorageService } from './services/storageService'

// initialize default books if needed
StorageService.initDefaults()

export default function App(){
  return (
    <div>
      <Navbar />
      <div className="container my-4">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login/>} />
              <Route path="/sales" element={<Sales/>} />
              <Route path="/payment" element={<Payment/>} />
              <Route path="/books" element={<Books/>} />
              <Route path="/coffee" element={<Coffee/>} />
              <Route path="/history" element={<SalesHistory/>} />
            </Routes>
      </div>
    </div>
  )
}

function RootRedirect(){
  // check preference stored in localStorage: 'openCategory' -> 'books' or 'coffee'
  let target = '/books'
  try{
    const pref = localStorage.getItem('openCategory')
    if(pref === 'coffee') target = '/coffee'
    else target = '/books'
  }catch(e){
    target = '/books'
  }
  return <Navigate to={target} replace />
}
