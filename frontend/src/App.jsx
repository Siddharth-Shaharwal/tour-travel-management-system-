import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Packages from './pages/Packages'
import Login from './pages/Login'
import Register from './pages/Register'
import MyBookings from './pages/MyBookings'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/packages' element={<Packages />} />
            <Route path='/my-bookings' element={<MyBookings />} />
            <Route path='/admin' element={<Dashboard />} />
            <Route path='/admin/bookings' element={<AdminPanel />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}

