import React, { useEffect, useState } from 'react'
import API from '../utils/api'

export default function Reservations(){
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({ user_id: null, vehicle_id: '', package_id: '', start_date: '', end_date: '', passengers: 1, total_price: 0 })
  const [msg, setMsg] = useState('')

  useEffect(()=>{
   API.get("/vehicles")
  .then((r) => {
    const list = r.data?.data?.vehicles;
    setVehicles(Array.isArray(list) ? list : []);
  })
  .catch(() => setVehicles([]));

  },[])

  const isGuest = true; // change after adding auth

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(isGuest){ setMsg('Guest users cannot create bookings. Please login.'); return }
    try{
      const res = await API.post('/bookings', form)
      if(res.data.success) setMsg('Booking created! ID: '+res.data.booking_id)
    }catch(err){
      setMsg(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Create Reservation</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium">Vehicle</label>
          <select className="mt-1 block w-full border rounded p-2" value={form.vehicle_id} onChange={e=>setForm({...form,vehicle_id:e.target.value})}>
            <option value="">-- Select vehicle --</option>
            {vehicles.map(v=> <option key={v.id} value={v.id}>{v.make} {v.model} • Capacity {v.capacity}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input type="date" className="mt-1 block w-full border rounded p-2" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input type="date" className="mt-1 block w-full border rounded p-2" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Passengers</label>
          <input type="number" min="1" className="mt-1 block w-32 border rounded p-2" value={form.passengers} onChange={e=>setForm({...form,passengers:parseInt(e.target.value)})} />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">Book</button>
          <div className="text-sm text-gray-500">{msg}</div>
        </div>
      </form>
    </div>
  )
}
