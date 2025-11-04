export const API_ENDPOINTS = {
  // Medicine Management (Admin only)
  MEDICINE: {
    GET_ALL: "/medicine", // GET - List all medicines with optional search
    CREATE: "/medicine", // POST - Create new medicine
    GET_BY_ID: (id: number) => `/medicine/${id}`, // GET - Get single medicine
    UPDATE: (id: number) => `/medicine/${id}`, // PUT - Update medicine
    DELETE: (id: number) => `/medicine/${id}`, // DELETE - Delete medicine
  },

  // Prescription Management
  PRESCRIPTION: {
    GET_ALL: "/prescription", // GET - List prescriptions (filtered by role)
    CREATE: "/prescription", // POST - Create new prescription
    GET_BY_ID: (id: number) => `/prescription/${id}`, // GET - Get prescription with medicines
    UPDATE: (id: number) => `/prescription/${id}`, // PUT - Update prescription notes
  },

  // Prescription Medicines
  PRESCRIPTION_MEDICINE: {
    ADD: "/prescription-medicine", // POST - Add medicines to prescription
    DELETE: "/prescription-medicine", // DELETE - Remove medicine from prescription
  },

  // Appointments
  APPOINTMENT: {
    GET_ALL: "/appointment", // GET - List appointments
    CREATE: "/appointment", // POST - Create appointment
    GET_BY_ID: (id: number) => `/appointment/${id}`, // GET - Get appointment
    UPDATE: (id: number) => `/appointment/${id}`, // PUT - Update appointment
    DELETE: (id: number) => `/appointment/${id}`, // DELETE - Cancel appointment
  },

  // Doctor specific
  DOCTOR: {
    GET_ALL: "/doctor", // GET - List doctors
    GET_BY_ID: (id: number) => `/doctor/${id}`, // GET - Get doctor details
    GET_APPOINTMENTS: (id: number) => `/doctor/${id}/appointments`, // GET - Get doctor's appointments
  },

  // Patient specific
  PATIENT: {
    GET_ALL: "/patient", // GET - List patients
    GET_BY_ID: (id: number) => `/patient/${id}`, // GET - Get patient details
    GET_APPOINTMENTS: (id: number) => `/patient/${id}/appointments`, // GET - Get patient's appointments
  },

  // Authentication
  AUTH: {
    LOGIN: "/auth/login", // POST - Login
    REGISTER: "/auth/register", // POST - Register
    LOGOUT: "/auth/logout", // POST - Logout
  },
}

export const API_REQUEST_EXAMPLES = {
  MEDICINE: {
    CREATE: {
      method: "POST",
      endpoint: "/medicine",
      body: {
        name: "Aspirin",
        form: "Tablet",
        details: "500mg, pain relief",
      },
    },
    ADD_TO_PRESCRIPTION: {
      method: "POST",
      endpoint: "/prescription-medicine",
      body: {
        prescriptionId: 1,
        medicines: [
          {
            medicineId: 1,
            dose: "500mg",
            duration: "7 days",
            instructions: "Take twice daily",
          },
        ],
      },
    },
  },
  PRESCRIPTION: {
    CREATE: {
      method: "POST",
      endpoint: "/prescription",
      body: {
        appointmentId: 1,
        notes: "Follow up in 2 weeks",
      },
    },
    UPDATE: {
      method: "PUT",
      endpoint: "/prescription/1",
      body: {
        notes: "Updated notes",
      },
    },
  },
}
