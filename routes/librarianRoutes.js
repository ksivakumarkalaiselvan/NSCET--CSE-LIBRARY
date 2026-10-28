const express = require('express');
const router = express.Router();
const librarianController = require('../controllers/librarianController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, requireRole('admin'), librarianController.getLibrarians);
router.post('/', authMiddleware, requireRole('admin'), librarianController.addLibrarian);
router.put('/:id/toggle-status', authMiddleware, requireRole('admin'), librarianController.toggleLibrarianStatus);
// Only admin can remove librarian
router.delete('/:id', authMiddleware, requireRole('admin'), librarianController.deleteLibrarian);

module.exports = router;
