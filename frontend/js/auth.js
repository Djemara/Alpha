// ============================================
// AUTH.JS - Connexion, inscription et
// réinitialisation du mot de passe (signin.html)
// ============================================

const API_URL = 'https://alpha-production-63bd.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');
  const authAlert = document.getElementById('authAlert');

  function afficherAlerte(message, type = 'success') {
    authAlert.textContent = message;
    authAlert.className = `alert alert-${type}`;
    authAlert.classList.remove('d-none');
    authAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => authAlert.classList.add('d-none'), 5000);
  }

  // -------- CONNEXION --------
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!loginForm.checkValidity()) {
      loginForm.classList.add('was-validated');
      return;
    }

    const credentials = {
      email: document.getElementById('loginEmail').value.trim(),
      mot_de_passe: document.getElementById('loginPassword').value
    };

    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
      .then(res => {
        if (!res.ok) throw new Error('Identifiants invalides.');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('alphait_token', data.token);
        localStorage.setItem('alphait_role', data.role);
        afficherAlerte('Connexion réussie. Redirection...', 'success');

        const destination = data.role === 'admin' ? 'admin.html' : 'index.html';
        setTimeout(() => window.location.href = destination, 1200);
      })
      .catch(err => afficherAlerte(err.message, 'danger'));
  });

  // -------- INSCRIPTION --------
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const passwordConfirmField = document.getElementById('regPasswordConfirm');

    if (password !== passwordConfirm) {
      passwordConfirmField.setCustomValidity('Les mots de passe ne correspondent pas.');
    } else {
      passwordConfirmField.setCustomValidity('');
    }

    if (!registerForm.checkValidity()) {
      registerForm.classList.add('was-validated');
      return;
    }

    const newUser = {
      nom: document.getElementById('regNom').value.trim(),
      prenom: document.getElementById('regPrenom').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      mot_de_passe: password,
      role: 'client'
    };

    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
      .then(res => {
        if (!res.ok) throw new Error('Impossible de créer le compte. Réessayez.');
        return res.json();
      })
      .then(() => {
        afficherAlerte('Compte créé avec succès. Vous pouvez maintenant vous connecter.', 'success');
        registerForm.reset();
        registerForm.classList.remove('was-validated');
        document.getElementById('tab-login-btn').click();
      })
      .catch(err => afficherAlerte(err.message, 'danger'));
  });

  // -------- REINITIALISATION DU MOT DE PASSE --------
  resetForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();

    fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('resetModal'));
        modal.hide();
        afficherAlerte('Un lien de réinitialisation a été envoyé à votre courriel.', 'success');
        resetForm.reset();
      })
      .catch(() => afficherAlerte('Une erreur est survenue. Réessayez plus tard.', 'danger'));
  });
});

function deconnecterUtilisateur() {
  localStorage.removeItem('alphait_token');
  localStorage.removeItem('alphait_role');
  window.location.href = 'signin.html';
}
