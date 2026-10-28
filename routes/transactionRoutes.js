const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateIssueInput } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, transactionController.getTransactions);

router.post(
  '/issue',
  authMiddleware,
  requireRole('admin', 'librarian'),
  validateIssueInput,
  transactionController.issueBook
);

router.post(
  '/return/:id',
  authMiddleware,
  requireRole('admin', 'librarian'),
  transactionController.returnBook
);

module.exports = router;
