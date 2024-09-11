const express = require('express');
const postController = require('../controllers/postController');
const multer = require('multer');
const { uploadImageToS3 } = require('../utils/imageUtils'); // S3 업로드 함수 불러오기

const storage = multer.memoryStorage(); // 메모리 스토리지로 설정
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