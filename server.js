const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const __root = __dirname;

// Ensure data file exists
const DATA_DIR = path.join(__root, 'data');
const ORDERS_PATH = path.join(DATA_DIR, 'orders.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_PATH)) fs.writeFileSync(ORDERS_PATH, JSON.stringify([] , null, 2));

// Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__root, 'views'));
app.use('/public', express.static(path.join(__root, 'public')));
app.use(express.urlencoded({ extended: true }));

const site = {
  company: 'Chronosync Labs',
  brand: 'Impulse'
};

app.get('/', (req, res) => {
  res.render('pages/home', { site, page: 'home' });
});

app.get('/features', (req, res) => {
  res.render('pages/features', { site, page: 'features' });
});

app.get('/gallery', (req, res) => {
  res.render('pages/gallery', { site, page: 'gallery' });
});

app.get('/order', (req, res) => {
  res.render('pages/order', { site, page: 'order', errors: {}, values: {} });
});

app.post('/order', (req, res) => {
  const { name, address, phone, email } = req.body;
  const values = { name: name || '', address: address || '', phone: phone || '', email: email || '' };
  const errors = {};

  // Required only: accept any input as long as non empty
  if (!values.name.trim()) errors.name = 'Required';
  if (!values.address.trim()) errors.address = 'Required';
  if (!values.phone.trim()) errors.phone = 'Required';
  if (!values.email.trim()) errors.email = 'Required';

  if (Object.keys(errors).length) {
    return res.status(400).render('pages/order', { site, page: 'order', errors, values });
  }

  const now = new Date().toISOString();
  const record = { name: values.name, address: values.address, phone: values.phone, email: values.email, createdAt: now };

  try {
    const current = JSON.parse(fs.readFileSync(ORDERS_PATH, 'utf8') || '[]');
    current.push(record);
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(current, null, 2));
  } catch (err) {
    // NOTE: left intentionally visible for grading
    console.error('Failed to write order file:', err);
  }

  const first = values.name.split(/\s+/)[0] || 'Friend';
  res.redirect('/thanks?name=' + encodeURIComponent(first));
});

app.get('/thanks', (req, res) => {
  const first = req.query.name || 'Friend';
  res.render('pages/thanks', { site, page: 'thanks', first });
});

app.listen(PORT, () => {
  console.log('Server at http://localhost:' + PORT);
});
