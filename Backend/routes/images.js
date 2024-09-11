const express = require('express');
const { uploadImageToS3 } = require('../utils/imageUtils'); // 수정된 위치
const router = express.Router();
const multer = require('multer');
const memoryStorage = multer.memoryStorage(); // 메모리 스토리지 설정
const upload = multer({ storage: memoryStorage }); // multer 미들웨어 설정

// 이미지 업로드 라우트
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "이미지 파일이 필요합니다" });
        }

        // AWS S3로 이미지 업로드
        const imageUrl = await uploadImageToS3(req.file);
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: "파일 업로드 오류" });
    }
});

module.exports = router;
