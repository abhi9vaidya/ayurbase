# Medicines and Prescriptions Feature Guide

## Overview

This document describes the new medicines and prescriptions management feature added to the Hospital Appointment Management System. The feature enables admins to manage medicines inventory, doctors to create and edit prescriptions, and patients to view their prescriptions.

## Features

### 1. Admin - Medicines Management
**Location**: `/admin/medicines`

**Capabilities**:
- View all medicines in the system
- Add new medicines with form type (Tablet, Capsule, Syrup, etc.)
- Edit existing medicines
- Delete medicines (if not in use in any prescriptions)
- Search medicines by name

**Permission Required**: ADMIN role

### 2. Doctor - Prescription Creation
**Location**: `/doctor/appointments` with prescription modal

**Capabilities**:
- View completed appointments
- Create new prescriptions for completed appointments
- Add multiple medicines to a prescription with:
  - Dosage information
  - Duration of treatment
  - Special instructions
- Edit existing prescriptions
- Add notes to prescriptions

**Permission Required**: DOCTOR role

### 3. Patient - View Prescriptions
**Location**: `/patient/prescriptions`

**Capabilities**:
- View all prescriptions from completed appointments
- View detailed medicine information
- Print prescriptions (for physical or digital records)
- Export prescription details

**Permission Required**: PATIENT role

## API Endpoints

### Medicine Management
\`\`\`
GET    /medicine                  - List all medicines (with optional search)
POST   /medicine                  - Create new medicine (Admin only)
GET    /medicine/:id              - Get medicine details
PUT    /medicine/:id              - Update medicine (Admin only)
DELETE /medicine/:id              - Delete medicine (Admin only)
\`\`\`

### Prescription Management
\`\`\`
GET    /prescription              - List prescriptions (filtered by role)
POST   /prescription              - Create new prescription (Doctor only)
GET    /prescription/:id          - Get prescription with medicines
PUT    /prescription/:id          - Update prescription notes (Doctor/Admin)
\`\`\`

### Prescription Medicines
\`\`\`
POST   /prescription-medicine     - Add medicines to prescription (Doctor/Admin)
DELETE /prescription-medicine     - Remove medicine from prescription (Doctor/Admin)
\`\`\`

## Database Schema

### MEDICINE Table
\`\`\`sql
MEDICINE_ID    NUMBER (Primary Key)
NAME           VARCHAR2(100) - Medicine name
FORM           VARCHAR2(50) - Type: Tablet, Capsule, Syrup, etc.
DETAILS        VARCHAR2(255) - Additional details (strength, warnings, etc.)
\`\`\`

### PRESCRIPTION_MED Table
\`\`\`sql
PRESCRIPTION_ID  NUMBER - Foreign Key to PRESCRIPTIONS
MEDICINE_ID      NUMBER - Foreign Key to MEDICINE
DOSE             VARCHAR2(50) - Dosage information
DURATION         VARCHAR2(50) - Treatment duration
INSTRUCTIONS     VARCHAR2(255) - Special instructions for patient
\`\`\`

## Workflow

### Creating a Prescription (Doctor's Perspective)
1. Navigate to "My Appointments" from doctor dashboard
2. Filter for "COMPLETED" appointments
3. Click "Add Prescription" on the appointment
4. Add prescription notes (optional)
5. Click "Add Medicine to Prescription"
6. Select medicine, enter dose, duration, and instructions
7. Click "Add Medicine" to add more medicines
8. Click "Save Prescription" when finished

### Viewing Prescriptions (Patient's Perspective)
1. Navigate to "My Prescriptions" from patient dashboard
2. View list of prescriptions from completed appointments
3. Click "View Details" to see full prescription
4. Click "Print" to print or save as PDF

### Managing Medicines (Admin's Perspective)
1. Navigate to "Medicines" from admin dashboard
2. View all medicines in the system
3. Click "Add Medicine" to create new medicine
4. Use search to find specific medicines
5. Click "Edit" to update medicine information
6. Click "Delete" to remove medicine (if not in use)

## Code Structure

### Components
- `components/prescription-form.tsx` - Reusable form for creating/editing prescriptions

### Pages
- `app/admin/medicines/page.tsx` - Admin medicines dashboard
- `app/doctor/appointments/page.tsx` - Enhanced with prescription creation
- `app/patient/prescriptions/page.tsx` - Patient prescriptions view

### API Routes
- `app/api/medicine/route.ts` - Medicine CRUD operations
- `app/api/medicine/[id]/route.ts` - Individual medicine operations
- `app/api/prescription-medicine/route.ts` - Prescription-medicine linking
- `app/api/prescription/[id]/route.ts` - Enhanced with editing capability

### Utilities
- `lib/medicine-utils.ts` - Medicine-related utility functions
- `lib/prescription-utils.ts` - Prescription-related utility functions
- `lib/role-utils.ts` - Role-based authorization utilities
- `lib/constants.ts` - Application constants
- `lib/error-handler.ts` - Centralized error handling
- `lib/api-endpoints.ts` - API endpoint documentation

## Security Considerations

1. **Role-Based Access Control**:
   - Only admins can manage medicines
   - Only doctors can create prescriptions for their own appointments
   - Admins can edit any prescription
   - Patients can only view their own prescriptions

2. **Data Validation**:
   - All inputs are validated on both client and server
   - Medicine names are unique
   - Prescriptions can only be created for completed appointments
   - Medicines cannot be deleted if in use

3. **Permission Checks**:
   - API routes verify user role and ownership
   - Frontend hides unauthorized options
   - Unauthorized requests return 403 Forbidden

## Error Handling

All operations include comprehensive error handling:
- Network errors
- Validation errors
- Authorization errors (401, 403)
- Not found errors (404)
- Conflict errors (409)

Toast notifications inform users of success/failure.

## Future Enhancements

Potential improvements for future versions:
1. Batch import medicines from CSV
2. Medicine expiry tracking
3. Prescription history and archival
4. Medicine substitutes/alternatives
5. Dosage calculation based on patient weight
6. Prescription renewal requests
7. Integration with pharmacy systems
8. Medicine interaction warnings
9. Prescription sharing via email
10. Medicine side effects tracker

## Testing Checklist

- [ ] Admin can create, edit, delete medicines
- [ ] Doctors can create prescriptions only for completed appointments
- [ ] Patients can view prescriptions after appointment completion
- [ ] Search functionality works correctly
- [ ] Print functionality generates correct format
- [ ] Error messages display appropriately
- [ ] Unauthorized actions are blocked
- [ ] Data persists correctly in database
- [ ] Performance is acceptable with many medicines/prescriptions

## Support

For issues or questions, refer to the API documentation in `lib/api-endpoints.ts` or contact the development team.
