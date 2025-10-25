import Link from 'next/link';

export default function DoctorCard({ doctor }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-lg font-semibold text-brand-700">
              {doctor.name.split(' ')[1][0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
            <div className="text-sm font-medium text-brand-600">
              {doctor.specialization}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {doctor.clinic_name || (doctor.clinic && doctor.clinic.name)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
            {doctor.available_from} - {doctor.available_to}
          </div>
          {doctor.rating && (
            <div className="mt-2 flex items-center text-sm">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 font-medium">{doctor.rating}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div>
          {doctor.experience_years && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-50 text-brand-700">
              {doctor.experience_years} years exp.
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/book?doctorId=${doctor.doctor_id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200"
          >
            Book Now
          </Link>
          <Link 
            href={`/doctors/${doctor.doctor_id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
