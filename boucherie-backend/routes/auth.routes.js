// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limite à 5 tentatives
  message: "Trop de tentatives de connexion. Réessayez plus tard."
});

router.post('/register', authController.register); // POST /api/auth/register
router.post('/login', loginLimiter, authController.login);       // POST /api/auth/login
router.post('/google', authController.googleLogin);       // POST /api/auth/google

module.exports = router;