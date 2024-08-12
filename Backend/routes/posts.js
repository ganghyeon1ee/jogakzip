const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

// 게시글 등록
router.post('/groups/:groupId/posts', postController.createPost);

// 게시글 수정
router.put('/posts/:postId', postController.updatePost);

// 게시글 삭제
router.delete('/posts/:postId', postController.deletePost);

module.exports = router;
