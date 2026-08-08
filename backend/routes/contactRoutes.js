const express = require('express');
const router = express.Router();
const { creerMessage, listerMessages } = require('../controllers/contactController');
const { verifierToken, verifierAdmin } = require('../middleware/authMiddleware');

router.post('/', creerMessage);
router.get('/', verifierToken, verifierAdmin, listerMessages);

module.exports = router;