import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'

export default function AdminPanel() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!token || !user.is_admin) {
      navigate('/login')
      return
    }
    
    fetchBookings()
  }, [tab])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const url = tab === 'pending' ? '/admin/bookings/pending' : '/admin/bookings/all'
      const response = await API.get(url)
      
      if (response.data.success) {
        setBookings(response.data.data.bookings || [])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
      alert(err.response?.data?.message || 'Error loading bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    try {
      const response = await API.put(`/admin/bookings/${bookingId}/approve`)
      if (response.data.success) {
        alert('Booking approved successfully')
        fetchBookings()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving booking')
    }
  }

  const handleReject = async (bookingId) => {
    try {
      const response = await API.put(`/admin/bookings/${bookingId}/reject`)
      if (response.data.success) {
        alert('Booking rejected successfully')
        fetchBookings()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting booking')
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Admin Panel - Booking Management</h2>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded font-semibold ${tab === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Pending Bookings ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button 
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded font-semibold ${tab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          All Bookings ({bookings.length})
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600"><strong>Booking ID:</strong> #{booking.id}</p>
                  <p className="text-gray-600"><strong>User:</strong> {booking.user_name || 'N/A'}</p>
                  <p className="text-gray-600"><strong>Email:</strong> {booking.email || 'N/A'}</p>
                  <p className="text-gray-600"><strong>Package:</strong> {booking.package_title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600"><strong>Dates:</strong> {booking.start_date} to {booking.end_date}</p>
                  <p className="text-gray-600"><strong>Passengers:</strong> {booking.passengers}</p>
                  <p className="text-gray-600"><strong>Total Price:</strong> ₹{parseFloat(booking.total_price).toFixed(2)}</p>
                  <p className="text-gray-600">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded text-white text-sm font-semibold ${
                      booking.status === 'pending' ? 'bg-yellow-500' :
                      booking.status === 'confirmed' ? 'bg-green-500' :
                      booking.status === 'cancelled' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => handleApprove(booking.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(booking.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
