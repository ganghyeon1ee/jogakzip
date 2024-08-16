const commentModel = require('../models/commentModel');

// 댓글 생성
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { nickname, content, password } = req.body;

        if (!nickname || !content || !password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const commentId = await commentModel.createComment(postId, req.body);
        const comment = await commentModel.findCommentById(commentId);

        res.status(200).json({commentid: comment.id,
            nickname: comment.nickname,
            content: comment.content,
            createdAt: comment.createdAt});
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 댓글 수정
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const comment = await commentModel.findCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        if (comment.password !== password) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await commentModel.updateComment(commentId, req.body);
        const updatedComment = await commentModel.findCommentById(commentId);

        res.status(200).json({id: updatedComment.id,
            nickname: updatedComment.nickname,
            content: updatedComment.content,
            createdAt: updatedComment.createdAt});
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

        if (!password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

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

// 게시글 id로 댓글 불러오기
const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, pageSize = 10 } = req.query;

        const comments = await commentModel.getCommentsByPostId(postId, parseInt(page, 10), parseInt(pageSize, 10));

        res.status(200).json(comments);
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
