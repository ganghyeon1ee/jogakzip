const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

// 게시글 등록
router.post('/groups/:groupId/posts', postController.createPost);

// 게시글 수정
router.put('/posts/:postId', postController.updatePost);

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

module.exports = router;
