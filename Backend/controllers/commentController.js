const commentModel = require('../models/commentModel');
const db = require('../db/db'); 

// 댓글 등록
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { nickname, content, password } = req.body;

        if (!nickname || !content || !password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const commentId = await commentModel.createComment(postId, req.body);
        const comment = await commentModel.findCommentById(commentId);

        res.status(200).json({
            id: comment.id,
            nickname: comment.nickname,
            content: comment.content,
            createdAt: comment.createdAt
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 댓글 수정
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { nickname, content, password } = req.body;

        const comment = await commentModel.findCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        if (comment.password !== password) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await commentModel.updateComment(commentId, req.body);
        const updatedComment = await commentModel.findCommentById(commentId);

        res.status(200).json({
            id: updatedComment.id,
            nickname: updatedComment.nickname,
            content: updatedComment.content,
            createdAt: updatedComment.createdAt
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { password } = req.body;

        const comment = await commentModel.findCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        if (comment.password !== password) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await commentModel.deleteComment(commentId);
        res.status(200).json({ message: "답글 삭제 성공" });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 특정 게시글의 댓글 목록 조회
const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;
        let { page = 1, pageSize = 10 } = req.query;

        // page 및 pageSize를 정수로 변환
        page = parseInt(page, 10);
        pageSize = parseInt(pageSize, 10);

        // 유효성 검사 추가: page와 pageSize가 숫자인지 확인
        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        // 댓글 목록과 메타 데이터를 가져옴
        const commentsData = await commentModel.getCommentsByPostId(postId, page, pageSize);

        // 댓글 데이터가 있는지 확인
        if (commentsData.data.length === 0) {
            return res.status(200).json({
                currentPage: page,
                totalPages: 0,
                totalItemCount: 0,
                data: []
            });
        }

        // 응답 생성
        res.status(200).json({
            currentPage: commentsData.currentPage,
            totalPages: commentsData.totalPages,
            totalItemCount: commentsData.totalItemCount,
            data: commentsData.data
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    getCommentsByPostId,
};
