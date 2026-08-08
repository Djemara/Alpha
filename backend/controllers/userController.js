const pool = require('../config/db');

async function listerClients(req, res) {
  try {
    const [clients] = await pool.query(`
      SELECT c.id_client, c.entreprise, c.ville, c.pays,
             u.id_utilisateur, u.nom, u.prenom, u.email, u.telephone,
             u.date_creation, u.statut
      FROM Client c
      JOIN Utilisateur u ON c.id_utilisateur = u.id_utilisateur
      ORDER BY u.date_creation DESC
    `);
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function modifierStatut(req, res) {
  const { id } = req.params;
  const { statut } = req.body;

  if (!['actif', 'inactif'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide.' });
  }

  try {
    await pool.query(
      'UPDATE Utilisateur SET statut = ? WHERE id_utilisateur = ?',
      [statut, id]
    );
    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function supprimerUtilisateur(req, res) {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM Utilisateur WHERE id_utilisateur = ?', [id]);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
  async function creerAdmin(req, res) {
  const bcrypt = require('bcryptjs');
  const { nom, prenom, email, mot_de_passe, fonction } = req.body;

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
       VALUES (?, ?, ?, ?, 'admin')`,
      [nom, prenom, email, motDePasseHache]
    );

    await pool.query(
      'INSERT INTO Administrateur (id_utilisateur, fonction) VALUES (?, ?)',
      [resultat.insertId, fonction || null]
    );

    res.status(201).json({ message: 'Administrateur créé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'administrateur.' });
  }
}

async function listerAdmins(req, res) {
  try {
    const [admins] = await pool.query(`
      SELECT a.id_admin, a.fonction, u.id_utilisateur, u.nom, u.prenom, u.email, u.date_creation
      FROM Administrateur a
      JOIN Utilisateur u ON a.id_utilisateur = u.id_utilisateur
      ORDER BY u.date_creation DESC
    `);
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { listerClients, modifierStatut, supprimerUtilisateur, creerAdmin, listerAdmins };