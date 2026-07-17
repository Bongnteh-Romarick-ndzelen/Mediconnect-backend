# MediConnect Hub

A modern healthcare platform connecting patients with providers through secure appointment scheduling, medical records management, prescriptions, reviews, and real-time communication.

## Features

### Core Features
- **User Authentication & Authorization**
  - Role-based access: Patients, Providers, Admins, Support
  - Email verification with secure tokens
  - Password reset via email
  - JWT-based authentication with refresh tokens
  - Account lockout protection

- **Patient Management**
  - Patient profile and medical history
  - Appointment booking and management
  - Medical records access
  - Prescription tracking
  - Review and rating providers
  - Profile picture upload

- **Provider Management**
  - Provider profile and credentials
  - Availability and schedule management
  - Patient records and prescriptions
  - Reviews and ratings display
  - Earnings tracking
  - Profile picture upload

- **Appointment Management**
  - Book, reschedule, cancel appointments
  - Real-time availability checking
  - Appointment status tracking
  - Video consultation links
  - Appointment history

- **Medical Records**
  - Create and manage medical records
  - Attach files and documents
  - Share records securely
  - Record types: consultations, lab results, imaging, surgeries, vaccinations
  - Confidential and shared records

- **Prescriptions**
  - Create and manage prescriptions
  - Medication details with dosage and frequency
  - Refill requests
  - Pharmacy information
  - Prescription status tracking

- **Reviews & Ratings**
  - Rate providers after appointments
  - Comment and feedback
  - Provider responses
  - Anonymous reviews
  - Automatic rating calculation

- **Notifications**
  - In-app notifications
  - Email notifications
  - Appointment reminders
  - Prescription updates
  - Read/unread status

- **File Uploads**
  - Supabase Storage integration
  - Secure file uploads
  - Multiple file types supported
  - Profile pictures
  - Medical documents

- **Admin Dashboard**
  - User management
  - Appointment oversight
  - Platform statistics
  - Activity monitoring

### Technical Features
- RESTful API with Express.js
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- Socket.IO for real-time features
- Email notifications via Nodemailer
- File storage via Supabase Storage
- Rate limiting and security middleware
- Comprehensive error handling
- Request logging and monitoring

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT with refresh tokens
- **File Storage**: Supabase Storage
- **Email**: Nodemailer (Gmail SMTP)
- **Real-time**: Socket.IO
- **Validation**: Zod

### Infrastructure
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Email**: Gmail SMTP

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mediconnect-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRE=15m
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRE=7d

   # Database (Supabase)
   DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true&prepared_statements=false

   # Email Configuration (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@mediconnect.com

   # Supabase Storage
   SUPABASE_URL=https://[project-id].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_STORAGE_BUCKET=mediconnect-files

   # Frontend URLs
   FRONTEND_URL=http://localhost:3000
   FRONTEND_RESET_PASSWORD_URL=http://localhost:3000/reset-password
   FRONTEND_VERIFY_EMAIL_URL=http://localhost:3000/verify-email

   # Security
   BCRYPT_SALT_ROUNDS=12
   MAX_LOGIN_ATTEMPTS=5
   LOCK_DURATION_MINUTES=30
   ```

4. **Set up the database**
   
   Generate Prisma client:
   ```bash
   npx prisma generate
   ```

   Push schema to database:
   ```bash
   npx prisma db push
   ```

   Or run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. **Create Supabase Storage bucket**
   
   - Go to Supabase Dashboard → Storage
   - Create bucket named `mediconnect-files`
   - Enable "Public bucket"

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user profile

### Patients
- `GET /api/patients/me` - Get current patient profile
- `PUT /api/patients/me` - Update current patient profile
- `GET /api/patients/:id` - Get patient by ID (Admin/Support)
- `GET /api/patients` - List patients (Admin/Support)
- `PUT /api/patients/:id` - Update patient (Admin/Support)
- `DELETE /api/patients/:id` - Deactivate patient (Admin)
- `POST /api/patients/avatar` - Upload profile picture
- `DELETE /api/patients/avatar` - Delete profile picture

### Providers
- `GET /api/providers/me` - Get current provider profile
- `PUT /api/providers/me` - Update current provider profile
- `GET /api/providers/:id` - Get provider by ID
- `GET /api/providers` - List providers
- `PUT /api/providers/:id` - Update provider (Admin)
- `GET /api/providers/:id/availability` - Get provider availability
- `POST /api/providers/me/availability` - Create availability slot
- `PUT /api/providers/me/availability/:id` - Update availability slot
- `DELETE /api/providers/me/availability/:id` - Delete availability slot
- `POST /api/providers/avatar` - Upload profile picture
- `DELETE /api/providers/avatar` - Delete profile picture

### Appointments
- `POST /api/appointments` - Create appointment (Patient)
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `POST /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/:id/history` - Get appointment history

### Medical Records
- `POST /api/medical-records` - Create medical record (Provider/Admin)
- `GET /api/medical-records/:id` - Get medical record
- `GET /api/medical-records` - List medical records
- `PUT /api/medical-records/:id` - Update medical record (Provider/Admin)
- `DELETE /api/medical-records/:id` - Delete medical record (Provider/Admin)

### Prescriptions
- `POST /api/prescriptions` - Create prescription (Provider/Admin)
- `GET /api/prescriptions/:id` - Get prescription
- `GET /api/prescriptions` - List prescriptions
- `PUT /api/prescriptions/:id` - Update prescription (Provider/Admin)
- `POST /api/prescriptions/:id/refill` - Request refill (Patient)

### Reviews
- `POST /api/reviews` - Create review (Patient)
- `GET /api/reviews/:id` - Get review
- `GET /api/reviews` - List reviews
- `PUT /api/reviews/:id` - Update review (Patient)
- `POST /api/reviews/:id/respond` - Respond to review (Provider)
- `DELETE /api/reviews/:id` - Delete review (Patient/Admin)

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/:id` - Get notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Delete all notifications

### File Uploads
- `POST /api/uploads` - Upload file

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user
- `GET /api/admin/appointments` - List all appointments
- `PUT /api/admin/appointments/:id` - Update appointment

## Database Schema

### Key Models
- **User** - Base user account with authentication
- **Profile** - Extended user profile information
- **Patient** - Patient-specific data and medical info
- **Provider** - Provider credentials and settings
- **Appointment** - Appointment details and status
- **MedicalRecord** - Patient medical records
- **Prescription** - Medication prescriptions
- **Review** - Provider reviews and ratings
- **Notification** - User notifications
- **AvailableSlot** - Provider availability slots

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── constants.ts  # App constants and enums
│   └── database.ts   # Database connection
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── routes/           # API routes
├── schemas/          # Validation schemas
├── services/         # Business logic
├── types/            # TypeScript types
├── utils/            # Utility functions
└── server.ts         # Entry point
```

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma database browser
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations
- `npx prisma db push` - Push schema to database

### Environment Variables
See `.env.example` for required environment variables.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Input validation with Zod
- SQL injection protection via Prisma
- File type and size validation
- Role-based access control
- CORS configuration

## License

[MIT](LICENSE)

## Support

For support, email support@mediconnect.com or create an issue in the repository.
