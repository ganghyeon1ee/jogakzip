const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

// 게시글(추억) 등록
router.post('/groups/:groupId/posts', postController.createPost);

module.exports = router;
