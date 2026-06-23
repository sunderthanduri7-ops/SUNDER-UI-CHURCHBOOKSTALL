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
              <Route path="/" element={<Navigate to="/books" replace />} />
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
