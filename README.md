# Full Stack Assignment Project

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register/login) with JWT
- User profile management
- Task CRUD operations (Create, Read, Update, Delete)
- Task search and filtering
- Protected routes with JWT middleware
- Responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation

## Project Structure

```
fullstack-assignment/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (installed and running locally)

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
   - Copy `backend/.env` and update the values if needed
   - Default MongoDB URI: `mongodb://localhost:27017/fullstack-assignment`
   - Default JWT Secret: `your_jwt_secret_here`
   - Default Port: `5000`

## Running the Application

1. Start MongoDB:
   - On Windows: `net start MongoDB` (if installed as service)
   - On macOS/Linux: `mongod`
   - Or use MongoDB Compass/Atlas

2. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   Server will run on http://localhost:5000

3. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

4. Open your browser and navigate to http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks (Protected routes)
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### User Profile (Protected routes)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

## Testing the API

You can test the API endpoints using Postman or curl:

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Task (use token from login response)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Sample Task","description":"This is a sample task","status":"pending"}'
```

## Features Overview

### Authentication
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes middleware

### Task Management
- Create, read, update, and delete tasks
- Task status tracking (pending, in-progress, completed)
- Search tasks by title or description
- Filter tasks by status
- User-specific task isolation

### User Interface
- Responsive design with Tailwind CSS
- Clean and intuitive UI
- Form validation
- Error handling
- Loading states

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS enabled
- Error handling middleware

## Development

- Backend uses nodemon for development
- Frontend uses Vite for fast development
- ESLint for code linting
- Modular code structure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
