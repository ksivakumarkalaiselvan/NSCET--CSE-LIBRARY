const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password
 */
async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare plain text password with hashed password
 */
async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

/**
 * Generate formatted IDs
 */
function generateId(prefix = 'ID') {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}${random}`;
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate due date given days
 */
function calculateDueDate(issueDate = new Date(), loanDays = 14) {
  const d = new Date(issueDate);
  d.setDate(d.getDate() + loanDays);
  return formatDate(d);
}

/**
 * Calculate overdue days between due date and return/current date
 */
function calculateOverdueDays(dueDateStr, returnDateStr = null) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const compareDate = returnDateStr ? new Date(returnDateStr) : new Date();
  compareDate.setHours(0, 0, 0, 0);

  const diffTime = compareDate.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate fine
 */
function calculateFine(overdueDays, finePerDay = 5.0) {
  return overdueDays * finePerDay;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateId,
  formatDate,
  calculateDueDate,
  calculateOverdueDays,
  calculateFine
};
