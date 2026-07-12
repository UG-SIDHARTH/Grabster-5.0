const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const cookiesPath = path.resolve(__dirname, '..', 'cookies', 'cookies.txt');
const tempDir = path.resolve(__dirname, '..', 'temp');
const downloadsDir = path.resolve(__dirname, '..', 'downloads');

// Ensure folders exist
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

// In-memory cache for metadata: url -> { data, expiresAt }
const metadataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Checks if a string contains authentication indicators from yt-dlp stderr.
 * @param {string} errorStr - stderr output from yt-dlp
 * @returns {boolean}
 */
function isAuthRequiredError(errorStr) {
  const lower = errorStr.toLowerCase();
  return (
    lower.includes('confirm your age') ||
    lower.includes('sign in') ||
    lower.includes('login required') ||
    lower.includes('private video') ||
    lower.includes('forbidden') ||
    lower.includes('unauthorized') ||
    lower.includes('cookies') ||
    lower.includes('members-only') ||
    lower.includes('join this channel')
  );
}

/**
 * Helper to execute yt-dlp safely via spawn.
 * @param {string[]} args - CLI arguments
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
function executeYtDlp(args) {
  return new Promise((resolve, reject) => {
    const defaultArgs = ['--no-warnings', '--no-playlist'];
    
    // Add cookies option if cookies file exists
    if (fs.existsSync(cookiesPath)) {
      defaultArgs.push('--cookies', cookiesPath);
    }
    
    const child = spawn('yt-dlp', [...defaultArgs, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Fetches and caches metadata using yt-dlp --dump-json.
 * @param {string} url - Target URL
 * @returns {Promise<Object>} Formatted metadata object
 */
async function fetchMetadata(url) {
  // Check Cache
  const cached = metadataCache.get(url);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const result = await executeYtDlp(['--dump-json', url]);
    
    if (result.code !== 0) {
      if (isAuthRequiredError(result.stderr)) {
        throw new Error('This content requires authentication or cookies.');
      }
      throw new Error(result.stderr || 'Failed to fetch metadata from URL');
    }

    const rawData = JSON.parse(result.stdout);
    
    // Format upload date nicely: YYYYMMDD -> YYYY-MM-DD
    let formattedDate = 'Unknown';
    if (rawData.upload_date && rawData.upload_date.length === 8) {
      formattedDate = `${rawData.upload_date.substring(0, 4)}-${rawData.upload_date.substring(4, 6)}-${rawData.upload_date.substring(6, 8)}`;
    }

    const metadata = {
      title: rawData.title || 'Untitled Video',
      thumbnail: rawData.thumbnail || rawData.thumbnails?.[0]?.url || '',
      duration: rawData.duration || 0,
      uploader: rawData.uploader || rawData.channel || 'Unknown',
      uploadDate: formattedDate,
      originalUrl: url
    };

    // Cache the result
    metadataCache.set(url, {
      data: metadata,
      expiresAt: Date.now() + CACHE_TTL
    });

    return metadata;
  } catch (error) {
    if (error.message.includes('authentication or cookies')) {
      throw error;
    }
    console.error('yt-dlp metadata extraction failed:', error);
    throw new Error(error.message || 'Error occurred while calling media engine.');
  }
}

/**
 * Downloads a video/audio using yt-dlp, and returns path/size.
 * @param {string} url - Target URL
 * @param {string} format - Format selection (mp4-360, mp4-720, mp4-best, mp3-128, mp3-320, m4a)
 * @param {string} fileUuid - UUID generated for filename
 * @returns {Promise<{filePath: string, filename: string, size: number}>}
 */
async function downloadMedia(url, format, fileUuid) {
  const args = [
    url,
    '-o', path.join(tempDir, `${fileUuid}.%(ext)s`)
  ];

  let ext = 'mp4';
  
  if (format === 'mp4-360') {
    args.push('-f', 'bestvideo[height<=360]+bestaudio/best[height<=360]');
    args.push('--merge-output-format', 'mp4');
    ext = 'mp4';
  } else if (format === 'mp4-720') {
    args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]');
    args.push('--merge-output-format', 'mp4');
    ext = 'mp4';
  } else if (format === 'mp4-best') {
    args.push('-f', 'bestvideo+bestaudio/best');
    args.push('--merge-output-format', 'mp4');
    ext = 'mp4';
  } else if (format === 'mp3-128') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '128K');
    ext = 'mp3';
  } else if (format === 'mp3-320') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '320K');
    ext = 'mp3';
  } else if (format === 'm4a') {
    args.push('-x', '--audio-format', 'm4a');
    ext = 'm4a';
  }

  try {
    const result = await executeYtDlp(args);
    
    if (result.code !== 0) {
      if (isAuthRequiredError(result.stderr)) {
        throw new Error('This content requires authentication or cookies.');
      }
      throw new Error(result.stderr || 'Media download failed.');
    }

    // Now find the downloaded file in the temp directory.
    // yt-dlp might have written uuid.mp4, uuid.mp3, uuid.m4a, etc.
    const files = fs.readdirSync(tempDir);
    const downloadedFile = files.find(f => f.startsWith(fileUuid));

    if (!downloadedFile) {
      throw new Error('Could not find completed download file in temp workspace.');
    }

    const tempFilePath = path.join(tempDir, downloadedFile);
    const finalFilename = `${fileUuid}${path.extname(downloadedFile)}`;
    const finalFilePath = path.join(downloadsDir, finalFilename);

    // Stream download directly to disk by renaming/moving it
    fs.renameSync(tempFilePath, finalFilePath);

    // Get final file details
    const stats = fs.statSync(finalFilePath);
    
    return {
      filePath: finalFilePath,
      filename: finalFilename,
      size: stats.size
    };
  } catch (error) {
    // Attempt cleaning up files starting with fileUuid in temp
    try {
      const files = fs.readdirSync(tempDir);
      for (const f of files) {
        if (f.startsWith(fileUuid)) {
          fs.unlinkSync(path.join(tempDir, f));
        }
      }
    } catch (cleanupErr) {
      console.error('Failed to clean up temp files:', cleanupErr);
    }
    
    throw error;
  }
}

module.exports = {
  fetchMetadata,
  downloadMedia
};
