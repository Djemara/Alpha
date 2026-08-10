// ============================================
// AUTH.JS - Connexion, inscription et
// réinitialisation du mot de passe (signin.html)
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');
  const authAlert = document.getElementById('authAlert');

  // -------- Affiche un message dans l'encadré d'alerte --------
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

    // Route Express à créer : POST /api/auth/login
    // Retournera un token (JWT) + le rôle de l'utilisateur (admin ou client)
    fetch('https://railway.app', {
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

  // Redirection selon le rôle : admin va sur le tableau de bord, client sur l'accueil
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

    // Validation personnalisée : les mots de passe doivent correspondre
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
      role: 'client' // Par défaut, tout nouveau compte est un client
    };

    // Route Express à créer : POST /api/auth/register
    fetch('https://railway.app', {
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

    // Route Express à créer : POST /api/auth/reset-password
    fetch('https://railway.app', {
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

// -------- DECONNEXION --------
// Fonction réutilisable depuis n'importe quelle page (ex: bouton "Déconnexion")
function deconnecterUtilisateur() {
  localStorage.removeItem('alphait_token');
  localStorage.removeItem('alphait_role');
  window.location.href = 'signin.html';
}
