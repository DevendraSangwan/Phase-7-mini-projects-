const mongoose = require('mongoose');

const readmeSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    features: [{ type: String, trim: true, maxlength: 200 }],
    content: { type: String, required: true, maxlength: 30000 }
  },
  { timestamps: true, collection: 'Mini project 3' }
);

module.exports = mongoose.model('MiniProjectThreeReadme', readmeSchema);
