// routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Routes publiques (lecture du catalogue)
router.get('/promo-count', productController.getPromoProductsCount);
router.get('/', productController.getAllProducts); // GET /api/products
router.get('/:id', productController.getProductById); // GET /api/products/:id

// Les routes ADMIN (POST, PUT, DELETE) seront ajoutées plus tard.

module.exports = router;