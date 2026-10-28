const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', settingsController.getSettings);
router.put('/', authMiddleware, requireRole('admin'), settingsController.updateSettings);

module.exports = router;
