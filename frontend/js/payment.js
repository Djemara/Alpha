// ============================================
// PAYMENT.JS - Récapitulatif de commande et
// traitement du paiement RÉEL via Stripe (page paynow.html)
// ============================================

const API_URL = 'http://localhost:5000/api';
const stripe = Stripe('pk_test_51TxeFrC3f5A25o4tBbJSULNNUDelHKmZbOh8kk2ciGZJHMlknm5OHTULyVNLPCO1NJiZPPqxiJ7qsJXlYBN8aXxT00k4lwZgsP');
const elements = stripe.elements();


// Détecte si le mode sombre est actif pour adapter les couleurs du Card Element
const estModeSombre = localStorage.getItem('alphait_theme') === 'dark';

const cardElement = elements.create('card', {
  style: {
    base: {
      color: estModeSombre ? '#E8ECF3' : '#1A1F2B',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: estModeSombre ? '#9CA6B5' : '#6B7280'
      }
    },
    invalid: {
      color: '#dc3545'
    }
  }
});
document.addEventListener('DOMContentLoaded', function () {
  cardElement.mount('#card-element');
  cardElement.mount('#card-element');

// Met à jour les couleurs du Card Element si le thème change en direct
document.addEventListener('themechange', function (event) {
  cardElement.update({
    style: {
      base: {
        color: event.detail.sombre ? '#E8ECF3' : '#1A1F2B',
        fontFamily: '"Inter", sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: event.detail.sombre ? '#9CA6B5' : '#6B7280'
        }
      },
      invalid: { color: '#dc3545' }
    }
  });
});

  cardElement.on('change', function (event) {
    const displayError = document.getElementById('card-errors');
    displayError.textContent = event.error ? event.error.message : '';
  });

  const orderList = document.getElementById('orderList');
  const orderTotal = document.getElementById('orderTotal');
  const paymentForm = document.getElementById('paymentForm');
  const paymentAlert = document.getElementById('paymentAlert');
  const payStripe = document.getElementById('payStripe');
  const payPaypal = document.getElementById('payPaypal');
  const stripeFields = document.getElementById('stripeFields');
  const paypalFields = document.getElementById('paypalFields');
  const submitPayBtn = document.getElementById('submitPayBtn');

  let selection = [];
  let total = 0;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('alphait_token')
  };

  // -------- Charge la sélection faite sur la page pricing.html --------
  function chargerSelection() {
    const data = localStorage.getItem('alphait_selection');
    selection = data ? JSON.parse(data) : [];

    if (selection.length === 0) {
      orderList.innerHTML = `<li class="text-muted small">
        Aucun service sélectionné. <a href="pricing.html">Choisir un service</a>
      </li>`;
      submitPayBtn.disabled = true;
      return;
    }

    total = selection.reduce((sum, item) => sum + item.prix, 0);

    orderList.innerHTML = selection.map(item => `
      <li class="d-flex justify-content-between py-1">
        <span>${item.nom}</span>
        <span>${item.prix} $</span>
      </li>
    `).join('');

    orderTotal.textContent = total + ' $';
  }

  chargerSelection();

  // -------- Basculer entre Stripe et PayPal --------
  function basculerModePaiement() {
    if (payStripe.checked) {
      stripeFields.classList.remove('d-none');
      paypalFields.classList.add('d-none');
    } else {
      stripeFields.classList.add('d-none');
      paypalFields.classList.remove('d-none');
    }
  }

  payStripe.addEventListener('change', basculerModePaiement);
  payPaypal.addEventListener('change', basculerModePaiement);

  // -------- Soumission du paiement --------
  paymentForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (selection.length === 0) return;

    if (payStripe.checked) {
      await payerAvecStripe();
    } else {
      afficherErreur('PayPal n\'est pas encore intégré. Veuillez choisir Stripe.');
    }
  });

  // -------- Paiement RÉEL via Stripe --------
  async function payerAvecStripe() {
    submitPayBtn.disabled = true;
    submitPayBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Traitement...';

    try {
      // 1. Demander à notre back-end de créer un PaymentIntent Stripe
      const intentRes = await fetch(`${API_URL}/paiement/create-intent`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ montant: total })
      });

      if (!intentRes.ok) throw new Error('Impossible de préparer le paiement.');
      const { client_secret } = await intentRes.json();

      // 2. Confirmer le paiement DIRECTEMENT avec Stripe (le numéro de carte
      //    ne passe jamais par notre serveur, seulement par Stripe)
      const cardName = document.getElementById('cardName').value;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardName }
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // 3. Le paiement Stripe a réussi : on enregistre la commande dans notre BD
      const commande = {
        services: selection,
        montant_total: total,
        mode_paiement: 'stripe',
        payment_intent_id: result.paymentIntent.id
      };

      const commandeRes = await fetch(`${API_URL}/paiement`, {
        method: 'POST',
        headers,
        body: JSON.stringify(commande)
      });

      if (!commandeRes.ok) throw new Error('Paiement réussi mais erreur lors de l\'enregistrement.');

      const data = await commandeRes.json();
      afficherConfirmation(data.transaction_id);

    } catch (err) {
      afficherErreur(err.message);
      submitPayBtn.disabled = false;
      submitPayBtn.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Payer maintenant';
    }
  }

 function afficherConfirmation(transactionId) {
  document.getElementById('transactionId').textContent = transactionId;
  const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
  modal.show();

  // Prépare le téléchargement du reçu PDF (avant d'effacer la sélection)
  document.getElementById('downloadReceiptBtn').onclick = function () {
    genererRecuPDF(transactionId);
  };

  localStorage.removeItem('alphait_selection');
}

// -------- Génère un reçu PDF téléchargeable --------
function genererRecuPDF(transactionId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const dateActuelle = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // En-tête
  doc.setFillColor(15, 27, 45);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('AlphaIT', 15, 18);
  doc.setFontSize(10);
  doc.text('Reçu de paiement', 15, 25);

  // Infos générales
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  let y = 45;
  doc.text(`Date : ${dateActuelle}`, 15, y);
  y += 7;
  doc.text(`Numéro de transaction : ${transactionId}`, 15, y);
  y += 12;

  // Tableau des services
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Services achetés', 15, y);
  y += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  y += 6;

  selection.forEach(item => {
    doc.text(item.nom, 15, y);
    doc.text(`${item.prix} $`, 180, y, { align: 'right' });
    y += 7;
  });

  y += 3;
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Total payé', 15, y);
  doc.text(`${total} $`, 180, y, { align: 'right' });

  // Pied de page
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Merci pour votre confiance. — AlphaIT', 15, 280);

  doc.save(`AlphaIT_recu_${transactionId}.pdf`);
}

  function afficherErreur(message) {
  paymentAlert.textContent = message;
  paymentAlert.className = 'alert alert-danger';
  paymentAlert.classList.remove('d-none');

  setTimeout(() => paymentAlert.classList.add('d-none'), 5000);
}
});