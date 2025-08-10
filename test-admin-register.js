const axios = require('axios');

// Function to login and get token
async function loginAndGetToken() {
  try {
    const response = await axios.post('http://localhost:5000/api/users/login', {
      email: 'admin@example.com', // Replace with an existing admin user
      password: 'adminpass123'    // Replace with the correct password
    });
    
    console.log('Login response:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to register a new admin
async function registerAdmin(token) {
  try {
    console.log('Using token:', token);
    const response = await axios.post(
      'http://localhost:5000/api/users/admin/register',
      {
        name: 'New Admin User',
        email: 'newadmin@gmail.com',
        password: 'adminpass123',
        passwordConfirm: 'adminpass123',
        role: 'admin'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Admin registration successful:', response.data);
  } catch (error) {
    console.error('Admin registration failed:', error.response ? error.response.data : error.message);
  }
}

// Main function
async function main() {
  console.log('Attempting to login and register a new admin user...');
  
  const token = await loginAndGetToken();
  if (!token) {
    console.error('Could not get authentication token. Make sure you have an admin user in the database.');
    return;
  }
  
  console.log('Successfully logged in and got token.');
  await registerAdmin(token);
}

// Run the test
main();