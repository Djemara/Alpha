const pool = require('../config/db');

async function creerMessage(req, res) {
  const { nom, prenom, email, telephone, sujet, message } = req.body;

  if (!nom || !prenom || !email || !sujet || !message) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
  }

  try {
    await pool.query(
      `INSERT INTO Contact (nom, prenom, email, telephone, sujet, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, sujet, message]
    );

    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message.' });
  }
}

async function listerMessages(req, res) {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM Contact ORDER BY date_message DESC'
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { creerMessage, listerMessages };