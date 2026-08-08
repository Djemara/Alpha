// ============================================
// ROUTES/AUTHROUTES.JS
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, resetPassword, resetPasswordConfirm } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/reset-password-confirm', resetPasswordConfirm);

module.exports = router;