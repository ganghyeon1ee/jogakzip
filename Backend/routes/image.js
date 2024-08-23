const express = require('express');
const imageController = require('../controllers/imageController');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// 이미지 업로드 
router.post('/image', upload.single('image'), imageController.uploadImage);

module.exports = router;
