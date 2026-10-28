const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBookInput } = require('../middleware/validationMiddleware');

// Public or student-accessible endpoints
router.get('/', optionalAuthMiddleware, bookController.getBooks);
router.get('/categories', bookController.getCategories);
router.get('/:id', optionalAuthMiddleware, bookController.getBookById);

// Admin & Librarian protected endpoints
router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'librarian'),
  validateBookInput,
  bookController.addBook
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin', 'librarian'),
  bookController.updateBook
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin', 'librarian'),
  bookController.deleteBook
);

module.exports = router;
