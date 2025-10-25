import { getDoctors } from '../../../lib/mockData';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET method is supported'
    });
  }

  const { q, specialization } = req.query;

  try {
    const doctors = getDoctors(q, specialization);
    return res.json({ success: true, data: doctors });
  } catch (err) {
    console.error('GET /api/doctors error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch doctors'
    });
  }
}
