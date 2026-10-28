const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const studentRoutes = require('./routes/studentRoutes');
const librarianRoutes = require('./routes/librarianRoutes');
const statsRoutes = require('./routes/statsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve Frontend Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    storageMode: config.storageType,
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/librarians', librarianRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

// Fallback handler for Single Page Application
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint "${req.originalUrl}" not found.`
    });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server when executed directly
let server = null;
if (require.main === module) {
  server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`📚 NSCET & CSE - College Library Management System`);
    console.log(`🚀 Server running on: http://localhost:${config.port}`);
    console.log(`💾 Storage Mode: [${config.storageType.toUpperCase()}]`);
    console.log(`✨ Environment: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };
