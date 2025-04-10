const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Routes
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const chapterRoutes = require('./routes/chapters');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`, err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Lỗi server',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Middleware xử lý lỗi 404 (các route không tồn tại)
app.use('*', (req, res) => {
  console.log(`Route không tồn tại: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại',
    path: req.originalUrl
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/novelread')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app; 