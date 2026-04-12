// routes/address.routes.js
const express = require('express');
const router = express.Router();
const { saveAddress, getUserAddress, reverseGeocode } = require('../controllers/address.controller');
const { verifyToken } = require('../middlewares/authJwt');

// Routes existantes
router.put('/', verifyToken, saveAddress);
router.get('/', verifyToken, getUserAddress);

// 🔹 Nouvelle route pour le reverse geocoding
router.get('/reverse-geocode', verifyToken, reverseGeocode);

module.exports = router;
