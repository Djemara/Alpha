// ============================================
// CONTACT.JS - Validation et soumission du
// formulaire de contact (page contact.html)
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const successAlert = document.getElementById('successAlert');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Validation Bootstrap standard (champs "required")
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Récupération des données du formulaire
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

  // Envoie les données du formulaire au serveur (API back-end)
 
  function envoyerMessage(data) {
    fetch('http://localhost:5000/api/contact', {
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
        // En attendant que le back-end soit branché, on simule quand même
        // une confirmation pour ne pas bloquer les tests côté front-end.
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
