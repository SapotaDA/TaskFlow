# Full Stack Assignment Project

A full-stack task management application built with React, Node.js, Express, and MongoDB.

---

## Features

- **User Authentication**: Secure register/login with JWT and bcrypt hashing.
- **Password Recovery**: Secure email reset links and 6-digit OTP verification.
- **Task Management**: Full CRUD with priorities, due dates, categories, and tags.
- **Advanced Filtering**: Search and filter tasks by status, priority, and category.
- **Real-time Notifications**: Automated alerts for deadlines and system events.
- **Security**: Rate limiting, MongoDB sanitization, and XSS protection.
- **Premium UI**: Responsive design with Tailwind CSS, Framer Motion, and Toast notifications.

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- Axios for API calls
- React Router for navigation
- Lucide React (Icons)

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Nodemailer (Email) for password recovery
- express-validator for input validation
- helmet & express-rate-limit for security

---

## Project Structure

```
fullstack-assignment/
├── backend/
│   ├── config/          # DB Connection
│   ├── middleware/      # Auth, Rate Limiting, Sanitization
│   ├── models/          # User & Task Schemas
│   ├── routes/          # Auth & Task API Routes
│   ├── utils/           # Email service
│   └── server.js        # Entry Point
├── frontend/
│   ├── src/
│   │   ├── components/  # Pages & UI Components
│   │   ├── context/     # Auth & Toast Context
│   │   ├── services/    # API (Axios) config
│   │   └── App.jsx      # Root component
│   └── vite.config.js

└── README.md
```

---

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local installation
- Gmail App Password (for email services)

---

## Environment Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in:
   - `PORT` (default: 3001)
   - `MONGO_URI` (your MongoDB connection string)
   - `JWT_SECRET` (use a secure random string)
   - `FRONTEND_URL` (default: http://localhost:5173)
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (for email/OTP)

---

## Installation

```bash
git clone <repository-url>
cd fullstack-assignment
```

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ../frontend
npm install
```

---

## Running the Application (Development)

### Backend
```bash
cd backend
npm run dev
```
Runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm run dev
```
Runs on http://localhost:5173

The frontend is configured to proxy `/api` requests to the backend.

---

## Build for Production

### Frontend
```bash
cd frontend
npm run build
```
Output in `frontend/dist/`

### Backend
```bash
cd backend
npm start
```
Use a process manager (e.g., PM2) for production. Backend serves API only; use a static server or service for frontend.

---

## Deployment & Security Notes

- Set strong secrets in `.env` for production.
- Use HTTPS in production.
- Set up a production MongoDB (Atlas or managed).
- Configure a real SMTP provider for email.
- Consider using a process manager (e.g., PM2) for backend.

---

## Linting & Formatting

Run `npm run lint` in `frontend` to check for code style issues.

---


## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send reset link
- `POST /api/auth/send-otp-email` - Send Email OTP
- `POST /api/auth/verify-otp-identifier` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with token/OTP

### Tasks (Protected routes)
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/stats` - Get task statistics

### Notifications (Protected routes)
- `GET /api/notifications` - Get all user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

---

## Security Features

- **Rate Limiting**: Protects auth and reset routes from brute-force.
- **Sanitization**: Prevents NoSQL injection and XSS.
- **Secure Tokens**: Uses SHA256 for password reset tokens.
- **Simulation Mode**: Backend logs links/OTPs to console if API keys aren't provided.

---

## License

This project is licensed under the ISC License.
