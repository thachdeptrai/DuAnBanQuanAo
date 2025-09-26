const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
