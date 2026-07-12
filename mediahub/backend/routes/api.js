const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

// Define API Endpoints
router.post('/info', mediaController.getInfo);
router.post('/download', mediaController.download);
router.get('/history', mediaController.getHistoryList);

module.exports = router;
