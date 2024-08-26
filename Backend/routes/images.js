const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

router.post('/image', imageController.upload.single('image'), imageController.uploadImage);

module.exports = router;
