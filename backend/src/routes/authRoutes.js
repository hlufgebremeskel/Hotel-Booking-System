const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, getAllUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// profile
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Admin only - User management
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
