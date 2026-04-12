//newsletter.routes.js
const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletter.controller');


router.post('/', newsletterController.addnewsletter);

// ...
router.delete('/unsubscribe', newsletterController.unsubscribe);

module.exports = router;