const { v4: uuidv4 } = require('uuid');
const { isValidUrl } = require('../utils/validator');
const { generateUuidFilename } = require('../utils/filename');
const { downloadQueue } = require('../utils/queue');
const ytDlpService = require('../services/ytDlpService');
const historyService = require('../services/historyService');

// Valid formats array
const VALID_FORMATS = ['mp4-360', 'mp4-720', 'mp4-best', 'mp3-128', 'mp3-320', 'm4a'];

/**
 * Handles GET /health
 */
function healthCheck(req, res) {
  return res.json({ status: 'ok' });
}

/**
 * Handles POST /api/info
 */
async function getInfo(req, res) {
  const { url } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or unsupported URL. Please enter a valid HTTP/HTTPS link.'
    });
  }

  try {
    const metadata = await ytDlpService.fetchMetadata(url);
    return res.json({
      success: true,
      metadata
    });
  } catch (error) {
    console.error('Info fetching error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve media metadata.'
    });
  }
}

/**
 * Handles POST /api/download
 */
async function download(req, res) {
  const { url, format } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or unsupported URL.'
    });
  }

  if (!format || !VALID_FORMATS.includes(format)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid download format requested.'
    });
  }

  // Create temporary unique ID for tracking
  const downloadId = uuidv4();

  try {
    // Queue the download to respect concurrency limits
    const result = await downloadQueue.run(async () => {
      // 1. Fetch metadata first to get video details (Title, Thumbnail, etc.)
      const metadata = await ytDlpService.fetchMetadata(url);

      // 2. Perform the download & convert via ytDlpService
      const downloadResult = await ytDlpService.downloadMedia(url, format, downloadId);

      // 3. Add record to download history
      const historyItem = historyService.addToHistory({
        id: downloadId,
        url,
        title: metadata.title,
        uploader: metadata.uploader,
        duration: metadata.duration,
        thumbnail: metadata.thumbnail,
        format,
        filename: downloadResult.filename,
        status: 'completed',
        size: downloadResult.size
      });

      return {
        downloadUrl: `/downloads/${downloadResult.filename}`,
        filename: downloadResult.filename
      };
    });

    return res.json({
      success: true,
      downloadUrl: result.downloadUrl
    });

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Media download processing failed.'
    });
  }
}

/**
 * Handles GET /api/history
 */
function getHistoryList(req, res) {
  try {
    const history = historyService.getHistory();
    return res.json({
      success: true,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve download history.'
    });
  }
}

module.exports = {
  healthCheck,
  getInfo,
  download,
  getHistoryList
};
