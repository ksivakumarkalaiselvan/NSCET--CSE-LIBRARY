/**
 * Application Entry Point
 * Used by cloud platforms like Render when running 'node index.js'
 */
const { app } = require('./server');
const config = require('./config/config');

const PORT = process.env.PORT || config.port || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`📚 NSCET & CSE - College Library Management System`);
  console.log(`🚀 Server running on: http://0.0.0.0:${PORT}`);
  console.log(`💾 Storage Mode: [${(process.env.STORAGE_TYPE || config.storageType || 'demo').toUpperCase()}]`);
  console.log(`✨ Environment: ${process.env.NODE_ENV || config.nodeEnv}`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
