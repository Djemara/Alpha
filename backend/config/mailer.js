// ============================================
// CONFIG/MAILER.JS - Configuration de l'envoi d'e-mails
// via Gmail (Nodemailer)
// ============================================

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function envoyerEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: `"AlphaIT" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error('Erreur envoi e-mail :', err.message);
    return false;
  }
}

module.exports = { envoyerEmail };