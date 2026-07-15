const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const historyService = require('./services/historyService');
const cleanupService = require('./services/cleanupService');
const { sanitizeTitleForHeader } = require('./utils/filename');
const apiRoutes = require('./routes/api');
const mediaController = require('./controllers/mediaController');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure runtime directories exist
const downloadsDir = path.join(__dirname, 'downloads');
const tempDir = path.join(__dirname, 'temp');
const cookiesDir = path.join(__dirname, 'cookies');

[downloadsDir, tempDir, cookiesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Required to allow media streaming & download cross-origin
}));
app.use(cors());
app.use(express.json());

// API Rate Limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', mediaController.healthCheck);

// API router mounts
app.use('/api', apiRoutes);

// Safe download routing that returns a user-friendly filename instead of the inner UUID
app.get('/downloads/:filename', (req, res) => {
  const { filename } = req.params;

  // Strict regex match to allow ONLY uuid.ext format (prevent directory traversal)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i.test(filename)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file reference.'
    });
  }

  const filePath = path.join(downloadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File does not exist or has expired.'
    });
  }

  // Look up original file name in download history database
  const history = historyService.getHistory();
  const item = history.find(entry => entry.filename === filename);

  let clientFilename = filename;
  if (item) {
    const safeTitle = sanitizeTitleForHeader(item.title);
    const ext = path.extname(filename);
    clientFilename = `${safeTitle}${ext}`;
  }

  res.download(filePath, clientFilename, (error) => {
    if (error) {
      console.error(`Error sending download stream for file ${filename}:`, error);
    }
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`Novara backend listening at http://localhost:${PORT}`);
  // Start periodic cleanup of files older than 1 hour
  cleanupService.startCleanupInterval();
});
