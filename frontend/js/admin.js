// ============================================
// ADMIN.JS - Logique du tableau de bord administrateur
// ============================================

const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('alphait_token');
  const role = localStorage.getItem('alphait_role');

  // -------- Protection de la page : admin uniquement --------
  if (!token || role !== 'admin') {
    alert('Accès réservé aux administrateurs. Veuillez vous connecter.');
    window.location.href = 'signin.html';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };

  const adminAlert = document.getElementById('adminAlert');

  function afficherAlerte(message, type = 'success') {
    adminAlert.textContent = message;
    adminAlert.className = `alert alert-${type}`;
    adminAlert.classList.remove('d-none');
    setTimeout(() => adminAlert.classList.add('d-none'), 4000);
  }

  // -------- Navigation entre sections --------
  const navButtons = document.querySelectorAll('#adminTabs [data-target]');
  const sections = document.querySelectorAll('.admin-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.target;
      sections.forEach(s => s.classList.add('d-none'));
      document.getElementById('section-' + target).classList.remove('d-none');

      chargerDonnees(target);
    });
  });

  // -------- Déconnexion --------
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('alphait_token');
    localStorage.removeItem('alphait_role');
    window.location.href = 'signin.html';
  });

  // -------- Chargement des données selon la section active --------
   function chargerDonnees(section) {
    if (section === 'clients') chargerClients();
    if (section === 'services') chargerServices();
    if (section === 'paiements') chargerPaiements();
    if (section === 'messages') chargerMessages();
    if (section === 'temoignages') chargerTemoignages();
    if (section === 'admins') chargerAdmins();
    if (section === 'stats') chargerStatistiques();
  }

  // ================= CLIENTS =================
  function chargerClients() {
    const tbody = document.getElementById('clientsTableBody');
    fetch(`${API_URL}/users/clients`, { headers })
      .then(res => res.json())
      .then(clients => {
        if (clients.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Aucun client.</td></tr>';
          return;
        }
        tbody.innerHTML = clients.map(c => `
          <tr>
            <td>${c.prenom} ${c.nom}</td>
            <td>${c.email}</td>
            <td>${c.telephone || '-'}</td>
            <td>${c.entreprise || '-'}</td>
            <td>
              <span class="badge ${c.statut === 'actif' ? 'bg-success' : 'bg-secondary'}">${c.statut}</span>
            </td>
            <td class="table-actions">
              <button class="btn btn-outline-secondary btn-sm toggle-statut" data-id="${c.id_utilisateur}" data-statut="${c.statut}">
                ${c.statut === 'actif' ? 'Désactiver' : 'Activer'}
              </button>
              <button class="btn btn-outline-danger btn-sm delete-user" data-id="${c.id_utilisateur}">Supprimer</button>
            </td>
          </tr>
        `).join('');

        tbody.querySelectorAll('.toggle-statut').forEach(btn => {
          btn.addEventListener('click', () => {
            const nouveauStatut = btn.dataset.statut === 'actif' ? 'inactif' : 'actif';
            fetch(`${API_URL}/users/${btn.dataset.id}/statut`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ statut: nouveauStatut })
            })
              .then(res => res.json())
              .then(() => { afficherAlerte('Statut mis à jour.'); chargerClients(); })
              .catch(() => afficherAlerte('Erreur lors de la mise à jour.', 'danger'));
          });
        });

        tbody.querySelectorAll('.delete-user').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('Supprimer ce client définitivement ?')) return;
            fetch(`${API_URL}/users/${btn.dataset.id}`, { method: 'DELETE', headers })
              .then(res => res.json())
              .then(() => { afficherAlerte('Client supprimé.'); chargerClients(); })
              .catch(() => afficherAlerte('Erreur lors de la suppression.', 'danger'));
          });
        });
      })
      .catch(() => { tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Erreur de chargement.</td></tr>'; });
  }

  // ================= SERVICES =================
  function chargerServices() {
    const tbody = document.getElementById('servicesTableBody');
    fetch(`${API_URL}/services`, { headers })
      .then(res => res.json())
      .then(services => {
        tbody.innerHTML = services.map(s => `
          <tr>
            <td>${s.nom_service}</td>
            <td>${s.categorie || '-'}</td>
            <td>${s.prix} $</td>
            <td><span class="badge ${s.statut === 'actif' ? 'bg-success' : 'bg-secondary'}">${s.statut}</span></td>
            <td class="table-actions">
              <button class="btn btn-outline-secondary btn-sm edit-service"
                data-id="${s.id_service}" data-nom="${s.nom_service}"
                data-description="${s.description || ''}" data-prix="${s.prix}"
                data-categorie="${s.categorie || ''}">Modifier</button>
              <button class="btn btn-outline-danger btn-sm delete-service" data-id="${s.id_service}">Supprimer</button>
            </td>
          </tr>
        `).join('');

        tbody.querySelectorAll('.edit-service').forEach(btn => {
          btn.addEventListener('click', () => {
            document.getElementById('serviceModalTitle').textContent = 'Modifier le service';
            document.getElementById('serviceId').value = btn.dataset.id;
            document.getElementById('serviceNom').value = btn.dataset.nom;
            document.getElementById('serviceDescription').value = btn.dataset.description;
            document.getElementById('servicePrix').value = btn.dataset.prix;
            document.getElementById('serviceCategorie').value = btn.dataset.categorie;
            new bootstrap.Modal(document.getElementById('serviceModal')).show();
          });
        });

        tbody.querySelectorAll('.delete-service').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('Supprimer ce service ?')) return;
            fetch(`${API_URL}/services/${btn.dataset.id}`, { method: 'DELETE', headers })
              .then(res => res.json())
              .then(() => { afficherAlerte('Service supprimé.'); chargerServices(); })
              .catch(() => afficherAlerte('Erreur lors de la suppression.', 'danger'));
          });
        });
      })
      .catch(() => { tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Erreur de chargement.</td></tr>'; });
  }

  document.getElementById('newServiceBtn').addEventListener('click', () => {
    document.getElementById('serviceModalTitle').textContent = 'Nouveau service';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
  });

  document.getElementById('serviceForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const id = document.getElementById('serviceId').value;
    const data = {
      nom_service: document.getElementById('serviceNom').value,
      description: document.getElementById('serviceDescription').value,
      prix: parseFloat(document.getElementById('servicePrix').value),
      categorie: document.getElementById('serviceCategorie').value,
      statut: 'actif'
    };

    const url = id ? `${API_URL}/services/${id}` : `${API_URL}/services`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, { method, headers, body: JSON.stringify(data) })
      .then(res => res.json())
      .then(() => {
        afficherAlerte('Service enregistré avec succès.');
        bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
        chargerServices();
      })
      .catch(() => afficherAlerte('Erreur lors de l\'enregistrement.', 'danger'));
  });

  // ================= PAIEMENTS =================
  function chargerPaiements() {
    const tbody = document.getElementById('paiementsTableBody');
    fetch(`${API_URL}/paiement`, { headers })
      .then(res => res.json())
      .then(paiements => {
        if (paiements.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Aucun paiement.</td></tr>';
          return;
        }
        tbody.innerHTML = paiements.map(p => `
          <tr>
            <td>${p.prenom} ${p.nom}</td>
            <td>${p.montant} $</td>
            <td>${p.mode_paiement}</td>
            <td>${p.transaction_id}</td>
            <td>${new Date(p.date_paiement).toLocaleDateString('fr-FR')}</td>
            <td><span class="badge bg-success">${p.statut}</span></td>
          </tr>
        `).join('');
      })
      .catch(() => { tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Erreur de chargement.</td></tr>'; });
  }

  // ================= MESSAGES =================
  function chargerMessages() {
    const tbody = document.getElementById('messagesTableBody');
    fetch(`${API_URL}/contact`, { headers })
      .then(res => res.json())
      .then(messages => {
        if (messages.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Aucun message.</td></tr>';
          return;
        }
        tbody.innerHTML = messages.map(m => `
          <tr>
            <td>${m.prenom} ${m.nom}</td>
            <td>${m.email}</td>
            <td>${m.sujet}</td>
            <td>${m.message}</td>
            <td>${new Date(m.date_message).toLocaleDateString('fr-FR')}</td>
          </tr>
        `).join('');
      })
      .catch(() => { tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Erreur de chargement.</td></tr>'; });
  }
  function chargerAdmins() {
  const tbody = document.getElementById('adminsTableBody');
  fetch(`${API_URL}/users/admins`, { headers })
    .then(res => res.json())
    .then(admins => {
      if (admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Aucun administrateur.</td></tr>';
        return;
      }
      tbody.innerHTML = admins.map(a => `
        <tr>
          <td>${a.prenom} ${a.nom}</td>
          <td>${a.email}</td>
          <td>${a.fonction || '-'}</td>
          <td>${new Date(a.date_creation).toLocaleDateString('fr-FR')}</td>
        </tr>
      `).join('');
    })
    .catch(() => { tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Erreur de chargement.</td></tr>'; });
}

document.getElementById('adminForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const data = {
    nom: document.getElementById('adminNom').value.trim(),
    prenom: document.getElementById('adminPrenom').value.trim(),
    email: document.getElementById('adminEmail').value.trim(),
    mot_de_passe: document.getElementById('adminPassword').value,
    fonction: document.getElementById('adminFonction').value.trim()
  };

  fetch(`${API_URL}/users/admins`, { method: 'POST', headers, body: JSON.stringify(data) })
    .then(res => {
      if (!res.ok) return res.json().then(err => { throw new Error(err.message); });
      return res.json();
    })
    .then(() => {
      afficherAlerte('Administrateur créé avec succès.');
      bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
      document.getElementById('adminForm').reset();
      chargerAdmins();
    })
    .catch(err => afficherAlerte(err.message, 'danger'));
});
  // ================= TEMOIGNAGES =================
  function chargerTemoignages() {
    const tbody = document.getElementById('temoignagesTableBody');
    if (!tbody) return;

    // Nou voye chache temmoignages yo nan API a
    fetch(`${API_URL}/temoignages`, { headers })
      .then(res => res.json())
      .then(temoignages => {
        if (temoignages.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">Aucun témoignage reçu.</td></tr>';
          return;
        }

        tbody.innerHTML = temoignages.map(t => {
          // Si API a voye 'nom_visiteur', nou pran li. Sinon nou konbine prenom ak nom.
          const nomAffiche = t.nom_visiteur || `${t.prenom || ''} ${t.nom || ''}`.trim() || 'Client AlphaIT';
          const etoiles = '★'.repeat(t.note) + '☆'.repeat(5 - t.note);
          
          // Defini koulè badge la selon estati a (vèt pou approuve, jòn pou en_attente)
          const badgeClass = t.statut === 'approuve' ? 'bg-success' : 'bg-warning text-dark';
          const statutTexte = t.statut === 'approuve' ? 'Approuvé' : 'En attente';

          return `
            <tr>
              <td><strong>${nomAffiche}</strong></td>
              <td class="text-warning">${etoiles}</td>
              <td><span class="small">${t.commentaire}</span></td>
              <td><span class="badge ${badgeClass}">${statutTexte}</span></td>
              <td class="table-actions">
                ${t.statut !== 'approuve' ? `
                  <button class="btn btn-outline-success btn-sm approuver-avis me-1" data-id="${t.id_temoignage || t.id}">
                    Approuver
                  </button>
                ` : ''}
                <button class="btn btn-outline-danger btn-sm delete-avis" data-id="${t.id_temoignage || t.id}">
                  Supprimer
                </button>
              </td>
            </tr>
          `;
        }).join('');

        // Lojik lè admin nan klike sou bouton "Approuver"
        tbody.querySelectorAll('.approuver-avis').forEach(btn => {
          btn.addEventListener('click', () => {
            fetch(`${API_URL}/temoignages/${btn.dataset.id}/approuver`, {
              method: 'PUT',
              headers
            })
              .then(res => res.json())
              .then(() => { 
                afficherAlerte('Témoignage approuvé et publié !'); 
                chargerTemoignages(); // Recharche tablo a pou l mete l ajou
              })
              .catch(() => afficherAlerte('Erreur lors de l\'approbation.', 'danger'));
          });
        });

        // Lojik lè admin nan klike sou bouton "Supprimer"
        tbody.querySelectorAll('.delete-avis').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('Supprimer ce témoignage définitivement ?')) return;
            fetch(`${API_URL}/temoignages/${btn.dataset.id}`, { 
              method: 'DELETE', 
              headers 
            })
              .then(res => res.json())
              .then(() => { 
                afficherAlerte('Témoignage supprimé.'); 
                chargerTemoignages(); 
              })
              .catch(() => afficherAlerte('Erreur lors de la suppression.', 'danger'));
          });
        });

      })
      .catch(() => { 
        tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Erreur de chargement des témoignages.</td></tr>'; 
      });
  }


// ================= STATISTIQUES =================
let chartMode, chartServices;

function chargerStatistiques() {
  fetch(`${API_URL}/paiement/statistiques`, { headers })
    .then(res => res.json())
    .then(data => {
      // Graphique 1 : paiements par mode
      const ctxMode = document.getElementById('chartModePaiement');
      if (chartMode) chartMode.destroy();
      chartMode = new Chart(ctxMode, {
        type: 'bar',
        data: {
          labels: data.parMode.map(m => m.mode_paiement),
          datasets: [{
            label: 'Total ($)',
            data: data.parMode.map(m => m.total),
            backgroundColor: '#2DD4BF'
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });

      // Graphique 2 : services les plus vendus
      const ctxServices = document.getElementById('chartServices');
      if (chartServices) chartServices.destroy();
      chartServices = new Chart(ctxServices, {
        type: 'pie',
        data: {
          labels: data.parService.map(s => s.nom_service),
          datasets: [{
            data: data.parService.map(s => s.quantite_vendue),
            backgroundColor: ['#0F1B2D', '#2DD4BF', '#16283F']
          }]
        },
        options: { responsive: true }
      });
    })
    .catch(err => console.error('Erreur chargement statistiques :', err));
}

  // -------- Chargement initial --------
  chargerClients();
});
