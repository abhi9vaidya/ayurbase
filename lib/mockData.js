// Mock data store for development
const now = new Date();

const doctors = [
  {
    doctor_id: 1,
    name: "Dr. Asha Patel",
    specialization: "General Physician",
    clinic_name: "Asha Clinic",
    available_from: "09:00",
    available_to: "17:00",
    rating: 4.8,
    experience_years: 12
  },
  {
    doctor_id: 2,
    name: "Dr. Rohit Mehta",
    specialization: "Cardiologist",
    clinic_name: "Heart Care Center",
    available_from: "10:00",
    available_to: "16:00",
    rating: 4.9,
    experience_years: 15
  }
];

let appointments = [
  {
    appointment_id: 1,
    doctor_id: 1,
    patient_id: 1,
    doctor_name: "Dr. Asha Patel",
    appt_date: new Date(now.getTime() + 24*3600*1000).toISOString(),
    duration: 30,
    reason: "Regular checkup",
    status: "scheduled"
  }
];

const prescriptions = [
  {
    prescription_id: 1,
    appointment_id: 1,
    doctor_id: 1,
    patient_id: 1,
    date: new Date(now.getTime() + 24*3600*1000).toISOString(),
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "Twice daily", duration: "5 days" },
      { name: "Vitamin C", dosage: "1000mg", frequency: "Once daily", duration: "15 days" }
    ],
    instructions: "Take medicines after meals. Drink plenty of water.",
    next_visit: new Date(now.getTime() + 15*24*3600*1000).toISOString()
  }
];

// Mock data access functions
export function getDoctors(query = "", specialization = "") {
  let filtered = [...doctors];
  if (query) {
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.clinic_name.toLowerCase().includes(query.toLowerCase())
    );
  }
  if (specialization) {
    filtered = filtered.filter(d => 
      d.specialization.toLowerCase() === specialization.toLowerCase()
    );
  }
  return filtered;
}

export function getDoctor(id) {
  return doctors.find(d => d.doctor_id === Number(id));
}

export function getAppointments(patientId) {
  return appointments.filter(a => a.patient_id === Number(patientId));
}

export function createAppointment(payload) {
  const doctor = doctors.find(d => d.doctor_id === Number(payload.doctor_id));
  const newAppointment = {
    appointment_id: appointments.length + 1,
    ...payload,
    doctor_name: doctor?.name || 'Unknown Doctor',
    status: "scheduled"
  };
  appointments.push(newAppointment);
  return newAppointment;
}

export function cancelAppointment(id, patientId) {
  const index = appointments.findIndex(
    a => a.appointment_id === Number(id) && a.patient_id === Number(patientId)
  );
  if (index === -1) return null;
  appointments[index].status = "cancelled";
  return appointments[index];
}

export function getPrescriptions(patientId) {
  return prescriptions.filter(p => p.patient_id === Number(patientId));
}

export function getPrescription(id) {
  return prescriptions.find(p => p.prescription_id === Number(id));
}
