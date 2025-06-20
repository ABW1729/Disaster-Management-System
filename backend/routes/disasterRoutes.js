// routes/disasterRoutes.js
const express = require('express');
const router = express.Router();
const {
  createDisaster,
} = require('../controllers/disasterController');
const { getNDMAUpdates } = require('../controllers/updateController');
const {
  addReport,
  verifyReport,
  getReport
} = require('../controllers/imageController');
router.post('/', createDisaster);
router.get('/reports',getReport);
router.post('/geocode', require('../controllers/geocodeController').geocodeFromDescription);
router.get('/official-updates', getNDMAUpdates);
router.get('/', require('../controllers/disasterController').getDisasters);
router.post('/:id/reports', addReport);
router.post('/reports/:report_id/verify', verifyReport);
router.put('/:id', require('../controllers/disasterController').updateDisaster);
router.delete('/:id', require('../controllers/disasterController').deleteDisaster);
router.get('/:id/social-media', require('../controllers/twitterController').getDisasterTweets);
router.get('/:id/resources', require('../controllers/resourceController').getNearbyResources);
router.post('/resources/:disasterId', require('../controllers/resourceController').addResource);



module.exports = router;
