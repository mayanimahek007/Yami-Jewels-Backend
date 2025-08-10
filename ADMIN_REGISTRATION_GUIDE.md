# Admin Registration Guide

## Overview

This guide explains how to properly register admin users in the Yami Jewels Backend system. The admin registration endpoint is protected and requires authentication with an existing admin user's JWT token.

## Prerequisites

1. The server must be running (`npm start`)
2. You must have an existing admin user in the database
3. You need to obtain a valid JWT token by logging in with an admin user

## Step 0: Create Initial Admin User (First Time Only)

If you don't have any admin users in your database yet, run the following command to create one:

```bash
node create-admin.js
```

This will create an admin user with the following credentials:
- Email: admin@example.com
- Password: adminpass123

## Method 1: Using cURL

### Step 1: Login with an existing admin user

```bash
curl --location 'http://localhost:5000/api/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@example.com",
    "password": "adminpass123"
}'
```

This will return a response with a JWT token. Copy this token for the next step.

### Step 2: Register a new admin user

```bash
curl --location 'http://localhost:5000/api/users/admin/register' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--data-raw '{
    "name": "New Admin User",
    "email": "newadmin@gmail.com",
    "password": "adminpass123",
    "passwordConfirm": "adminpass123",
    "role": "admin"
}'
```

Replace the token in the Authorization header with the actual JWT token you received from the login response in Step 1. The token should look like a long string of characters (example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`).

## Method 2: Using the Test Script

We've provided a test script that automates the process of logging in and registering a new admin user.

### Step 1: Install axios if not already installed

```bash
npm install axios
```

### Step 2: Edit the test script (if needed)

The `test-admin-register.js` script is already configured with default credentials. If you created a different admin user, open the script and update the login credentials to match your admin user:

```javascript
const response = await axios.post('http://localhost:5000/api/users/login', {
  email: 'admin@example.com', // Replace with your admin user email
  password: 'adminpass123'    // Replace with your admin password
});
```

You can also change the details of the new admin user being created in the `registerAdmin` function if needed.

### Step 3: Run the test script

```bash
node test-admin-register.js
```

The script will:
1. Log in with the existing admin credentials
2. Get a valid JWT token
3. Use that token to register a new admin user
4. Display the results of each step

## Troubleshooting

### "You are not logged in" Error

If you receive a "You are not logged in. Please log in to get access." error, check the following:

1. Ensure you've successfully logged in and received a token
2. Check that the token is properly formatted in the Authorization header as `Bearer <token>`
3. Verify that the token hasn't expired
4. Make sure you're including the Authorization header in your request

### Invalid Token Error

If you receive an "Invalid token or authorization failed" error, check the following:

1. Make sure you're using a valid JWT token from an existing admin user
2. Ensure the token is properly formatted in the Authorization header
3. Verify that the user associated with the token still exists in the database
4. Check that the user has the 'admin' role
5. Verify that the JWT_SECRET in your .env file hasn't changed since the token was issued

### Permission Error

If you receive a "You do not have permission to perform this action" error, it means your user account doesn't have the 'admin' role. Only users with the 'admin' role can register new admin users.

### Password Confirmation Error

If you receive a "Passwords do not match" error, ensure that the `password` and `passwordConfirm` fields in your request body have the same value.

### Email Already in Use Error

If you receive an "Email already in use" error, try registering with a different email address that is not already in the database.

## Admin API Endpoints

### Get All Users

To get a list of all users (admin only):

```bash
curl --location 'http://localhost:5000/api/users/admin/users' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
```

Replace the token in the Authorization header with the actual JWT token you received from the login response.

### Register New Admin

To register a new admin user (admin only):

```bash
curl --location 'http://localhost:5000/api/users/admin/register' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--data-raw '{
    "name": "New Admin User",
    "email": "newadmin@gmail.com",
    "password": "adminpass123",
    "passwordConfirm": "adminpass123",
    "role": "admin"
}'
```

## Important Notes

- The JWT token expires after the period specified in the `JWT_EXPIRE` environment variable (currently set to 30 days)
- Only users with the 'admin' role can access the admin endpoints
- All passwords must be at least 8 characters long
- Always replace placeholder tokens with actual JWT tokens obtained from the login endpoint