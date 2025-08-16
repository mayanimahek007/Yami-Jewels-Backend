// Test script for OTP-based forgot password flow
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/users';

async function testOTPForgotPasswordFlow() {
  try {
    console.log('=== Testing OTP-based Forgot Password Flow ===\n');

    // Step 1: Request OTP
    console.log('1. Requesting OTP for forgot password...');
    const forgotPasswordResponse = await axios.post(`${API_BASE_URL}/forgotPassword`, {
      email: 'test@example.com' // Replace with actual email
    });
    console.log('Response:', forgotPasswordResponse.data);
    console.log('OTP sent to email!\n');

    // Step 2: Verify OTP (you would get this from email)
    const testOTP = '123456'; // This would be the actual OTP sent to email
    console.log('2. Verifying OTP...');
    const verifyOTPResponse = await axios.post(`${API_BASE_URL}/verifyOTP`, {
      email: 'test@example.com',
      otp: testOTP
    });
    console.log('Response:', verifyOTPResponse.data);
    console.log('OTP verified successfully!\n');

    // Step 3: Reset password with verified OTP
    console.log('3. Resetting password...');
    const resetPasswordResponse = await axios.post(`${API_BASE_URL}/resetPassword`, {
      email: 'test@example.com',
      otp: testOTP,
      password: 'newpassword123',
      passwordConfirm: 'newpassword123'
    });
    console.log('Response:', resetPasswordResponse.data);
    console.log('Password reset successfully!\n');

    console.log('=== OTP Flow Test Complete ===');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run the test
// testOTPForgotPasswordFlow();

module.exports = { testOTPForgotPasswordFlow };
