// ============================================
// CONTROLLERS/AUTHCONTROLLER.JS
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { envoyerEmail } = require('../config/mailer');
require('dotenv').config();

async function register(req, res) {
  const { nom, prenom, email, mot_de_passe } = req.body;

  if (!nom || !prenom || !email || !mot_de_passe) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const [existants] = await pool.query(
      'SELECT id_utilisateur FROM Utilisateur WHERE email = ?',
      [email]
    );
    if (existants.length > 0) {
      return res.status(409).json({ message: 'Un compte existe déjà avec ce courriel.' });
    }

    const motDePasseHache = await bcrypt.hash(mot_de_passe, 10);

    const [resultat] = await pool.query(
      `INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, role)
       VALUES (?, ?, ?, ?, 'client')`,
      [nom, prenom, email, motDePasseHache]
    );

    await pool.query(
      'INSERT INTO Client (id_utilisateur) VALUES (?)',
      [resultat.insertId]
    );

    res.status(201).json({ message: 'Compte créé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
  }
}

async function login(req, res) {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Courriel et mot de passe requis.' });
  }

  try {
    const [utilisateurs] = await pool.query(
      'SELECT * FROM Utilisateur WHERE email = ?',
      [email]
    );

    if (utilisateurs.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const utilisateur = utilisateurs[0];
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id_utilisateur: utilisateur.id_utilisateur, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      role: utilisateur.role,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
}

// -------- REINITIALISATION DU MOT DE PASSE (envoi d'un vrai courriel) --------
async function resetPassword(req, res) {
  const { email } = req.body;

  try {
    const [utilisateurs] = await pool.query(
      'SELECT id_utilisateur, nom FROM Utilisateur WHERE email = ?',
      [email]
    );

    
    // (sécurité : ne jamais révéler quels comptes existent)
    if (utilisateurs.length === 0) {
      return res.json({ message: 'Si ce courriel existe, un lien a été envoyé.' });
    }

    const utilisateur = utilisateurs[0];

    // Token temporaire, valide 15 minutes uniquement
    const resetToken = jwt.sign(
      { id_utilisateur: utilisateur.id_utilisateur, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:5500/entreprise-informatique/frontend/reset-password.html?token=${resetToken}`;

    await envoyerEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe — AlphaIT',
      html: `
        <p>Bonjour ${utilisateur.nom},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe AlphaIT.</p>
        <p><a href="${resetLink}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
        <p>Ce lien expire dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce courriel.</p>
      `
    });

    res.json({ message: 'Si ce courriel existe, un lien a été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// -------- CONFIRMATION : enregistre le nouveau mot de passe --------
async function resetPasswordConfirm(req, res) {
  const { token, nouveau_mot_de_passe } = req.body;

  if (!token || !nouveau_mot_de_passe) {
    return res.status(400).json({ message: 'Requête invalide.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ message: 'Token invalide.' });
    }

    const motDePasseHache = await bcrypt.hash(nouveau_mot_de_passe, 10);

    await pool.query(
      'UPDATE Utilisateur SET mot_de_passe = ? WHERE id_utilisateur = ?',
      [motDePasseHache, decoded.id_utilisateur]
    );

    res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (err) {
    res.status(400).json({ message: 'Ce lien a expiré ou est invalide. Veuillez recommencer.' });
  }
}

module.exports = { register, login, resetPassword, resetPasswordConfirm };