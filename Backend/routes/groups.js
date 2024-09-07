// routes/groups.js
const express = require('express');
const groupController = require('../controllers/groupController');
const imageController = require('../controllers/imageController'); // 이미지 업로드용 컨트롤러
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + ext);
    }
  });

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

// 그룹 생성 (multer 미들웨어 추가)
router.post('/groups', upload.single('image'), groupController.createGroup);

// 그룹 수정 (multer 미들웨어 추가)
router.put('/groups/:groupId', upload.single('image'), groupController.updateGroup);

// 그룹 삭제
router.delete('/groups/:groupId', groupController.deleteGroup);

// 그룹 목록 조회
router.get('/groups', groupController.getGroups);

// 그룹 공개 여부 확인
router.get('/groups/:groupId/is-public', groupController.checkGroupIsPublic);

// 그룹 공감하기
router.post('/groups/:groupId/like', groupController.likeGroup);

// 그룹 비밀번호 확인
router.post('/groups/:groupId/verify-password', groupController.verifyPassword);

// 그룹 상세 정보 조회
router.get('/groups/:groupId', groupController.getGroupDetails);

module.exports = router;
