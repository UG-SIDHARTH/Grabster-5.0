const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Generates a safe file name using UUIDv4.
 * @param {string} ext - The file extension (e.g. '.mp4', '.mp3')
 * @returns {string} Safe UUID filename with extension
 */
function generateUuidFilename(ext) {
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
  return `${uuidv4()}${cleanExt}`;
}

/**
 * Sanitizes a title string so it is safe to use in headers like Content-Disposition.
 * Removes characters that might break HTTP headers or filesystem names.
 * @param {string} title - Original video title
 * @returns {string} Sanitized title
 */
function sanitizeTitleForHeader(title) {
  if (!title || typeof title !== 'string') {
    return 'download';
  }
  // Replace non-ASCII and characters that can cause issues in Content-Disposition or filenames
  let sanitized = title
    .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
    .replace(/["\/\\]/g, '_')     // Replace quotes and slashes with underscores
    .trim();
  
  return sanitized || 'download';
}

module.exports = {
  generateUuidFilename,
  sanitizeTitleForHeader
};
