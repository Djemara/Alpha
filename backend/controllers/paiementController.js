// ============================================
// CONTROLLERS/PAIEMENTCONTROLLER.JS
// Crée une commande (avec ses services) puis enregistre
// le paiement associé (Stripe ou PayPal).
// ============================================

const pool = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { envoyerEmail } = require('../config/mailer');

// -------- Crée un PaymentIntent Stripe (appelé avant le paiement) --------
// Le front-end utilise le client_secret retourné pour confirmer le paiement
// directement avec Stripe, sans jamais faire transiter le numéro de carte
// par notre serveur.
async function creerIntentPaiement(req, res) {
  const { montant } = req.body;

  if (!montant || montant <= 0) {
    return res.status(400).json({ message: 'Montant invalide.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montant * 100), // Stripe attend le montant en centimes
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du paiement.' });
  }
}

async function creerPaiement(req, res) {
  const { services, montant_total, mode_paiement, payment_intent_id } = req.body;
  const id_utilisateur = req.utilisateur.id_utilisateur;

  if (!services || services.length === 0) {
    return res.status(400).json({ message: 'Aucun service sélectionné.' });
  }

  // -------- Vérification réelle auprès de Stripe --------
  // On ne fait jamais confiance aux données envoyées par le front-end seul :
  // on revérifie directement auprès de Stripe que le paiement a réussi.
  if (mode_paiement === 'stripe') {
    if (!payment_intent_id) {
      return res.status(400).json({ message: 'Identifiant de paiement manquant.' });
    }
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(402).json({ message: 'Le paiement n\'a pas été confirmé par Stripe.' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Impossible de vérifier le paiement.' });
    }
  }

  const connexion = await pool.getConnection();

  try {
    await connexion.beginTransaction();

    // 1. Récupérer l'id_client correspondant à l'utilisateur connecté
    const [clients] = await connexion.query(
      'SELECT id_client FROM Client WHERE id_utilisateur = ?',
      [id_utilisateur]
    );

    if (clients.length === 0) {
      throw new Error('Client introuvable.');
    }
    const id_client = clients[0].id_client;

    // 2. Créer la commande
    const [commandeResult] = await connexion.query(
      `INSERT INTO Commande (id_client, montant_total, statut)
       VALUES (?, ?, 'payee')`,
      [id_client, montant_total]
    );
    const id_commande = commandeResult.insertId;

    // 3. Ajouter chaque service dans Detail_Commande
    for (const service of services) {
      await connexion.query(
        `INSERT INTO Detail_Commande (id_commande, id_service, quantite, prix)
         VALUES (?, (SELECT id_service FROM Service WHERE nom_service = ? LIMIT 1), 1, ?)`,
        [id_commande, service.nom, service.prix]
      );
    }

    // 4. Enregistrer le paiement
    const transactionId = mode_paiement === 'stripe' ? payment_intent_id : ('TXN-' + Date.now());

    await connexion.query(
      `INSERT INTO Paiement (id_commande, montant, mode_paiement, transaction_id, statut)
       VALUES (?, ?, ?, ?, 'reussi')`,
      [id_commande, montant_total, mode_paiement, transactionId]
    );

    await connexion.commit();

    // Envoi d'un e-mail de confirmation (n'interrompt jamais la réponse en cas d'échec)
    try {
      const [userRows] = await pool.query(
        `SELECT u.email, u.nom FROM Utilisateur u
         JOIN Client c ON u.id_utilisateur = c.id_utilisateur
         WHERE c.id_client = ?`,
        [id_client]
      );
      if (userRows.length > 0) {
        const listeServices = services.map(s => `<li>${s.nom} — ${s.prix} $</li>`).join('');
        await envoyerEmail({
          to: userRows[0].email,
          subject: 'Confirmation de paiement — AlphaIT',
          html: `
            <p>Bonjour ${userRows[0].nom},</p>
            <p>Votre paiement a été confirmé avec succès.</p>
            <ul>${listeServices}</ul>
            <p><b>Total payé :</b> ${montant_total} $</p>
            <p><b>Numéro de transaction :</b> ${transactionId}</p>
            <p>Merci pour votre confiance.</p>
          `
        });
      }
    } catch (emailErr) {
      console.error('Erreur envoi e-mail de confirmation :', emailErr.message);
    }

    res.status(201).json({
      message: 'Paiement effectué avec succès.',
      transaction_id: transactionId
    });
  } catch (err) {
    await connexion.rollback();
    console.error(err);
    res.status(500).json({ message: 'Le paiement a échoué. Veuillez réessayer.' });
  } finally {
    connexion.release();
  }
}

// Pour l'administrateur : voir tous les paiements
async function listerPaiements(req, res) {
  try {
    const [paiements] = await pool.query(`
      SELECT p.*, c.id_client, u.nom, u.prenom
      FROM Paiement p
      JOIN Commande c ON p.id_commande = c.id_commande
      JOIN Client cl ON c.id_client = cl.id_client
      JOIN Utilisateur u ON cl.id_utilisateur = u.id_utilisateur
      ORDER BY p.date_paiement DESC
    `);
    res.json(paiements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
// Statistiques pour les graphiques du dashboard admin
async function statistiquesPaiements(req, res) {
  try {
    const [parMode] = await pool.query(`
      SELECT mode_paiement, COUNT(*) as nombre, SUM(montant) as total
      FROM Paiement WHERE statut = 'reussi'
      GROUP BY mode_paiement
    `);

    const [parService] = await pool.query(`
      SELECT s.nom_service, SUM(dc.quantite) as quantite_vendue
      FROM Detail_Commande dc
      JOIN Service s ON dc.id_service = s.id_service
      GROUP BY s.nom_service
      ORDER BY quantite_vendue DESC
    `);

    res.json({ parMode, parService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

module.exports = { creerPaiement, listerPaiements, creerIntentPaiement, statistiquesPaiements };