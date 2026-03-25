# College Management System

Multi-tenant SaaS for managing students, teachers, and attendance — isolated by `collegeId`.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Joi
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Lucide Icons

## Quick Start

### 1. Start MongoDB

Make sure MongoDB is running locally on port 27017.

### 2. Backend

```bash
cd backend
npm install
npm run seed      # creates Demo College + admin user
npm run dev       # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:3000
```

### 4. Login

- **Email:** admin@demo.com
- **Password:** admin123

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/change-password | Change password |
| GET | /api/students | List students |
| POST | /api/students | Add student |
| PUT | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET | /api/teachers | List teachers |
| POST | /api/teachers | Add teacher |
| PUT | /api/teachers/:id | Update teacher |
| DELETE | /api/teachers/:id | Delete teacher |
| POST | /api/attendance/mark | Mark attendance |
| GET | /api/attendance | Get attendance by date |
| GET | /api/attendance/report | Get attendance report |
| GET | /api/dashboard/stats | Dashboard stats |

All APIs require `Authorization: Bearer <token>` header and automatically scope data by `collegeId` from the JWT.
