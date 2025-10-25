// Client-side wrappers to call Next.js API routes following the contract.
async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!json) throw { code: 'INVALID_RESPONSE', message: 'Server returned invalid JSON' };
  if (json.success) return json.data;
  // Throw object containing code/message so callers can present them.
  throw { code: json.error || 'UNKNOWN_ERROR', message: json.message || 'Unknown error' };
}

async function getDoctors(q, specialization) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (specialization) params.set('specialization', specialization);
  const res = await fetch('/api/doctors?' + params.toString());
  return handleResponse(res);
}

async function getDoctor(id) {
  const res = await fetch(`/api/doctors/${id}`);
  return handleResponse(res);
}

async function getAppointments(patientId) {
  const res = await fetch(`/api/appointments?patient_id=${encodeURIComponent(patientId)}`);
  return handleResponse(res);
}

async function bookAppointment(payload) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

async function cancelAppointment(id, patientId) {
  const res = await fetch(`/api/appointments/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId }),
  });
  return handleResponse(res);
}

async function getPrescriptions(patientId) {
  const res = await fetch(`/api/prescriptions?patient_id=${encodeURIComponent(patientId)}`);
  return handleResponse(res);
}

async function getPrescription(id) {
  const res = await fetch(`/api/prescriptions/${id}`);
  return handleResponse(res);
}

module.exports = {
  getDoctors,
  getDoctor,
  getAppointments,
  bookAppointment,
  cancelAppointment,
  getPrescriptions,
  getPrescription,
};
