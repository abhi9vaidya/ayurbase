import { getAppointments, createAppointment } from '../../../lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { patientId } = req.query;
    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAM',
        message: 'patientId is required'
      });
    }

    try {
      const appointments = getAppointments(patientId);
      return res.json({ success: true, data: appointments });
    } catch (err) {
      console.error('GET /api/appointments error:', err);
      return res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to fetch appointments'
      });
    }
  }

  if (req.method === 'POST') {
    const { doctor_id, patient_id, appt_date, duration, reason } = req.body;

    if (!doctor_id || !patient_id || !appt_date || !duration) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAM',
        message: 'doctor_id, patient_id, appt_date, and duration are required'
      });
    }

    try {
      const appointment = createAppointment({
        doctor_id: Number(doctor_id),
        patient_id: Number(patient_id),
        appt_date,
        duration: Number(duration),
        reason
      });

      return res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment created successfully'
      });
    } catch (err) {
      console.error('POST /api/appointments error:', err);
      return res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to create appointment'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Only GET and POST methods are supported'
  });
}
