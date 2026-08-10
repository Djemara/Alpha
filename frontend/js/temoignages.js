// ============================================
// TEMOIGNAGES.JS - Charge les avis dynamiquement
// et gère l'envoi d'un nouvel avis (page index.html)
// ============================================

const API_URL = 'https://alpha-production-63bd.up.railway.app/api';

document.addEventListener('DOMContentLoaded', function () {
  const inner = document.getElementById('testimonialInner');
  const avisForm = document.getElementById('avisForm');
  const avisAlert = document.getElementById('avisAlert');
  const mesajConnexion = document.getElementById('mesajConnexionAvis');

  // -------- Vérification de la connexion pour le formulaire d'avis --------
  // Nou tcheke si kle alphait_role la egziste nan localStorage (sa vle di moun nan konekte)
  const userRole = localStorage.getItem('alphait_role');

  if (!userRole) {
    if (avisForm) avisForm.classList.add('d-none'); // Kache fòm nan si l pa konekte
    if (mesajConnexion) mesajConnexion.classList.remove('d-none'); // Montre alèt koneksyon an
  } else {
    if (avisForm) avisForm.classList.remove('d-none'); // Asire fòm nan parèt si l konekte
    if (mesajConnexion) mesajConnexion.classList.add('d-none'); // Kache alèt la
  }

  // -------- Charger les avis existants --------

  if (inner) {
    fetch(`${API_URL}/temoignages`)
      .then(res => res.json())
      .then(temoignages => {
        if (temoignages.length === 0) {
          inner.innerHTML = `
            <div class="carousel-item active">
              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <div class="testimonial-card text-center">
                    <p class="text-muted">Aucun avis pour le moment. Soyez le premier à en laisser un !</p>
                  </div>
                </div>
              </div>
            </div>`;
          return;
        }

        inner.innerHTML = temoignages.map((t, index) => {
          const nomAffiche = t.nom_visiteur || `${t.prenom || ''} ${t.nom || ''}`.trim() || 'Client AlphaIT';
          return `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <div class="row justify-content-center">
                <div class="col-lg-8">
                  <div class="testimonial-card text-center">
                    <div class="quote-mark">"</div>
                    <div class="mb-2">${'★'.repeat(t.note)}${'☆'.repeat(5 - t.note)}</div>
                    <p class="fs-5 mb-3">${t.commentaire}</p>
                    <strong>${nomAffiche}</strong>
                    <div class="text-muted small">${t.entreprise || 'Client AlphaIT'}</div>
                  </div>
                </div>
              </div>
            </div>`;
        }).join('');

        // Réinitialise le carousel Bootstrap après avoir remplacé son contenu
        const carouselEl = document.getElementById('testimonialCarousel');
        if (carouselEl) {
          const ancienneInstance = bootstrap.Carousel.getInstance(carouselEl);
          if (ancienneInstance) ancienneInstance.dispose();
          new bootstrap.Carousel(carouselEl, { ride: 'carousel', interval: 5000 });
        }
      })
      .catch(() => {
        inner.innerHTML = `
          <div class="carousel-item active">
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="testimonial-card text-center">
                  <p class="text-muted">Impossible de charger les avis pour le moment.</p>
                </div>
              </div>
            </div>
          </div>`;
      });
  }

  // -------- Soumettre un nouvel avis --------
  if (avisForm) {
    avisForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const data = {
        nom: document.getElementById('avisNom').value.trim(),
        prenom: document.getElementById('avisPrenom').value.trim(),
        note: parseInt(document.getElementById('avisNote').value),
        commentaire: document.getElementById('avisCommentaire').value.trim()
      };

      fetch(`${API_URL}/temoignages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json().then(d => ({ ok: res.ok, d })))
        .then(({ ok, d }) => {
          if (!ok) throw new Error(d.message);
          avisAlert.textContent = 'Merci pour votre avis !';
          avisAlert.className = 'alert alert-success';
          avisAlert.classList.remove('d-none');
          avisForm.reset();
          setTimeout(() => avisAlert.classList.add('d-none'), 4000);
        })
        .catch(err => {
          avisAlert.textContent = err.message;
          avisAlert.className = 'alert alert-danger';
          avisAlert.classList.remove('d-none');
        });
    });
  }
});
