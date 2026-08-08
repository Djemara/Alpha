const pool = require('../config/db');

async function listerServices(req, res) {
  try {
    const [services] = await pool.query(
      "SELECT * FROM Service WHERE statut = 'actif' ORDER BY id_service"
    );
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function creerService(req, res) {
  const { nom_service, description, prix, categorie } = req.body;

  if (!nom_service || !prix) {
    return res.status(400).json({ message: 'Le nom et le prix du service sont requis.' });
  }

  try {
    await pool.query(
      `INSERT INTO Service (nom_service, description, prix, categorie)
       VALUES (?, ?, ?, ?)`,
      [nom_service, description, prix, categorie]
    );
    res.status(201).json({ message: 'Service créé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function modifierService(req, res) {
  const { id } = req.params;
  const { nom_service, description, prix, categorie, statut } = req.body;

  try {
    await pool.query(
      `UPDATE Service
       SET nom_service = ?, description = ?, prix = ?, categorie = ?, statut = ?
       WHERE id_service = ?`,
      [nom_service, description, prix, categorie, statut, id]
    );
    res.json({ message: 'Service mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

async function supprimerService(req, res) {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM Service WHERE id_service = ?', [id]);
    res.json({ message: 'Service supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { listerServices, creerService, modifierService, supprimerService };