// routes/support.routes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { verifyToken } = require('../middlewares/authJwt');

// Routes protégées: POST /api/support
router.post('/', verifyToken, supportController.createTicket);

// Routes protégées: GET /api/support/my-tickets
router.get('/my-tickets', verifyToken, supportController.getUserTickets);

module.exports = router;