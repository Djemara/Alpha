// ============================================
// NAV-GUARD.JS - Affiche le lien "Tableau de bord"
// dans la navbar UNIQUEMENT si l'utilisateur connecté
// est un administrateur.
//
// À inclure sur TOUTES les pages (via <script src="js/nav-guard.js">)
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const role = localStorage.getItem('alphait_role');
  const adminLink = document.getElementById('adminNavLink');

  if (adminLink) {
    if (role === 'admin') {
      adminLink.classList.remove('d-none');
    } else {
      adminLink.classList.add('d-none');
    }
  }
});