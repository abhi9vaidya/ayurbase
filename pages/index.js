import { useEffect, useState } from 'react'
import Link from 'next/link'
const api = require('../lib/api')

export default function Home() {
  const patientId = 1
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.getAppointments(patientId).then(data => {
      if (mounted) setAppts(data)
    }).catch(err => {
      console.error(err)
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome to AyurBase</h1>
        <p className="mt-2 text-gray-600">Your medical appointments and prescriptions in one place.</p>
      </div>

      <section className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Upcoming Appointments</h2>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : appts.length === 0 ? (
          <div className="text-gray-600">No upcoming appointments</div>
        ) : (
          <div className="space-y-3">
            {appts.map(a => (
              <div key={a.appointment_id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="font-medium">{a.doctor_name}</div>
                <div className="text-sm text-gray-600">
                  {new Date(a.appt_date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex space-x-4">
        <Link href="/doctors" className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700">
          Browse Doctors
        </Link>
        <Link href="/book" className="flex-1 bg-white border border-gray-300 text-gray-700 text-center px-4 py-2 rounded-lg hover:bg-gray-50">
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
