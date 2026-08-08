const express = require('express');
const router = express.Router();
const {
  listerServices,
  creerService,
  modifierService,
  supprimerService
} = require('../controllers/serviceController');
const { verifierToken, verifierAdmin } = require('../middleware/authMiddleware');

router.get('/', listerServices);
router.post('/', verifierToken, verifierAdmin, creerService);
router.put('/:id', verifierToken, verifierAdmin, modifierService);
router.delete('/:id', verifierToken, verifierAdmin, supprimerService);

module.exports = router;