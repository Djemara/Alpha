// ============================================
// CONTROLLERS/TEMOIGNAGECONTROLLER.JS
// Gère les avis/témoignages des clients
// ============================================

const pool = require('../config/db');

// Un client connecté laisse un avis
async function creerTemoignage(req, res) {
  const { commentaire, note, nom, prenom } = req.body;

  if (!commentaire || !note || !nom) {
    return res.status(400).json({ message: 'Le nom et le commentaire sont requis.' });
  }
  if (note < 1 || note > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5.' });
  }

  try {
    await pool.query(
      'INSERT INTO Temoignage (nom_visiteur, commentaire, note) VALUES (?, ?, ?)',
      [`${prenom || ''} ${nom}`.trim(), commentaire, note]
    );

    res.status(201).json({ message: 'Merci pour votre avis !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// Liste publique des avis (affichés sur la page d'accueil)
async function listerTemoignages(req, res) {
  try {
    const [temoignages] = await pool.query(`
      SELECT t.commentaire, t.note, t.date, t.nom_visiteur,
             u.nom, u.prenom, c.entreprise
      FROM Temoignage t
      LEFT JOIN Client c ON t.id_client = c.id_client
      LEFT JOIN Utilisateur u ON c.id_utilisateur = u.id_utilisateur
      ORDER BY t.date DESC
      LIMIT 10
    `);
    res.json(temoignages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { creerTemoignage, listerTemoignages };