const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const diamondRoutes = require('./routes/diamondRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Serve static files from public directory for images and videos
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/diamonds', diamondRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to Yami Jewels API');
});
// Import error handler
const { errorHandler } = require('./utils/errorHandler');

// Error handling middleware
app.use(errorHandler);

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Connect to database
connectDB();