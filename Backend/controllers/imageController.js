const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
require('dotenv').config();  // .env 파일 로드

// AWS S3 클라이언트 설정
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// multer 메모리 스토리지 설정 (S3 업로드용)
const memoryStorage = multer.memoryStorage();
const uploadToS3 = multer({ storage: memoryStorage });

// S3로 파일 업로드 함수
const uploadImageToS3 = async (file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);

    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',  // 파일을 퍼블릭으로 설정
    };

    try {
        await s3.send(new PutObjectCommand(uploadParams));
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        return fileUrl;
    } catch (err) {
        console.error('S3 업로드 오류:', err);
        throw err;
    }
};

module.exports = { uploadToS3, uploadImageToS3 };