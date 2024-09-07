const express = require('express');
const { getUsers, updateUser, updateUserPassword, deleteUsers } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/users', protect, getUsers);  // Admin check in middleware
router.put('/users/:id', protect, updateUser);  // Admin check in middleware
router.put('/users/:id/edit-password', protect, updateUserPassword);  // Admin check in middleware
router.delete('/users/:id', protect, deleteUsers);

module.exports = router;
