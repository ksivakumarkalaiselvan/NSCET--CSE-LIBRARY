const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, requireRole('admin', 'librarian'), studentController.getStudents);
router.post('/', authMiddleware, requireRole('admin', 'librarian'), studentController.addStudent);
router.put('/:id/toggle-status', authMiddleware, requireRole('admin', 'librarian'), studentController.toggleStudentStatus);
// Only admin can remove student
router.delete('/:id', authMiddleware, requireRole('admin'), studentController.deleteStudent);

module.exports = router;
