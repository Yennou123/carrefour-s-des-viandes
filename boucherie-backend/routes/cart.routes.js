// routes/cart.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const cartController = require('../controllers/cart.controller');

router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, cartController.addToCart);
router.put('/update/:productId', verifyToken, cartController.updateQuantity);
router.delete('/remove/:productId', verifyToken, cartController.removeFromCart);
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;
