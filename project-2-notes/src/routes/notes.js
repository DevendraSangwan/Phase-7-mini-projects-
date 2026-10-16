const { randomBytes } = require('crypto');
const express = require('express');
const Note = require('../models/Note');

const router = express.Router();

function noteResponse(note, includeToken = false) {
  const result = {
    id: note.id,
    title: note.title,
    content: note.content,
    updatedAt: note.updatedAt
  };
  if (includeToken) result.shareToken = note.shareToken;
  return result;
}

function validateNote(title, content) {
  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.trim().length > 120 ||
    typeof content !== 'string' ||
    content.length > 50000
  ) {
    return 'A title (up to 120 characters) and note content (up to 50,000 characters) are required.';
  }
  return null;
}

router.post('/', async (req, res) => {
  const { title, content } = req.body || {};
  const validationError = validateNote(title, content);
  if (validationError) return res.status(400).json({ message: validationError });

  const note = await Note.create({
    title: title.trim(),
    content,
    shareToken: randomBytes(32).toString('hex')
  });
  return res.status(201).json({ note: noteResponse(note, true) });
});

router.get('/:shareToken', async (req, res) => {
  const note = await Note.findOne({ shareToken: req.params.shareToken }).select('+shareToken');
  if (!note) return res.status(404).json({ message: 'Note was not found.' });
  return res.json({ note: noteResponse(note) });
});

router.put('/:shareToken', async (req, res) => {
  const { title, content } = req.body || {};
  const validationError = validateNote(title, content);
  if (validationError) return res.status(400).json({ message: validationError });

  const note = await Note.findOneAndUpdate(
    { shareToken: req.params.shareToken },
    { title: title.trim(), content },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ message: 'Note was not found.' });
  return res.json({ note: noteResponse(note) });
});

module.exports = router;
