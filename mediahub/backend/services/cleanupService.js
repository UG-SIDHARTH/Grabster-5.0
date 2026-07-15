const fs = require('fs');
const path = require('path');
const historyService = require('./historyService');

const downloadsDir = path.resolve(__dirname, '..', 'downloads');
const tempDir = path.resolve(__dirname, '..', 'temp');

// 5 hours in milliseconds
const FILE_EXPIRY_MS = 5 * 60 * 60 * 1000;

// Whitelist of file extensions we can safely clean up in the temp folder.
// This avoids deleting developers' javascript test files (.js) or config files.
const TEMP_EXT_WHITELIST = [
  '.mp4', '.webm', '.mp3', '.m4a', '.jpg', '.jpeg', 
  '.png', '.gif', '.webp', '.part', '.ytdl', '.3gp', 
  '.mkv', '.avi', '.tmp', '.temp'
];

/**
 * Checks directories and removes files older than 1 hour.
 */
function cleanupOldFiles() {
  console.log(`[Cleanup Service] Starting periodic cleanup scan at ${new Date().toISOString()}...`);

  // 1. Clean up downloads directory
  if (fs.existsSync(downloadsDir)) {
    try {
      const files = fs.readdirSync(downloadsDir);
      files.forEach(file => {
        const filePath = path.join(downloadsDir, file);
        try {
          const stat = fs.statSync(filePath);
          // Check if file is a file (not directory) and is older than 1 hour
          if (stat.isFile()) {
            const ageMs = Date.now() - stat.mtimeMs;
            if (ageMs > FILE_EXPIRY_MS) {
              console.log(`[Cleanup Service] Deleting expired downloaded file: ${file} (Age: ${Math.round(ageMs / 60000)}m)`);
              fs.unlinkSync(filePath);
              
              // Expire the corresponding record in history
              historyService.expireHistoryItemByFilename(file);
            }
          }
        } catch (fileErr) {
          console.error(`[Cleanup Service] Error processing download file ${file}:`, fileErr);
        }
      });
    } catch (dirErr) {
      console.error('[Cleanup Service] Error scanning downloads directory:', dirErr);
    }
  }

  // 2. Clean up temp directory
  if (fs.existsSync(tempDir)) {
    try {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        // Only target temporary download/media files based on whitelist
        if (TEMP_EXT_WHITELIST.includes(ext)) {
          const filePath = path.join(tempDir, file);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              const ageMs = Date.now() - stat.mtimeMs;
              if (ageMs > FILE_EXPIRY_MS) {
                console.log(`[Cleanup Service] Deleting expired temp file: ${file} (Age: ${Math.round(ageMs / 60000)}m)`);
                fs.unlinkSync(filePath);
              }
            }
          } catch (fileErr) {
            console.error(`[Cleanup Service] Error processing temp file ${file}:`, fileErr);
          }
        }
      });
    } catch (dirErr) {
      console.error('[Cleanup Service] Error scanning temp directory:', dirErr);
    }
  }

  // 3. Self-healing check: Expire history entries if files are missing from disk
  try {
    const history = historyService.getHistory();
    let updated = false;
    history.forEach(item => {
      if (item.filename && item.status !== 'expired') {
        const filePath = path.join(downloadsDir, item.filename);
        if (!fs.existsSync(filePath)) {
          console.log(`[Cleanup Service] Self-healing: file ${item.filename} is missing from disk. Expiring history entry.`);
          historyService.expireHistoryItemByFilename(item.filename);
          updated = true;
        }
      }
    });
  } catch (historyErr) {
    console.error('[Cleanup Service] Error during history self-healing:', historyErr);
  }
}

/**
 * Starts the periodic cleanup job.
 * @param {number} intervalMs - Cleanup interval (defaults to 5 minutes)
 */
function startCleanupInterval(intervalMs = 5 * 60 * 1000) {
  // Run once immediately on startup
  cleanupOldFiles();
  
  // Schedule periodic cleanup
  setInterval(cleanupOldFiles, intervalMs);
}

module.exports = {
  cleanupOldFiles,
  startCleanupInterval
};
