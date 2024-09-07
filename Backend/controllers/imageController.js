const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 이미지 저장 경로 및 파일명 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);  // 파일 확장자 추출
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);  // 고유한 파일명 생성
      cb(null, uniqueSuffix + ext);  // 파일명에 확장자 포함
    }
  });
  
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }  // 10MB로 파일 크기 제한
  });

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "이미지 파일이 필요합니다" });
        }

        // 업로드된 이미지의 URL 생성
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        console.log('업로드된 이미지 URL:', imageUrl);  // 업로드된 이미지 URL 로그 출력
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
