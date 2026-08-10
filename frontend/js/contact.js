// ============================================
// CONTACT.JS - Validation et soumission du
// formulaire de contact (page contact.html)
// ============================================

const API_URL = 'https://alpha-production-63bd.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const successAlert = document.getElementById('successAlert');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const contactData = {
      nom: document.getElementById('nom').value.trim(),
      prenom: document.getElementById('prenom').value.trim(),
      email: document.getElementById('email').value.trim(),
      telephone: document.getElementById('telephone').value.trim(),
      sujet: document.getElementById('sujet').value.trim(),
      message: document.getElementById('message').value.trim(),
      date_message: new Date().toISOString()
    };

    envoyerMessage(contactData);
  });

  function envoyerMessage(data) {
    fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi du message.');
        }
        return response.json();
      })
      .then(() => afficherConfirmation())
      .catch(() => {
        afficherConfirmation();
      });
  }

  function afficherConfirmation() {
    successAlert.classList.remove('d-none');
    form.reset();
    form.classList.remove('was-validated');
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => successAlert.classList.add('d-none'), 5000);
  }
});
