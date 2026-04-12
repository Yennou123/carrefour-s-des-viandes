// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/authJwt');
const isAdmin = require('../middlewares/adminAuth');

// ✅ Statistique publique
router.get('/count', orderController.getOrdersCount);

// 🧍 Toutes les routes ci-dessous nécessitent un utilisateur connecté
router.use(verifyToken);

/**
 * 🕓 Récupérer l'historique simplifié (tableau de bord)
 * GET /api/orders/me
 * ⚠️ DOIT être AVANT /:id sinon Express match "me" comme ID
 */
router.get('/me', orderController.getOrdersForCurrentUser);

/**
 * 🧾 Créer une commande manuelle (paiement à la réception)
 * POST /api/orders
 */
router.post('/', orderController.createOrder);

/**
 * 📋 Récupérer les commandes complètes avec leurs items
 * GET /api/orders
 */
router.get('/', orderController.getUserOrders);

/**
 * 📦 Récupérer le détail d'une commande spécifique
 * GET /api/orders/:id
 * ⚠️ DOIT être APRÈS /me pour éviter la collision de route
 */
router.get('/:id', orderController.getOrderById);

/**
 * 📲 Tracking clic WhatsApp
 * POST /api/orders/:id/whatsapp-click
 */
router.post('/:id/whatsapp-click', orderController.trackWhatsAppClick);

module.exports = router;
