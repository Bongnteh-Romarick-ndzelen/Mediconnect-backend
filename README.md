MediConnect Hub - Backend API

    A comprehensive telemedicine platform backend connecting patients with healthcare providers through secure video consultations.

📋 Table of Contents

    Overview

    Features

    Technology Stack

    Prerequisites

    Installation

    Environment Setup

    Database Setup

    Running the Application

    API Endpoints

    Project Structure

    Deployment

    Contributing

    License

🚀 Overview

MediConnect Hub is a secure and scalable telemedicine platform backend built with Node.js, Express, and Prisma. It enables seamless connections between patients and healthcare providers through appointment scheduling, video consultations, and electronic health records management.
Key Capabilities

    Patient Management - Register, update, and manage patient profiles

    Provider Management - Healthcare provider onboarding and scheduling

    Appointment Booking - Real-time slot availability and booking

    Video Consultations - WebRTC-based secure video calls

    Medical Records - Secure storage and retrieval of patient health records

    Prescriptions - Digital prescription management

    Billing & Payments - Integrated invoicing and payment processing

✨ Features
Core Features
Feature	Description
🔐 Authentication	JWT-based secure authentication with refresh tokens
👤 User Management	Role-based access control (Patient, Provider, Admin, Support)
📅 Appointments	Schedule, reschedule, and cancel appointments
🏥 Provider Search	Search and filter healthcare providers by specialty, location, rating
💊 Prescriptions	Create, manage, and refill digital prescriptions
📁 Medical Records	Secure storage and sharing of medical records
💳 Billing	Automated invoicing and payment processing
🔔 Notifications	Email and in-app notifications for appointments and updates
📊 Analytics	Platform usage and performance metrics
🛠 Technology Stack
Backend
Technology	Version	Purpose
Node.js	18.x LTS	JavaScript runtime
Express.js	4.18.x	Web framework
TypeScript	5.x	Type-safe development
Prisma	7.8.x	ORM & database toolkit
PostgreSQL	15.x	Primary database
Redis	7.x	Caching & session management
JWT	-	Authentication
Socket.IO	4.x	Real-time communication
WebRTC	-	Video consultation
Database Hosting

    Supabase - PostgreSQL hosting with free tier (recommended)

    Local PostgreSQL - For development

    AWS RDS / Azure PostgreSQL - For production

📋 Prerequisites

Before you begin, ensure you have the following installed:
Tool	Version	Check Command
Node.js	v18.x or higher	node --version
npm	v8.x or higher	npm --version
Git	Latest	git --version
PostgreSQL	v15.x	psql --version
Optional

    Docker - For containerized deployment

    Redis - For caching (optional)

    Postman - For API testing

📦 Installation
1. Clone the Repository
bash

git clone https://github.com/yourusername/mediconnect-backend.git
cd mediconnect-backend

2. Install Dependencies
bash

npm install

This will install all required dependencies including:

    Express.js and related middleware

    Prisma ORM

    JWT authentication libraries

    Validation libraries

    Logging and utility libraries

3. Create Environment File

Copy the example environment file:
bash

cp .env.example .env

4. Generate Prisma Client

Generate the Prisma database client:
bash

npx prisma generate

5. Set Up Database

Push the schema to your database:
bash

npx prisma db push

6. (Optional) Seed Initial Data

Seed the database with sample data:
bash

npx prisma db seed

7. Start the Server
Development Mode (with auto-reload)
bash

npm run dev

Production Mode
bash

npm run build
npm start

🔧 Environment Setup

Create a .env file in the root directory with the following variables:
Basic Configuration
env

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development
API_VERSION=v1

Database Configuration
env

# ============================================
# DATABASE - Supabase (Recommended)
# ============================================
# Session Pooler (for Prisma CLI - migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:YOUR_PASSWORD@db.[project-ref].supabase.co:5432/postgres"

# Transaction Pooler (for application runtime)
DATABASE_URL="postgresql://postgres.[project-ref]:YOUR_PASSWORD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ============================================
# DATABASE - Local PostgreSQL (Development)
# ============================================
# DATABASE_URL="postgresql://postgres:password@localhost:5432/mediconnect"
# DIRECT_URL="postgresql://postgres:password@localhost:5432/mediconnect"

Authentication Configuration
env

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

Frontend Configuration
env

# ============================================
# FRONTEND
# ============================================
FRONTEND_URL=http://localhost:3000
FRONTEND_RESET_PASSWORD_URL=http://localhost:3000/reset-password
FRONTEND_VERIFY_EMAIL_URL=http://localhost:3000/verify-email

Email Configuration
env

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@mediconnect.com

Security Configuration
env

# ============================================
# SECURITY
# ============================================
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

🗄️ Database Setup
Option 1: Using Supabase (Recommended)

Step 1: Create a free account at Supabase

Step 2: Create a new project and note your:

    Project Reference ID

    Database Password

    Region

Step 3: Get your connection strings:

    Go to your project dashboard

    Click "Connect" (top right)

    Copy the Session Pooler URL (for DIRECT_URL)

    Copy the Transaction Pooler URL (for DATABASE_URL)

Step 4: Update your .env file with the URLs