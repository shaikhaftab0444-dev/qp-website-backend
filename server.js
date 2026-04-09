const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded PDFs
// uploads/ folder is at the same level as server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/papers', require('./routes/paperRoutes'));

// Test route
app.get('/', (req, res) => res.json({ message: 'Server is running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log('📁 Uploads path: ' + path.join(__dirname, 'uploads'));
});