const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Add detailed logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Configure CORS
app.use(cors({
  origin: true, // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescription');
const symptomCheckerRoutes = require('./routes/symptomChecker');

app.use('/api/auth', authRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/symptoms', symptomCheckerRoutes);

// Basic route to test if server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reckon')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the server:`);
  console.log(`1. Health check: http://localhost:${PORT}/api/health`);
  console.log(`2. Root endpoint: http://localhost:${PORT}/`);
})
.on('error', (error) => {
  console.error('Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use, trying ${PORT + 1}...`);
    server.listen(PORT + 1);
  }
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
