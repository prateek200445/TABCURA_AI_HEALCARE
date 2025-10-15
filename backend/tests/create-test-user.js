const fetch = require('node-fetch');

// Test user data
const userData = {
  firstName: "Test",
  lastName: "User",
  email: "testuser@example.com",
  username: "testuser123",
  password: "Password123!",
  gender: "prefer-not-to-say"
};

console.log('==== CREATING TEST USER FOR LOGIN ====');
console.log(`Creating user with email: ${userData.email} and username: ${userData.username}`);

// Make signup request
fetch('http://localhost:3001/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(userData),
})
.then(response => {
  console.log('Response status:', response.status, response.statusText);
  
  return response.text().then(text => {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', text);
      throw new Error('Invalid JSON response');
    }
  });
})
.then(data => {
  console.log('Registration response:', data);
  
  if (data.user && data.token) {
    console.log('✓ Test user created successfully!');
    console.log('=================================');
    console.log('LOGIN CREDENTIALS:');
    console.log(`Email: ${userData.email}`);
    console.log(`Password: ${userData.password}`);
    console.log(`Username: ${userData.username}`);
    console.log('=================================');
  } else {
    console.log('✗ User creation failed or user might already exist');
    console.log('Try logging in with the credentials below:');
    console.log('=================================');
    console.log('LOGIN CREDENTIALS:');
    console.log(`Email: ${userData.email}`);
    console.log(`Password: ${userData.password}`);
    console.log(`Username: ${userData.username}`);
    console.log('=================================');
  }
})
.catch(error => {
  console.error('Error:', error);
  console.log('User may already exist. Try logging in with:');
  console.log('=================================');
  console.log('LOGIN CREDENTIALS:');
  console.log(`Email: ${userData.email}`);
  console.log(`Password: ${userData.password}`);
  console.log('=================================');
});