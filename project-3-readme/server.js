require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const readmeRoutes = require('./src/routes/readmes');

const app = express();
const port = Number(process.env.PORT) || 3003;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini';

app.use(express.json({ limit: '20kb' }));
app.use('/api/readmes', readmeRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, _req, res, _next) => {
  console.error('Request failed:', err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function start() {
  await mongoose.connect(mongoUri, { dbName: 'mini' });
  app.listen(port, () => {
    console.log(`README Generator listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Could not start README Generator:', err);
  process.exitCode = 1;
});
