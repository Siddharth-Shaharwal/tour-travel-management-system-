import React, { useEffect, useState } from 'react'
import API from '../utils/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [statusBreakdown, setStatusBreakdown] = useState([])
  const [revenueByPackage, setRevenueByPackage] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [assignData, setAssignData] = useState({
    vehicle_id: '',
    driver_id: ''
  })
  const [loading, setLoading] = useState(true)
  const [assignLoading, setAssignLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(null)
  const [availableSeats, setAvailableSeats] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const statsRes = await API.get('/dashboard/stats')
      if (statsRes.data.success) {
        setStats(statsRes.data.data.stats)
        setStatusBreakdown(statsRes.data.data.statusBreakdown)
        setRevenueByPackage(statsRes.data.data.revenueByPackage)
        setRecentBookings(statsRes.data.data.recentBookings)
      }

      const bookingsRes = await API.get('/admin/bookings/pending')
      if (bookingsRes.data.success) {
        setPendingBookings(bookingsRes.data.data.bookings)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignClick = async (booking) => {
    setSelectedBooking(booking)
    setAssignData({ vehicle_id: '', driver_id: '' })
    setShowAssignForm(true)

    try {
      const vehiclesRes = await API.get('/dashboard/vehicles', {
        params: {
          start_date: booking.start_date,
          end_date: booking.end_date,
          passenger_count: booking.passengers
        }
      })
      setAvailableVehicles(vehiclesRes.data?.data?.vehicles || [])

      const driversRes = await API.get('/dashboard/drivers')
      setAvailableDrivers(driversRes.data?.data?.drivers || [])

      // Check seat availability
      const seatsRes = await API.get('/dashboard/available-seats', {
        params: {
          package_id: booking.package_id,
          start_date: booking.start_date,
          end_date: booking.end_date
        }
      })
      setAvailableSeats(seatsRes.data?.data || null)
    } catch (error) {
      console.error('Error fetching vehicles/drivers:', error)
    }
  }

  const handleRejectBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return

    setRejectLoading(bookingId)
    try {
      const response = await API.put(`/admin/bookings/${bookingId}/reject`)
      if (response.data.success) {
        alert('Booking rejected successfully')
        fetchDashboardData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting booking')
    } finally {
      setRejectLoading(null)
    }
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignData.vehicle_id || !assignData.driver_id) {
      alert('Please select both vehicle and driver')
      return
    }

    setAssignLoading(true)
    try {
      const response = await API.post('/dashboard/assign-vehicle', {
        booking_id: selectedBooking.id,
        vehicle_id: parseInt(assignData.vehicle_id),
        driver_id: parseInt(assignData.driver_id)
      })

      if (response.data.success) {
        alert('Vehicle and driver assigned successfully')
        setShowAssignForm(false)
        fetchDashboardData()
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning vehicle')
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-blue-600 text-sm font-semibold">Total Revenue</div>
          <div className="text-3xl font-bold text-blue-900">₹{stats?.totalRevenue?.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 text-sm font-semibold">Est. Profit (30%)</div>
          <div className="text-3xl font-bold text-green-900">₹{stats?.estimatedProfit?.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="text-purple-600 text-sm font-semibold">Total Bookings</div>
          <div className="text-3xl font-bold text-purple-900">{stats?.totalBookings}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="text-orange-600 text-sm font-semibold">Total Users</div>
          <div className="text-3xl font-bold text-orange-900">{stats?.totalUsers}</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="text-indigo-600 text-sm font-semibold">Active Packages</div>
          <div className="text-3xl font-bold text-indigo-900">{stats?.activePackages}</div>
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Booking Status</h2>
          <div className="space-y-3">
            {statusBreakdown.map(item => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="capitalize font-medium">{item.status}</span>
                <span className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Package */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Revenue by Package</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {revenueByPackage.map(pkg => (
              <div key={pkg.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{pkg.title}</p>
                  <p className="text-xs text-gray-500">{pkg.booking_count} bookings</p>
                </div>
                <span className="font-semibold">₹{pkg.package_revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Booking ID</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Package</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(booking => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">#{booking.id}</td>
                  <td className="px-4 py-3">{booking.user_name}</td>
                  <td className="px-4 py-3">{booking.package_title}</td>
                  <td className="px-4 py-3 text-right">₹{booking.total_price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Bookings - Vehicle & Driver Assignment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Pending Bookings - Assign Vehicle & Driver</h2>
        {pendingBookings.length === 0 ? (
          <p className="text-gray-600">No pending bookings</p>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">Booking #{booking.id}</p>
                    <p className="text-sm text-gray-600">{booking.user_name} - {booking.package_title}</p>
                    <p className="text-sm text-gray-600">
                      {booking.start_date} to {booking.end_date} ({booking.passengers} passengers)
                    </p>
                    {booking.vehicle_id && <p className="text-sm text-green-600">✓ Vehicle assigned</p>}
                    {booking.driver_id && <p className="text-sm text-green-600">✓ Driver assigned</p>}
                  </div>
                  <div className="flex gap-2">
                    {(!booking.vehicle_id || !booking.driver_id) && (
                      <button
                        onClick={() => handleAssignClick(booking)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
                      >
                        Assign
                      </button>
                    )}
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      disabled={rejectLoading === booking.id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {rejectLoading === booking.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Assign Vehicle & Driver</h3>
            <p className="text-gray-600 mb-2">Booking #{selectedBooking.id} - {selectedBooking.user_name}</p>
            
            {availableSeats && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm"><strong>Available Seats:</strong> {availableSeats.available_seats} / {availableSeats.total_seats}</p>
                <p className="text-sm text-gray-600">Booked: {availableSeats.booked_seats}</p>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Vehicle</label>
                <select
                  value={assignData.vehicle_id}
                  onChange={(e) => setAssignData({ ...assignData, vehicle_id: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Choose vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.type_name || 'Vehicle'} - {v.license_plate} (Cap: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Driver</label>
                <select
                  value={assignData.driver_id}
                  onChange={(e) => setAssignData({ ...assignData, driver_id: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Choose driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {assignLoading ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignForm(false)
                    setSelectedBooking(null)
                    setAvailableSeats(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
