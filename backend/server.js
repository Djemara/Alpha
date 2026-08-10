const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const userRoutes = require('./routes/userRoutes');
const temoignageRoutes = require('./routes/temoignageRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// N ap di Express pou l al chèche dosye frontend lan dirèkteman nan rasin pwojè a nèt
app.use(express.static('../frontend'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('../frontend/index.html'));
});







app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/paiement', paiementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/temoignages', temoignageRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur AlphaIT fonctionne correctement.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur AlphaIT démarré sur http://localhost:${PORT}`);
});
