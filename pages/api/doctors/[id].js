import { getDoctor } from '../../../lib/mockData';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET method is supported'
    });
  }

  const { id } = req.query;

  try {
    const doctor = getDoctor(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Doctor not found'
      });
    }

    return res.json({
      success: true,
      data: doctor
    });
  } catch (err) {
    console.error('GET /api/doctors/[id] error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch doctor details'
    });
  }
}
