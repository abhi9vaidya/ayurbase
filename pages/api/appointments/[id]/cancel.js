import { cancelAppointment } from '../../../../lib/mockData';

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only PUT method is supported'
    });
  }

  const { id } = req.query;
  const { patientId } = req.body;

  if (!id || !patientId) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_PARAM',
      message: 'appointment id and patientId are required'
    });
  }

  try {
    const appointment = cancelAppointment(id, patientId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Appointment not found'
      });
    }

    return res.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (err) {
    console.error('PUT /api/appointments/[id]/cancel error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to cancel appointment'
    });
  }
}
