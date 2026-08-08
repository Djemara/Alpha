// ============================================
// RESET-PASSWORD.JS - Confirmation de la
// réinitialisation du mot de passe
// ============================================

const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('resetPasswordForm');
  const alertBox = document.getElementById('resetAlert');

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  function afficherAlerte(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove('d-none');
  }

  if (!token) {
    afficherAlerte('Lien invalide. Veuillez refaire une demande de réinitialisation.', 'danger');
    form.classList.add('d-none');
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      afficherAlerte('Les mots de passe ne correspondent pas.', 'danger');
      return;
    }

    fetch(`${API_URL}/auth/reset-password-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nouveau_mot_de_passe: newPassword })
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message);
        afficherAlerte('Mot de passe mis à jour ! Redirection vers la connexion...', 'success');
        setTimeout(() => window.location.href = 'signin.html', 2000);
      })
      .catch(err => afficherAlerte(err.message, 'danger'));
  });
});