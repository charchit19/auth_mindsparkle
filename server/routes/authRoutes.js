const express = require('express');
const { registerUser, verifyEmail, loginUser,
    resendVerificationEmail, getUserProfile, updateUserProfile
    , requestResetPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/resend-verification-email', resendVerificationEmail);
router.post('/request-reset-password', requestResetPassword)
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
