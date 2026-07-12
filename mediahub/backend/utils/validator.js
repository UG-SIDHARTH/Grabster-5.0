/**
 * Validates and sanitizes the user-provided URL.
 * Ensures the URL is a valid web address, uses http/https protocols,
 * and does not start with flags or contain invalid characters that could lead to argument injection.
 */
function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }

  const trimmed = urlString.trim();

  // Prevent argument injection where URL starts with dashes
  if (trimmed.startsWith('-')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Block URLs containing whitespace to prevent injection edge-cases
    if (/\s/.test(trimmed)) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  isValidUrl
};
