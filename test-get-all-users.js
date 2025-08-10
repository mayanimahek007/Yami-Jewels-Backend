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

// Function to get all users
async function getAllUsers(token) {
  try {
    console.log('Using token:', token);
    const response = await axios.get(
      'http://localhost:5000/api/users/admin/users',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Get all users successful:');
    console.log('Total users:', response.data.results);
    console.log('Users:', response.data.data.users);
  } catch (error) {
    console.error('Get all users failed:', error.response ? error.response.data : error.message);
  }
}

// Main function
async function main() {
  console.log('Attempting to login and get all users...');
  
  const token = await loginAndGetToken();
  if (!token) {
    console.error('Could not get authentication token. Make sure you have an admin user in the database.');
    return;
  }
  
  console.log('Successfully logged in and got token.');
  await getAllUsers(token);
}

// Run the test
main();