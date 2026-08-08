// ============================================
// ROUTES/PAIEMENTROUTES.JS
// ============================================

const express = require('express');
const router = express.Router();
const { creerPaiement, listerPaiements, creerIntentPaiement, statistiquesPaiements } = require('../controllers/paiementController');
const { verifierToken, verifierAdmin } = require('../middleware/authMiddleware');

// Créer un PaymentIntent Stripe (avant de finaliser le paiement)
router.post('/create-intent', verifierToken, creerIntentPaiement);

// Le client doit être connecté pour payer (on a besoin de son id_client)
router.post('/', verifierToken, creerPaiement);

// Réservé à l'administrateur
router.get('/', verifierToken, verifierAdmin, listerPaiements);
router.get('/statistiques', verifierToken, verifierAdmin, statistiquesPaiements);
module.exports = router;