export async function exampleAdminCreateMedicines() {
  const adminToken = "admin_jwt_token"

  const medicines = [
    {
      name: "Aspirin",
      form: "Tablet",
      details: "500mg pain reliever and fever reducer",
    },
    {
      name: "Amoxicillin",
      form: "Capsule",
      details: "250mg antibiotic",
    },
    {
      name: "Cough Syrup",
      form: "Syrup",
      details: "Honey-based cough suppressant",
    },
  ]

  // POST /medicine for each medicine
  // Expected: 201 Created for each
}

// Example 2: Doctor creates prescription after appointment
export async function exampleDoctorCreatePrescription() {
  const doctorToken = "doctor_jwt_token"
  const completedAppointmentId = 42

  // 1. Get completed appointment
  // GET /doctor/123/appointments (filtered by status=COMPLETED)

  // 2. Create prescription
  // POST /prescription { appointmentId: 42, notes: "Follow up in 2 weeks" }
  // Returns: { prescriptionId: 101 }

  // 3. Add medicines to prescription
  // POST /prescription-medicine
  // {
  //   prescriptionId: 101,
  //   medicines: [
  //     { medicineId: 1, dose: "500mg", duration: "7 days", instructions: "Take twice daily" },
  //     { medicineId: 2, dose: "250mg", duration: "5 days", instructions: "Take with food" }
  //   ]
  // }

  // Expected: Medicines successfully added
}

// Example 3: Patient views prescription
export async function examplePatientViewPrescription() {
  const patientToken = "patient_jwt_token"

  // 1. Get list of prescriptions
  // GET /prescription
  // Returns: All prescriptions for this patient from completed appointments

  // 2. Get prescription details
  // GET /prescription/101
  // Returns: {
  //   prescriptionId: 101,
  //   appointmentId: 42,
  //   doctorName: "Dr. Smith",
  //   notes: "Follow up in 2 weeks",
  //   createdOn: "2024-01-15",
  //   medicines: [
  //     { medicineId: 1, name: "Aspirin", dose: "500mg", duration: "7 days", instructions: "..." },
  //     { medicineId: 2, name: "Amoxicillin", dose: "250mg", duration: "5 days", instructions: "..." }
  //   ]
  // }

  // 3. Print prescription (browser-based)
  // Calls window.print() with formatted HTML
}

// Example 4: Admin manages medicines
export async function exampleAdminManageMedicines() {
  // List medicines
  // GET /medicine?search=aspirin
  // Update medicine
  // PUT /medicine/1
  // { name: "Aspirin", form: "Tablet", details: "Updated details" }
  // Delete medicine (only if not in any prescriptions)
  // DELETE /medicine/1
  // Expected: 409 Conflict if medicine is in use
}

// Example 5: Doctor edits prescription
export async function exampleDoctorEditPrescription() {
  // 1. Get current prescription
  // GET /prescription/101
  // 2. Update notes
  // PUT /prescription/101
  // { notes: "Updated notes: Patient has allergy to penicillin" }
  // 3. Add more medicines
  // POST /prescription-medicine
  // { prescriptionId: 101, medicines: [{ medicineId: 3, dose: "5ml", ... }] }
  // 4. Remove medicine
  // DELETE /prescription-medicine?prescriptionId=101&medicineId=2
}

// Example 6: Complete workflow
export async function exampleCompleteWorkflow() {
  console.log("=== Complete Prescription Workflow ===")

  // Step 1: Admin prepares medicines inventory
  console.log("\n1. Admin creates medicines...")
  // - Creates 10+ medicines in the system
  // - Various forms: tablets, capsules, syrups, injections

  // Step 2: Patient books appointment
  console.log("2. Patient books appointment...")
  // - Patient reserves appointment with Dr. Smith on 2024-01-15

  // Step 3: Appointment takes place
  console.log("3. Appointment completed...")
  // - Doctor marks appointment as COMPLETED

  // Step 4: Doctor creates prescription
  console.log("4. Doctor creates prescription...")
  // - Doctor adds 3 medicines to prescription
  // - Specifies dosage, duration, and instructions

  // Step 5: Patient views prescription
  console.log("5. Patient views prescription...")
  // - Patient sees medicines prescribed
  // - Can print or export prescription

  // Step 6: Patient takes medicines
  console.log("6. Patient follows treatment plan...")
  // - Patient uses prescription to get medicines from pharmacy
  // - Follows dosage and duration instructions

  console.log("\n=== Workflow Complete ===")
}

// Example 7: Error handling
export async function exampleErrorHandling() {
  // Scenario 1: Duplicate medicine name
  // POST /medicine { name: "Aspirin", form: "Tablet", ... }
  // Expected: 409 Conflict
  // Scenario 2: Delete medicine in use
  // DELETE /medicine/1 (where medicine is used in prescriptions)
  // Expected: 409 Conflict with message
  // Scenario 3: Unauthorized access
  // Patient tries to: PUT /medicine/1
  // Expected: 403 Forbidden
  // Scenario 4: Invalid medicine in prescription
  // POST /prescription-medicine with invalid medicineId
  // Expected: 404 Not Found
  // Scenario 5: Prescription for non-completed appointment
  // POST /prescription { appointmentId: 99 } (where appointment is SCHEDULED)
  // Expected: 400 Bad Request
}

// Example 8: Authorization verification
export async function exampleAuthorizationChecks() {
  // Admin can:
  // - Create/Edit/Delete medicines
  // - View all prescriptions
  // - Edit any prescription
  // Doctor can:
  // - Create prescriptions for their own completed appointments
  // - Edit their own prescriptions
  // - Add medicines to prescriptions
  // Patient can:
  // - View only their own prescriptions
  // - Cannot create, edit, or delete anything
  // Non-authenticated user:
  // - Cannot access any of these endpoints
  // - Will be redirected to login
}

// Example 9: Data relationships
export async function exampleDataRelationships() {
  // Appointment -> Prescription (1:1 unique)
  // Each appointment can have at most 1 prescription
  // Prescription -> PrescriptionMed (1:Many)
  // One prescription can have many medicines
  // Medicine -> PrescriptionMed (1:Many)
  // One medicine can be in many prescriptions
  // Doctor -> Prescription (1:Many)
  // Doctor can prescribe many prescriptions
  // Patient -> Appointment -> Prescription (1:Many:Many)
  // Patient can have many appointments, each with prescriptions
}

export default {
  exampleAdminCreateMedicines,
  exampleDoctorCreatePrescription,
  examplePatientViewPrescription,
  exampleAdminManageMedicines,
  exampleDoctorEditPrescription,
  exampleCompleteWorkflow,
  exampleErrorHandling,
  exampleAuthorizationChecks,
  exampleDataRelationships,
}
