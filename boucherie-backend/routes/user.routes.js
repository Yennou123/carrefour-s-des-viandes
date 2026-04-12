// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/authJwt'); // Import du middleware
const isAdmin = require('../middlewares/adminAuth');

// ✅ Statistique publique
router.get('/count', userController.getUsersCount);

// Routes nécessitant une connexion (verifyToken)
router.get('/profile', verifyToken, userController.getProfile);     
// ✏️ Modifier informations profil
router.put('/profile', verifyToken, userController.updateProfileInfo);
// 🔐 Changer mot de passe
router.put('/change-password', verifyToken, userController.changePassword);

module.exports = router;