const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Paper = require('../models/Paper');
const auth = require('../middleware/auth');

// YOUR folder structure:
// question-paper-website/
//   ├── routes/paperRoutes.js   ← this file
//   ├── uploads/                ← PDFs go here
//   ├── models/
//   └── server.js
// So from routes/, uploads/ is one level up: ../uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// GET all papers with optional filters (public)
router.get('/', async (req, res) => {
  try {
    const { university, branch, semester, year, subject } = req.query;
    const filter = {};
    if (university) filter.university = university;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (year) filter.year = year;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    const papers = await Paper.find(filter).sort({ createdAt: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload paper (admin only)
router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    const { title, university, course, branch, semester, year, subject, examType } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const paper = new Paper({
      title,
      university,
      course,
      branch,
      semester,
      year,
      subject,
      examType: examType || 'Winter',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      uploadedBy: req.user.id
    });

    await paper.save();
    res.json(paper);
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE paper (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
