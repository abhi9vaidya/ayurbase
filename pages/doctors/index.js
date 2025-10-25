import { useEffect, useState } from 'react'
import DoctorCard from '../../components/DoctorCard'
const api = require('../../lib/api')

export default function DoctorsPage() {
  const [q, setQ] = useState('')
  const [spec, setSpec] = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchDoctors() }, [])

  async function fetchDoctors() {
    setLoading(true)
    try {
      const data = await api.getDoctors(q, spec)
      setDoctors(data)
    } catch (err) {
      console.error(err)
      setDoctors([])
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Doctors</h1>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Search name" value={q} onChange={e => setQ(e.target.value)} className="border rounded px-3 py-2" />
        <input placeholder="Specialization" value={spec} onChange={e => setSpec(e.target.value)} className="border rounded px-3 py-2" />
        <div className="flex space-x-2">
          <button onClick={fetchDoctors} className="px-3 py-2 bg-sky-600 text-white rounded">Search</button>
          <button onClick={() => { setQ(''); setSpec(''); fetchDoctors() }} className="px-3 py-2 border rounded">Reset</button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {doctors.map(d => <DoctorCard key={d.doctor_id} doctor={d} />)}
        </div>
      )}
    </div>
  )
}
