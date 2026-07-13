const fs = require('fs');
const path = require('path');

const HISTORY_PATH = path.join(__dirname, '..', 'history.json');

/**
 * Ensures the history file exists and is initialized as an empty array.
 */
function initHistory() {
  try {
    if (!fs.existsSync(HISTORY_PATH)) {
      fs.writeFileSync(HISTORY_PATH, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (error) {
    console.error('Failed to initialize history file:', error);
  }
}

/**
 * Reads all entries from the history file.
 * @returns {Array} Array of history items
 */
function getHistory() {
  initHistory();
  try {
    const data = fs.readFileSync(HISTORY_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading history file:', error);
    return [];
  }
}

/**
 * Saves the history array to history.json.
 * @param {Array} historyList - Full array of history items
 */
function saveHistory(historyList) {
  try {
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(historyList, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to history file:', error);
  }
}

/**
 * Adds a new entry to the download history.
 * Limits history list to the last 50 items to optimize storage space.
 * @param {Object} item - Download info item
 * @returns {Object} Added item
 */
function addToHistory(item) {
  const history = getHistory();
  const newItem = {
    id: item.id,
    url: item.url,
    title: item.title,
    uploader: item.uploader || 'Unknown',
    duration: item.duration || 0,
    thumbnail: item.thumbnail || '',
    format: item.format,
    filename: item.filename,
    status: item.status || 'pending',
    timestamp: new Date().toISOString(),
    size: item.size || 0
  };
  
  history.unshift(newItem);
  
  // Keep only the last 50 items
  if (history.length > 50) {
    history.pop();
  }

  saveHistory(history);
  return newItem;
}

/**
 * Updates properties of a history item by ID.
 * @param {string} id - Item unique identifier (UUID)
 * @param {Object} updates - Properties to merge
 */
function updateHistoryItem(id, updates) {
  const history = getHistory();
  const index = history.findIndex(item => item.id === id);
  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    saveHistory(history);
  }
}

/**
 * Removes an entry from the history list by filename.
 * @param {string} filename - Filename of the item to remove
 */
function removeFromHistory(filename) {
  const history = getHistory();
  const filtered = history.filter(item => item.filename !== filename);
  saveHistory(filtered);
}

// Initialise on load
initHistory();

module.exports = {
  getHistory,
  addToHistory,
  updateHistoryItem,
  removeFromHistory
};
