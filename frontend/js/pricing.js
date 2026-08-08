// ============================================
// PRICING.JS - Gestion de la sélection des services
// et calcul du montant total (page pricing.html)
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const checkboxes = document.querySelectorAll('.service-checkbox');
  const selectedList = document.getElementById('selectedList');
  const totalPriceEl = document.getElementById('totalPrice');

  function updateSummary() {
    const selected = Array.from(checkboxes).filter(cb => cb.checked);
    let total = 0;

    if (selected.length === 0) {
      selectedList.innerHTML = '<li class="text-muted small">Aucun service sélectionné</li>';
    } else {
      selectedList.innerHTML = selected.map(cb => {
        const price = parseFloat(cb.dataset.price);
        total += price;
        return `<li class="d-flex justify-content-between py-1">
                  <span>${cb.dataset.name}</span>
                  <span>${price} $</span>
                </li>`;
      }).join('');
    }

    totalPriceEl.textContent = total + ' $';

    // Sauvegarde de la sélection pour la page PAYNOW
    const selection = selected.map(cb => ({ nom: cb.dataset.name, prix: parseFloat(cb.dataset.price) }));
    localStorage.setItem('alphait_selection', JSON.stringify(selection));
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateSummary));
  
});
// -------- Recherche et filtrage des services --------
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const serviceItems = document.querySelectorAll('.service-item');

function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function filtrerServices() {
  const recherche = normaliser(searchInput.value.trim());
  const categorie = categoryFilter.value;

  serviceItems.forEach(item => {
    const nom = normaliser(item.dataset.nom);
    const cat = normaliser(item.dataset.categorie);
    const categorieChoisie = normaliser(categorie);

    const matchRecherche = nom.includes(recherche);
    const matchCategorie = categorie === 'tous' || cat === categorieChoisie;

    item.style.display = (matchRecherche && matchCategorie) ? '' : 'none';
  });
}
  searchInput.addEventListener('input', filtrerServices);
  categoryFilter.addEventListener('change', filtrerServices);
});


