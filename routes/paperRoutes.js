const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Paper = require('../models/Paper');
const auth = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage — PDFs stored permanently in cloud
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'question-papers',
    resource_type: 'raw',
    format: 'pdf',
    use_filename: true,
    unique_filename: true,
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// GET all papers with filters (public)
router.get('/', async (req, res) => {
  try {
    const { university, branch, semester, year, subject, course } = req.query;
    const filter = {};
    if (university) filter.university = university;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (year) filter.year = year;
    if (course) filter.course = course;
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
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { title, university, course, branch, semester, year, subject, examType } = req.body;

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
      filePath: req.file.path, // Cloudinary gives full URL here
      uploadedBy: req.user.id,
    });

    await paper.save();
    res.status(201).json({ message: 'Paper uploaded successfully', paper });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE paper (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    // Delete from Cloudinary too
    if (paper.filePath && paper.filePath.includes('cloudinary')) {
      try {
        const parts = paper.filePath.split('/');
        const publicId = 'question-papers/' + parts[parts.length - 1].replace('.pdf', '');
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (cloudErr) {
        console.error('Cloudinary delete error:', cloudErr.message);
      }
    }

    await Paper.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;