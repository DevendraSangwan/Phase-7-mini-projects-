const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, default: '', maxlength: 50000 },
    shareToken: { type: String, required: true, unique: true, select: false }
  },
  { timestamps: true, collection: 'Mini project 2' }
);

module.exports = mongoose.model('MiniProjectTwoNote', noteSchema);
