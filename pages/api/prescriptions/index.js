import { getPrescriptions } from '../../../lib/mockData';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET method is supported'
    });
  }

  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_PARAM',
      message: 'patientId is required'
    });
  }

  try {
    const prescriptions = getPrescriptions(patientId);
    return res.json({
      success: true,
      data: prescriptions
    });
  } catch (err) {
    console.error('GET /api/prescriptions error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch prescriptions'
    });
  }
}
