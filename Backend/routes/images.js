const express = require('express');
const { uploadToS3, uploadImageToS3 } = require('../controllers/imageController');
const router = express.Router();

// 이미지 업로드 라우트
router.post('/upload', uploadToS3.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "이미지 파일이 필요합니다" });
        }

        const imageUrl = await uploadImageToS3(req.file);
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: "파일 업로드 오류" });
    }
});

module.exports = router;