const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

// 댓글 등록
router.post('/posts/:postId/comments', commentController.createComment);

// 댓글 수정
router.put('/comments/:commentId', commentController.updateComment);

// 댓글 삭제
router.delete('/comments/:commentId', commentController.deleteComment);

// 댓글 목록 조회
router.get('/posts/:postId/comments', commentController.getCommentsByPostId);

module.exports = router;
