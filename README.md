# Yami Jewels Backend API

This is the backend API for Yami Jewels, a jewelry store application. It provides user authentication, profile management, and admin functionalities.

## Features

- User authentication (register, login)
- User profile management
- Password reset functionality
- Admin user management

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email services

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/yami-jewels
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

### Running the Application

- Development mode:
  ```
  npm run dev
  ```
- Production mode:
  ```
  npm start
  ```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/forgotPassword` - Request password reset
- `PATCH /api/users/resetPassword/:token` - Reset password with token

### User Profile (Protected Routes)

- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/updateProfile` - Update user profile
- `PATCH /api/users/updatePassword` - Update password

### Admin Routes

- `GET /api/users` - Get all users (admin only)

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```