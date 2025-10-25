import { useEffect, useState } from 'react'
import AppointmentCard from '../components/AppointmentCard'
const api = require('../lib/api')

export default function AppointmentsPage() {
  const patientId = 1
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => { fetchAppts() }, [])

  async function fetchAppts() {
    setLoading(true)
    try {
      const data = await api.getAppointments(patientId)
      setAppts(data)
    } catch (err) { console.error(err); setAppts([]) } finally { setLoading(false) }
  }

  async function handleCancel(id) {
    setCancellingId(id)
    try {
      await api.cancelAppointment(id, patientId)
      await fetchAppts()
    } catch (err) {
      alert(err.message || 'Failed to cancel')
    } finally { setCancellingId(null) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Appointments</h1>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {appts.length === 0 && <div className="text-sm text-gray-600">No appointments</div>}
          {appts.map(a => (
            <AppointmentCard key={a.appointment_id} appt={a} onCancel={handleCancel} cancelling={cancellingId === a.appointment_id} />
          ))}
        </div>
      )}
    </div>
  )
}
