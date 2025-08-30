const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeWithGemini: analyzeDocument } = require('../services/gemini');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/analyze', upload.array('prescription', 8), async (req, res) => {
  console.log('=== Prescription Analysis Request ===');
  console.log('Files received:', req.files?.length || 0);
  
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file (PDF or image)',
        help: 'Send files using multipart/form-data with field name "prescription"'
      });
    }

    const results = await Promise.all(req.files.map(async (file) => {
      try {
        const filePath = file.path;
        const analysis = await analyzeDocument(filePath);
        return {
          filename: file.originalname,
          filePath: file.path,
          analysis: analysis
        };
      } catch (error) {
        console.error(`Error analyzing file ${file.originalname}:`, error);
        return {
          filename: file.originalname,
          error: error.message
        };
      }
    }));

    res.json({
      success: true,
      message: 'Analysis completed',
      results: results
    });

  } catch (error) {
    console.error('Prescription analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing prescription',
      error: error.message
    });
  }
});

router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

module.exports = router;