const db = require('../db/db');
const postModel = require('../models/postModel');

// 댓글 생성
const createComment = async (postId, commentData) => {
    const { nickname, content, password } = commentData;
    const [result] = await db.execute(
        'INSERT INTO comments (postId, nickname, content, password) VALUES (?, ?, ?, ?)',
        [postId, nickname, content, password]
    );
    return result.insertId;
};

// 댓글 조회
const findCommentById = async (commentId) => {
    const [rows] = await db.execute('SELECT * FROM comments WHERE id = ?', [commentId]);
    return rows[0];
};

// 댓글 수정
const updateComment = async (commentId, commentData) => {
    const { nickname, content } = commentData;
    await db.execute(
        'UPDATE comments SET nickname = ?, content = ? WHERE id = ?',
        [nickname, content, commentId]
    );
};

// 댓글 삭제
const deleteComment = async (commentId) => {
    await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);
};

// 특정 게시글의 댓글 목록 조회
const getCommentsByPostId = async (postId, page, pageSize) => {
    const limit = pageSize;
    const offset = (page - 1) * limit;

    // 댓글 목록 조회
    const [comments] = await db.query(
        'SELECT id, nickname, content, createdAt FROM comments WHERE postId = ? ORDER BY createdAt ASC LIMIT ? OFFSET ?',
        [postId, limit, offset]
    );

    // 댓글 총 개수 조회
    const [totalCountResult] = await db.query(
        'SELECT COUNT(*) as count FROM comments WHERE postId = ?',
        [postId]
    );
    const totalItemCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalItemCount / limit);

    return {
        currentPage: page,
        totalPages: totalPages,
        totalItemCount: totalItemCount,
        data: comments, // 댓글 데이터를 포함한 배열 반환
    };
};

module.exports = {
    createComment,
    findCommentById,
    updateComment,
    deleteComment,
    getCommentsByPostId,
};
