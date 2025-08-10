require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  createAdmin();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      mongoose.connection.close();
      return;
    }
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass123',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created successfully:', admin.email);
    
    // Close MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}