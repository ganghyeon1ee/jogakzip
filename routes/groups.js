const express = require('express');
const groupController = require('../controllers/groupController');

const router = express.Router();

// 그룹 생성
router.post('/groups', groupController.createGroup);

// 그룹 수정
router.put('/groups/:groupId', groupController.updateGroup);

// 그룹 삭제
router.delete('/groups/:groupId', groupController.deleteGroup);

// 그룹 목록 조회
router.get('/groups', groupController.getGroups);

// 그룹 공개 여부 확인
router.get('/groups/:groupId/is-public', groupController.checkGroupIsPublic);

module.exports = router;
