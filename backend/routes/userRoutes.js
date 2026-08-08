// ============================================
// ROUTES/USERROUTES.JS
// ============================================

const express = require('express');
const router = express.Router();
const { listerClients, modifierStatut, supprimerUtilisateur, creerAdmin, listerAdmins } = require('../controllers/userController');
const { verifierToken, verifierAdmin } = require('../middleware/authMiddleware');

// Toutes ces routes sont réservées à l'administrateur
router.get('/clients', verifierToken, verifierAdmin, listerClients);
router.put('/:id/statut', verifierToken, verifierAdmin, modifierStatut);
router.delete('/:id', verifierToken, verifierAdmin, supprimerUtilisateur);

// Gestion des administrateurs (réservé à un administrateur déjà connecté)
router.get('/admins', verifierToken, verifierAdmin, listerAdmins);
router.post('/admins', verifierToken, verifierAdmin, creerAdmin);

module.exports = router;