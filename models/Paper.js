const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  university: { type: String, enum: ['DBATU', 'BAMU'], required: true },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  year: { type: String, required: true },
  subject: { type: String, required: true },
  examType: { type: String, default: 'Winter' },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Paper', paperSchema);
