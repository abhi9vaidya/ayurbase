import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DateTimePicker from '../components/DateTimePicker'
import FormInput from '../components/FormInput'
const api = require('../lib/api')

export default function BookPage() {
  const router = useRouter()
  const { doctorId } = router.query
  const [doctorIdState, setDoctorIdState] = useState(doctorId || '')
  const [dateTimeLocal, setDateTimeLocal] = useState('')
  const [duration, setDuration] = useState(30)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => { if (doctorId) setDoctorIdState(doctorId) }, [doctorId])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    if (!doctorIdState || !dateTimeLocal) {
      setMessage({ type: 'error', text: 'Please select doctor and date/time' })
      return
    }
    setLoading(true)
    try {
      // Convert local datetime-local to ISO UTC string
      const iso = new Date(dateTimeLocal).toISOString()
      const payload = { patient_id: 1, doctor_id: Number(doctorIdState), appt_date_iso: iso, duration_min: Number(duration), reason }
      const data = await api.bookAppointment(payload)
      setMessage({ type: 'success', text: `Booked appointment ${data.appointment_id}` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) })
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Book Appointment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <FormInput label="Doctor ID" value={doctorIdState} onChange={e => setDoctorIdState(e.target.value)} />
        <DateTimePicker label="Date & Time (local)" value={dateTimeLocal} onChange={e => setDateTimeLocal(e.target.value)} />
        <FormInput label="Duration (minutes)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
        <FormInput label="Reason" value={reason} onChange={e => setReason(e.target.value)} />
        <div>
          <button className="px-4 py-2 bg-sky-600 text-white rounded" disabled={loading}>{loading ? 'Booking...' : 'Book'}</button>
        </div>
        {message && (
          <div className={`${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</div>
        )}
      </form>
    </div>
  )
}
