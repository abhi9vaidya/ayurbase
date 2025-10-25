import { useEffect, useState } from 'react'
import Link from 'next/link'
const api = require('../../lib/api')

export default function PrescriptionsPage() {
  const patientId = 1
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const data = await api.getPrescriptions(patientId)
      setList(data)
    } catch (err) { console.error(err); setList([]) } finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Prescriptions</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {list.length === 0 && <div className="text-sm text-gray-600">No prescriptions</div>}
          {list.map(p => (
            <div key={p.prescription_id} className="border rounded p-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">Prescription #{p.prescription_id}</div>
                  <div className="text-sm text-gray-600">By {p.prescribed_by_name} — {new Date(p.created_on).toLocaleString()}</div>
                </div>
                <Link href={`/prescriptions/${p.prescription_id}`}><a className="text-sky-600">View</a></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
