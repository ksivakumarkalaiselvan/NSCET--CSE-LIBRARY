require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'scholarlib_super_secret_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Storage mode: 'demo' (in-memory demo store with rich initial data) or 'sheets' (Google Sheets Web App / API)
  storageType: process.env.STORAGE_TYPE || 'demo',
  
  // Google Sheets Web App endpoint (provided by user after deploying Google Apps Script)
  googleSheets: {
    scriptUrl: process.env.GOOGLE_SHEETS_SCRIPT_URL || '',
    sheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    apiKey: process.env.GOOGLE_SHEETS_API_KEY || ''
  },

  // Library Business Rules
  libraryRules: {
    defaultLoanDays: parseInt(process.env.DEFAULT_LOAN_DAYS || '14', 10),
    finePerDay: parseFloat(process.env.FINE_PER_DAY || '5.0'),
    maxBorrowLimit: parseInt(process.env.MAX_BORROW_LIMIT || '3', 10)
  }
};
