const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const audioProcessor = require('./services/audioProcessor');
const videoProcessor = require('./services/videoProcessor');
const cloudinaryProcessor = require('./services/cloudinaryProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/process', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'), false);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Process audio/video endpoint
app.post('/api/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { enhancementLevel = 'medium', processingMode = 'cloudinary' } = req.body;
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const isVideo = fileType.startsWith('video/');

    // Create output directory
    const outputDir = path.join(__dirname, 'processed');
    fs.ensureDirSync(outputDir);

    let result;
    
    // Choose processing method based on mode
    if (processingMode === 'cloudinary') {
      // Use Cloudinary (cloud-based, no FFmpeg needed)
      if (isVideo) {
        result = await cloudinaryProcessor.processVideo(filePath, outputDir, enhancementLevel);
      } else {
        result = await cloudinaryProcessor.processAudio(filePath, outputDir, enhancementLevel);
      }
    } else if (processingMode === 'assemblyai') {
      // Use AssemblyAI (AI-powered)
      if (isVideo) {
        result = await videoProcessor.processVideo(filePath, outputDir, enhancementLevel, false);
      } else {
        result = await audioProcessor.processAudio(filePath, outputDir, enhancementLevel, false);
      }
    } else {
      // Use FFmpeg (local processing)
      if (isVideo) {
        result = await videoProcessor.processVideo(filePath, outputDir, enhancementLevel, true);
      } else {
        result = await audioProcessor.processAudio(filePath, outputDir, enhancementLevel, true);
      }
    }

    // Clean up uploaded file
    fs.removeSync(filePath);

    res.json({
      success: true,
      message: 'File processed successfully',
      downloadUrl: `/api/download/${result.filename}`,
      filename: result.filename,
      processingTime: result.processingTime,
      originalSize: req.file.size,
      processedSize: result.size
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.removeSync(req.file.path);
    }

    res.status(500).json({
      error: 'Processing failed',
      message: error.message
    });
  }
});

// Download processed file
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'processed', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Download error:', err);
    } else {
      // Clean up file after download
      setTimeout(() => {
        fs.removeSync(filePath);
      }, 5000);
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Audio Noise Cleanup SaaS running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📁 Processed directory: ${path.join(__dirname, 'processed')}`);
}); 