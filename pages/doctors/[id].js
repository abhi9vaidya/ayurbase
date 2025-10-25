import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
const api = require('../../lib/api')

export default function DoctorProfile() {
  const router = useRouter()
  const { id } = router.query
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getDoctor(id).then(d => setDoctor(d)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!doctor) return <div>Doctor not found</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold">{doctor.name}</h1>
      <div className="text-gray-600 mb-3">{doctor.specialization}</div>
      <div className="mb-4">Clinic: {doctor.clinic?.name} — {doctor.clinic?.location}</div>
      <div className="mb-4">Available: {doctor.available_from} — {doctor.available_to}</div>
      <div className="flex space-x-3">
        <a href={`/book?doctorId=${doctor.doctor_id}`} className="px-4 py-2 bg-sky-600 text-white rounded">Book</a>
        <a href="/doctors" className="px-4 py-2 border rounded">Back</a>
      </div>
    </div>
  )
}
