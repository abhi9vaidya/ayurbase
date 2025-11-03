# Hospital Appointment Management System

A modern, production-ready healthcare appointment management system built with Next.js 16, React, TailwindCSS v4, and OracleDB 23ai-lite. Features multi-role authentication, appointment booking, doctor management, prescriptions, and admin analytics.

## ✨ Features

### Core Features
- **Multi-role Authentication** - Admin, Doctor, and Patient roles with JWT-based authentication
- **Appointment Booking** - Patients can book appointments with available doctors
- **Doctor Management** - Admins manage doctor profiles and specializations
- **Patient Profiles** - Complete patient information management
- **Prescription Management** - Doctors create and manage prescriptions
- **Admin Dashboard** - System-wide statistics and analytics
- **Modern Design** - Light theme with rounded cards, subtle shadows, smooth animations

### Design
- **Modern Minimalist**: Clean, spacious layout with professional aesthetics
- **Rounded Cards**: 8px border-radius on all containers
- **Subtle Shadows**: Depth without visual clutter
- **Smooth Animations**: Fade-in and slide-in transitions
- **Responsive**: Mobile-first, fully responsive layout

### Security
- JWT token-based authentication
- Bcrypt password hashing (10 salt rounds)
- Role-based access control (RBAC)
- Parameterized SQL queries (SQL injection prevention)
- Input validation and sanitization

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript, TailwindCSS v4
- **Backend**: Next.js API Routes
- **Database**: OracleDB 23ai-lite (single connection mode)
- **HTTP Client**: Axios with interceptors
- **Notifications**: React-Toastify
- **Authentication**: JWT, bcrypt
- **Database Driver**: oracledb (node-oracledb)

## 📁 Project Structure

\`\`\`
app/
├── api/                      # API Routes
│   ├── auth/                # Authentication (register, login, logout)
│   ├── user/                # User profiles
│   ├── doctor/              # Doctor CRUD operations
│   ├── patient/             # Patient CRUD operations
│   ├── appointment/         # Appointment management
│   ├── prescription/        # Prescription management
│   └── admin/               # Admin dashboard & reports
├── patient/                 # Patient dashboard pages
│   ├── dashboard/           # Overview & quick stats
│   ├── book-appointment/    # Appointment booking form
│   └── appointments/        # View & manage appointments
├── doctor/                  # Doctor dashboard pages
│   ├── dashboard/           # Upcoming appointments
│   ├── appointments/        # Full appointment list
│   └── patients/            # Patient directory
├── admin/                   # Admin dashboard pages
│   ├── dashboard/           # System statistics
│   ├── doctors/             # Manage doctors
│   ├── patients/            # Manage patients
│   └── appointments/        # Manage all appointments
├── components/              # Shared components
│   ├── nav-bar.tsx         # Top navigation
│   └── sidebar.tsx         # Side navigation
├── login/                   # Login page
├── register/                # Registration page
├── layout.tsx               # Root layout
├── globals.css              # Global styles & theme
└── page.tsx                 # Home redirect (role-based)

lib/
├── db.ts                    # OracleDB connection (lite mode)
├── auth.ts                  # JWT & password utilities
├── api-client.ts            # Axios instance with auth
├── validation.ts            # Input validation
└── utils.ts                 # Helper utilities
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OracleDB 23ai-lite
- npm or yarn

### Setup

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment**
   Create `.env.local`:
   \`\`\`
   ORACLE_USERNAME=system
   ORACLE_PASSWORD=password
   ORACLE_CONNECTION_STRING=localhost:1521/freepdb1
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   JWT_SECRET=your-secret-key-change-in-production
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access application**
   Open [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#3b82f6` - Brand color
- **Accent Cyan**: `#06b6d4` - Secondary actions
- **Slate Gray**: `#64748b` - Text & borders
- **Emerald Green**: `#10b981` - Success states
- **Amber Yellow**: `#f59e0b` - Warning states
- **Background**: `#ffffff` (light theme)

### Customization
Edit CSS variables in `app/globals.css`:
\`\`\`css
:root {
  --primary: #3b82f6;        /* Change primary color */
  --accent: #06b6d4;         /* Change accent */
  --radius: 8px;             /* Change border radius */
  /* ... all variables customizable ... */
}
\`\`\`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/profile` - Get current user

### Doctors
- `GET /api/doctor` - List all doctors
- `POST /api/doctor` - Create doctor (admin)
- `GET /api/doctor/:id` - Get doctor details
- `PUT /api/doctor/:id` - Update doctor (admin)
- `DELETE /api/doctor/:id` - Delete doctor (admin)
- `GET /api/doctor/:id/appointments` - Get doctor's appointments

### Patients
- `GET /api/patient` - List all patients
- `POST /api/patient` - Create patient
- `GET /api/patient/:id` - Get patient details
- `PUT /api/patient/:id` - Update patient
- `GET /api/patient/:id/appointments` - Get patient's appointments

### Appointments
- `GET /api/appointment` - List appointments
- `POST /api/appointment` - Create appointment
- `GET /api/appointment/:id` - Get details
- `PUT /api/appointment/:id` - Update appointment
- `DELETE /api/appointment/:id` - Cancel appointment

### Prescriptions
- `GET /api/prescription` - List prescriptions
- `POST /api/prescription` - Create prescription (doctor)
- `GET /api/prescription/:id` - Get prescription details
- `PUT /api/prescription/:id` - Update prescription

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/reports` - System reports

## 🔐 Security

**Implemented Best Practices:**
- JWT authentication with secure tokens
- Bcrypt password hashing (10 salt rounds)
- Parameterized SQL queries (SQL injection prevention)
- Role-based access control on all endpoints
- Input validation on client and server
- Secure error messages

**Production Recommendations:**
- Use HTTPS for all communications
- Implement rate limiting on auth endpoints
- Store tokens in HTTP-only cookies
- Configure CORS properly
- Set up audit logging
- Rotate secrets regularly

## 📱 Responsive Design

- **Mobile**: Full-width stacked layouts
- **Tablet**: 2-column grids
- **Desktop**: 3-column grids
- **Large**: Max-width container with padding

## 🛠️ Development

### Commands
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting
\`\`\`

### Database
OracleDB connection is configured in `lib/db.ts` using single connection mode (optimized for 23ai-lite).

## 📚 Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **TROUBLESHOOTING.md** - Common issues & solutions

## 🤝 User Flows

### Patient
1. Register → Login → Dashboard
2. Book appointment with doctor
3. Manage appointments (view, cancel)
4. View appointment history

### Doctor
1. Login → Dashboard
2. View upcoming appointments
3. Manage patient information
4. Create prescriptions

### Admin
1. Login → Dashboard
2. Manage doctors (CRUD)
3. Manage patients (CRUD)
4. Monitor appointments
5. View reports & analytics

## 🐛 Troubleshooting

**Database Connection Issues**
- Verify OracleDB is running: `docker ps`
- Check credentials in `.env.local`
- Verify connection string format

**Authentication Issues**
- Clear localStorage and login again
- Check `JWT_SECRET` is set
- Verify database has user records

**Build Errors**
- Run `npm install` to ensure dependencies
- Check imports use `@/` alias
- Verify TypeScript types are correct

**See TROUBLESHOOTING.md for more help**

## 📈 Performance

- Connection pooling for database efficiency
- Query optimization with proper SQL
- Client-side caching with Axios
- Next.js code splitting
- Optimized images and assets

## ✅ Production Readiness

- Type-safe TypeScript throughout
- Comprehensive error handling
- Security best practices
- Clean, maintainable code
- Environment-based configuration
- Ready for deployment

## 📝 License

MIT

## 🎓 Support

For issues or questions:
1. Check browser console for errors
2. Review server logs
3. See TROUBLESHOOTING.md
4. Check SETUP_GUIDE.md for configuration help
