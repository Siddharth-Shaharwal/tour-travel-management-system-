import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'
import Card from '../components/Card'

export default function Packages(){
  const [packages, setPackages] = useState([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    passengers: 1,
    vehicle_id: null
  })
  const [loading, setLoading] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await API.get("/packages")
      const list = response.data?.data?.packages
      setPackages(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      setPackages([])
    }
  }

  const fetchAvailableVehicles = async (startDate, endDate, passengers) => {
    if (!startDate || !endDate || !passengers) return
    
    setLoadingVehicles(true)
    try {
      const response = await API.get('/dashboard/vehicles', {
        params: {
          start_date: startDate,
          end_date: endDate,
          passenger_count: passengers
        }
      })
      setAvailableVehicles(response.data?.data?.vehicles || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setAvailableVehicles([])
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleBookClick = (pkg) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    setSelectedPackage(pkg)
    setBookingData({
      start_date: '',
      end_date: '',
      passengers: 1,
      vehicle_id: null
    })
    setAvailableVehicles([])
    setShowBookingForm(true)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const response = await API.post('/bookings', {
        package_id: selectedPackage.id,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        passengers: parseInt(bookingData.passengers),
        vehicle_id: bookingData.vehicle_id ? parseInt(bookingData.vehicle_id) : null
      })

      if (response.data.success) {
        alert('Booking created successfully! Waiting for admin approval.')
        setShowBookingForm(false)
        setSelectedPackage(null)
        setBookingData({ start_date: '', end_date: '', passengers: 1, vehicle_id: null })
        setAvailableVehicles([])
        navigate('/my-bookings')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating booking')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newData = {
      ...bookingData,
      [name]: value
    }
    setBookingData(newData)

    // Fetch available vehicles when dates or passengers change
    if (name === 'start_date' || name === 'end_date' || name === 'passengers') {
      fetchAvailableVehicles(
        name === 'start_date' ? value : newData.start_date,
        name === 'end_date' ? value : newData.end_date,
        name === 'passengers' ? value : newData.passengers
      )
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Tour Packages</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {packages.map((p, idx) => {
          const id = p.id ?? p.package_id ?? idx
          const title = p.title ?? 'Untitled Package'
          const price = p.price ?? p.Price ?? '—'
          const img = p.image_url ?? p.ImageUrl ?? null
          const desc = p.short_description ?? p.description ?? ''

          return (
            <Card key={id} title={title} subtitle={price !== '—' ? `₹${price}` : undefined} img={img}>
              <p className="text-sm text-gray-700 mb-3">{desc}</p>
              <p className="text-xs text-gray-500 mb-3">Duration: {p.duration_days || 1} day(s)</p>
              <button 
                onClick={() => handleBookClick(p)}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-medium"
              >
                Book Now
              </button>
            </Card>
          )
        })}
        {packages.length === 0 && <div className="text-gray-500">No packages available.</div>}
      </div>

      {showBookingForm && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-4">Book {selectedPackage.title}</h3>
            <p className="text-gray-600 mb-4">Price per person: ₹{selectedPackage.price}</p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                <input 
                  type="date"
                  name="start_date"
                  value={bookingData.start_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">End Date</label>
                <input 
                  type="date"
                  name="end_date"
                  value={bookingData.end_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Number of Passengers</label>
                <input 
                  type="number"
                  name="passengers"
                  value={bookingData.passengers}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              {loadingVehicles && <p className="text-blue-600 text-sm">Loading available vehicles...</p>}

              {availableVehicles.length > 0 && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Select Vehicle (Optional)</label>
                  <select
                    name="vehicle_id"
                    value={bookingData.vehicle_id || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">No preference / Let admin assign</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.type_name} - {v.make} {v.model} (Capacity: {v.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-lg font-semibold">
                Total: ₹{(selectedPackage.price * bookingData.passengers).toFixed(2)}
              </p>

              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false)
                    setSelectedPackage(null)
                    setAvailableVehicles([])
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
