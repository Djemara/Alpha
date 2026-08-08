const express = require('express');
const router = express.Router();
const { creerTemoignage, listerTemoignages } = require('../controllers/temoignageController');

router.get('/', listerTemoignages);
router.post('/', creerTemoignage);

module.exports = router;