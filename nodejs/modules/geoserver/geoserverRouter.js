// geoserverRouter.js
const express = require('express');
const router = express.Router();
const geoserverController = require('./geoserverController');
const multer = require('multer');
const AdmZip = require('adm-zip');

// Middleware for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create-workspace', geoserverController.createWorkspace);
router.post('/create-data-store', geoserverController.createDataStore);
router.post('/upload', upload.single('zipFile'), geoserverController.uploadShapefile);

router.get('/get-workspace', geoserverController.fetchWorkspaces);
router.post('/get-datastore', geoserverController.fetchDatastore);
router.get('/get-layers', geoserverController.fetchLayers);
router.post('/get-layers-attribute', geoserverController.getLayerAttributeInformation);
module.exports = router;
