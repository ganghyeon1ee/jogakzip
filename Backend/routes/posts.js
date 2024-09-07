const express = require('express');
const postController = require('../controllers/postController');
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

// 게시글 등록
router.post('/groups/:groupId/posts', upload.single('image'), postController.createPost);

// 게시글 수정
router.put('/posts/:postId', upload.single('image'), postController.updatePost);

// 게시글 삭제
router.delete('/posts/:postId', postController.deletePost);

// 게시글 목록 조회
router.get('/groups/:groupId/posts', postController.getPosts);

// 게시글 상세 정보 조회
router.get('/posts/:postId', postController.getPostDetails);

// 게시글 조회 권한 확인
router.post('/posts/:postId/verify-password', postController.verifyPostPassword);

// 게시글 공감하기
router.post('/posts/:postId/like', postController.likePost);

// 게시글 공개 여부 확인
router.get('/posts/:postId/is-public', postController.checkPostIsPublic);

module.exports = router;
