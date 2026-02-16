# Full Stack Assignment Project

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure register/login with JWT and bcrypt hashing.
- **Password Recovery**: Support for secure Email reset links and 6-digit OTP verification.
- **Task Management**: Full CRUD operations with priorities, due dates, categories, and tags.
- **Advanced Filtering**: Search and filter tasks by status, priority, and category.
- **Real-time Notifications**: Automated alerts for upcoming deadlines and system events.

- **Security**: Rate limiting, MongoDB sanitization, and XSS protection.
- **Premium UI**: Responsive design with Tailwind CSS, Framer Motion animations, and Toast notifications.

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

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local installation
- Gmail App Password (for email services)


## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fullstack-assignment
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `backend/` directory (use `.env.example` as a template).
   - Set `MONGO_URI`, `JWT_SECRET`, and `EMAIL` credentials.

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:3001

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

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


## Security Features

- **Rate Limiting**: Protects auth and reset routes from brute-force.
- **Sanitization**: Prevents NoSQL injection and XSS.
- **Secure Tokens**: Uses SHA256 for password reset tokens.
- **Simulation Mode**: Backend logs links/OTPs to console if API keys aren't provided.

## License

This project is licensed under the ISC License.
