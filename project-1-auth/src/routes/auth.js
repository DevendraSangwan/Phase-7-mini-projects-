const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!cleanName || cleanName.length > 100 || !emailPattern.test(cleanEmail)) {
    return res.status(400).json({ message: 'Enter a valid name and email address.' });
  }
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and no more than 72 bytes.'
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name: cleanName, email: cleanEmail, passwordHash });
    return res.status(201).json({ user: publicUser(user), token: createToken(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!cleanEmail || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  return res.json({ user: publicUser(user), token: createToken(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.auth.sub);
  if (!user) {
    return res.status(404).json({ message: 'User was not found.' });
  }
  return res.json({ user: publicUser(user) });
});

module.exports = router;
