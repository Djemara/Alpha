// ============================================
// DARK-MODE.JS - Bascule entre thème clair et sombre
// À inclure sur TOUTES les pages
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const htmlEl = document.documentElement;

  // Applique le thème sauvegardé (ou clair par défaut)
  const themeActuel = localStorage.getItem('alphait_theme') || 'light';
  if (themeActuel === 'dark') {
    htmlEl.setAttribute('data-theme', 'dark');
    if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-sun"></i>';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
  const estSombre = htmlEl.getAttribute('data-theme') === 'dark';

  if (estSombre) {
    htmlEl.removeAttribute('data-theme');
    toggleBtn.innerHTML = '<i class="bi bi-moon-stars"></i>';
    localStorage.setItem('alphait_theme', 'light');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { sombre: false } }));
  } else {
    htmlEl.setAttribute('data-theme', 'dark');
    toggleBtn.innerHTML = '<i class="bi bi-sun"></i>';
    localStorage.setItem('alphait_theme', 'dark');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { sombre: true } }));
  }
});
  }
});