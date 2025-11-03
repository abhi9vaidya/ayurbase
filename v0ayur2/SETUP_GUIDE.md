# Hospital Appointment Management System - Setup Guide

## Overview
This is a modern hospital appointment management system built with Next.js 16, React, Tailwind CSS, and OracleDB 23ai-lite. It supports multi-role authentication for Admins, Doctors, and Patients.

## Prerequisites
- Node.js 18+ 
- OracleDB 23ai-lite (Docker or local installation)
- npm or yarn package manager

## Environment Setup

### 1. Oracle Database Setup

If using Docker, start OracleDB 23ai-lite:
\`\`\`bash
docker run -d \
  -e ORACLE_PASSWORD=password \
  -p 1521:1521 \
  -v oradata:/opt/oracle/oradata \
  container-registry.oracle.com/database/free:latest
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:
\`\`\`
ORACLE_USERNAME=system
ORACLE_PASSWORD=password
ORACLE_CONNECTION_STRING=localhost:1521/freepdb1
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here-change-this
\`\`\`

### 4. Initialize Database

The database connection is configured in `lib/db.ts` for OracleDB 23ai-lite (single connection mode).

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` in your browser.

## Project Structure

\`\`\`
hospital-appointment-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── doctor/             # Doctor management
│   │   ├── patient/            # Patient management
│   │   ├── appointment/        # Appointment management
│   │   ├── prescription/       # Prescription management
│   │   └── admin/              # Admin operations
│   ├── admin/                  # Admin dashboard pages
│   ├── doctor/                 # Doctor dashboard pages
│   ├── patient/                # Patient dashboard pages
│   ├── components/             # Shared components (navbar, sidebar)
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles with color variables
│   └── page.tsx                # Home page (redirects based on role)
├── lib/
│   ├── db.ts                   # OracleDB connection (lite mode)
│   ├── auth.ts                 # JWT utilities
│   ├── api-client.ts           # Axios instance
│   ├── utils.ts                # Utility functions
│   └── validation.ts           # Input validation
├── .env.local                  # Environment variables
└── package.json
\`\`\`

## Features

### Authentication
- Multi-role authentication (Admin, Doctor, Patient)
- JWT-based token management
- Bcrypt password hashing
- Role-based access control

### Patient Features
- Dashboard with appointment statistics
- Book appointments with doctors
- View appointment history
- Manage profile

### Doctor Features
- Dashboard with patient appointments
- Manage appointment schedule
- View patient list
- Create prescriptions

### Admin Features
- System-wide dashboard with statistics
- Manage doctors (CRUD operations)
- Manage patients (CRUD operations)
- View and manage appointments
- Generate reports

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /user/profile` - Get user profile

### Doctors
- `GET /doctor` - List all doctors
- `POST /doctor` - Create new doctor (admin only)
- `GET /doctor/[id]` - Get doctor details
- `PUT /doctor/[id]` - Update doctor
- `DELETE /doctor/[id]` - Delete doctor
- `GET /doctor/[id]/appointments` - Get doctor's appointments

### Patients
- `GET /patient` - List all patients
- `POST /patient` - Create new patient
- `GET /patient/[id]` - Get patient details
- `PUT /patient/[id]` - Update patient
- `GET /patient/[id]/appointments` - Get patient's appointments

### Appointments
- `GET /appointment` - List appointments
- `POST /appointment` - Create appointment
- `GET /appointment/[id]` - Get appointment details
- `PUT /appointment/[id]` - Update appointment
- `DELETE /appointment/[id]` - Delete appointment

### Prescriptions
- `GET /prescription` - List prescriptions
- `POST /prescription` - Create prescription
- `GET /prescription/[id]` - Get prescription details

### Admin
- `GET /admin/dashboard` - Get dashboard statistics
- `GET /admin/reports` - Get system reports

## Design & Theme

The application uses a modern minimalist design with:
- **Color Palette**: Blue (#3b82f6), Cyan (#06b6d4), Slate (#64748b), Emerald (#10b981)
- **Typography**: DM Sans for body text
- **Layout**: Responsive grid with flexbox
- **Shadows**: Subtle shadow effects for depth
- **Animations**: Smooth fade-in and slide-in transitions
- **Cards**: Rounded corners (8px border-radius) with subtle shadows

### Customizing Theme

Edit `app/globals.css` CSS variables in the `:root` selector:
\`\`\`css
:root {
  --primary: #3b82f6;        /* Change primary blue */
  --accent: #06b6d4;         /* Change accent cyan */
  --radius: 8px;             /* Change border radius */
  /* ... other variables ... */
}
\`\`\`

## Database Schema

The system expects these main tables in OracleDB:
- `USERS` - User credentials and basic info
- `DOCTORS` - Doctor profiles and specialization
- `PATIENTS` - Patient profiles
- `APPOINTMENTS` - Appointment records
- `PRESCRIPTIONS` - Prescription records
- `MEDICINES` - Medicine catalog

## Security Considerations

1. **JWT Tokens**: Stored in localStorage, consider using HTTP-only cookies in production
2. **Password Hashing**: Uses bcrypt with 10 salt rounds
3. **SQL Injection Prevention**: All queries use parameterized statements
4. **CORS**: Configure CORS_ORIGIN in environment for production
5. **Rate Limiting**: Implement rate limiting on auth endpoints in production

## Deployment

### Vercel Deployment
\`\`\`bash
npm run build
vercel deploy
\`\`\`

Set environment variables in Vercel project settings.

## Troubleshooting

### Database Connection Issues
- Ensure OracleDB is running and accessible
- Check `ORACLE_CONNECTION_STRING` in `.env.local`
- Verify credentials match your database setup

### Login Issues
- Clear browser localStorage
- Check JWT_SECRET is properly set
- Verify user credentials exist in database

### Port Already in Use
\`\`\`bash
# Change port in development
npm run dev -- -p 3001
\`\`\`

## Support

For issues or questions, refer to the API documentation or check the console logs for detailed error messages.
\`\`\`

```env file="" isHidden
