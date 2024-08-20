const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 이미지 저장 경로 및 파일명 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname)); // 고유한 파일 이름 생성
    }
});

const upload = multer({ storage: storage });

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "이미지 파일이 필요합니다" });
        }

        // 업로드된 이미지의 URL 생성
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl: imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

module.exports = {
    upload,
    uploadImage
};
