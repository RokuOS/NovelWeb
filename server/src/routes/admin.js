const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/auth');

// Áp dụng middleware isAdmin cho tất cả các routes
router.use(isAdmin);

// Dashboard routes
router.get('/stats', adminController.getStats);
router.get('/stories/recent', adminController.getRecentStories);
router.get('/users/recent', adminController.getRecentUsers);

module.exports = router; 