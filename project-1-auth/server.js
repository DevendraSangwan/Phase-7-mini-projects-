require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./src/routes/auth');

const app = express();
const port = Number(process.env.PORT) || 3001;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the environment.');
}

app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', authRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, _req, res, _next) => {
  console.error('Request failed:', err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function start() {
  await mongoose.connect(mongoUri, { dbName: 'mini' });
  app.listen(port, () => {
    console.log(`Authentication API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Could not start the authentication API:', err);
  process.exitCode = 1;
});
