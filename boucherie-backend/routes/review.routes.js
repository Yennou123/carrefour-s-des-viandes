// routes/review.routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middlewares/authJwt');

// ✅ Route publique : les 3 derniers avis approuvés
router.get('/approved/latest', reviewController.getLatestApprovedReviews);

// Route publique: GET /api/reviews/product/:productId
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Route protégée: POST /api/reviews (Soumission d'avis)
router.post('/', verifyToken, reviewController.createReview);

module.exports = router;