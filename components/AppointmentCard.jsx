export default function AppointmentCard({ appt, onCancel, cancelling }) {
  const appointmentDate = new Date(appt.appt_date);
  const isUpcoming = appointmentDate > new Date();
  const statusColor = appt.status === 'Cancelled' 
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-lg font-semibold text-brand-700">
              {appointmentDate.getDate()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{appt.doctor_name}</h3>
            <div className="text-sm text-gray-500">
              {appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-sm font-medium text-brand-600 mt-1">
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
              {appt.duration_min && ` • ${appt.duration_min} min`}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
            {appt.status}
          </span>
          {isUpcoming && appt.status !== 'Cancelled' && (
            <button
              onClick={() => onCancel(appt.appointment_id)}
              disabled={cancelling}
              className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
      {appt.reason && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Reason:</span> {appt.reason}
          </div>
        </div>
      )}
    </div>
  )
}
