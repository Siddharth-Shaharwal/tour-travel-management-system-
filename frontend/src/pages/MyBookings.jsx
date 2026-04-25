import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await API.get('/bookings')
      if (response.data.success) {
        setBookings(response.data.data.bookings || [])
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await API.put(`/bookings/${bookingId}/cancel`)
      if (response.data.success) {
        alert('Booking cancelled successfully')
        fetchBookings()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking')
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{booking.package_title || 'Package'}</h3>
                  <p className="text-gray-600 mt-2">
                    <strong>Dates:</strong> {booking.start_date} to {booking.end_date}
                  </p>
                  <p className="text-gray-600">
                    <strong>Passengers:</strong> {booking.passengers}
                  </p>
                  <p className="text-gray-600">
                    <strong>Total Price:</strong> ₹{parseFloat(booking.total_price).toFixed(2)}
                  </p>
                  <p className="text-gray-600 mt-2">
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
                <div>
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
