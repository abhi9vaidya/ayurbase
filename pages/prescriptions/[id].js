import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
const api = require('../../lib/api')

export default function PrescriptionDetail() {
  const router = useRouter()
  const { id } = router.query
  const [presc, setPresc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getPrescription(id).then(d => setPresc(d)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!presc) return <div>Not found</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Prescription #{presc.prescription_id}</h1>
      <div className="text-sm text-gray-600 mb-4">By {presc.prescribed_by_name} — {new Date(presc.created_on).toLocaleString()}</div>
      <div className="mb-4">Notes: {presc.notes}</div>
      <div className="space-y-2">
        {presc.medicines.map(m => (
          <div key={m.medicine_id} className="border rounded p-3">
            <div className="font-medium">{m.name} — {m.dose}</div>
            <div className="text-sm">Duration: {m.duration}</div>
            <div className="text-sm">Instructions: {m.instructions}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
