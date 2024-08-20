const db = require('../db/db');

// 댓글 생성
const createComment = async (postId, commentData) => {
    const { nickname, content, password } = commentData;
    const [result] = await db.execute(
        'INSERT INTO comments (postId, nickname, content, password) VALUES (?, ?, ?, ?)',
        [postId, nickname, content, password]
    );
    return result.insertId;
};

<<<<<<< HEAD
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
=======
// 댓글 수정
const updateComment = async (commentId, commentData) => {
    const { nickname, content, password } = commentData;
    await db.execute(
        'UPDATE comments SET nickname = ?, content = ?, password = ? WHERE id = ?',
        [nickname, content, password, commentId]
>>>>>>> 01e288fe870bf45d6036d404a8fe3bc828f671f1
    );
};

// 댓글 삭제
const deleteComment = async (commentId) => {
    await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);
};

<<<<<<< HEAD
// 댓글 조회
const getCommentsByPostId = async (postId, page, pageSize) => {
    const limit = pageSize;
    const offset = (page - 1) * limit;

    // postId, limit, offset 로그로 출력하여 확인
    console.log('postId:', postId);
    console.log('limit:', limit);
    console.log('offset:', offset);

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
=======
// 댓글 id로 댓글 전체 요소 불러오기
const findCommentById = async (commentId) => {
    const [rows] = await db.execute('SELECT * FROM comments WHERE id = ?', [commentId]);
    return rows[0];
};

// 게시글 id로 댓글 불러오기
const getCommentsByPostId = async (postId, page, pageSize) => {
    const offset = (page - 1) * pageSize;
    try {
        const [comments] = await db.query(
            'SELECT id, nickname, content, createdAt FROM comments WHERE postId = ? ORDER BY createdAt ASC LIMIT ? OFFSET ?',
            [postId, parseInt(pageSize, 10), parseInt(offset, 10)]
        );

        const [total] = await db.query(
            'SELECT COUNT(*) as count FROM comments WHERE postId = ?',
            [postId]
        );

        const totalPages = Math.ceil(total[0].count / pageSize);

        return {
            currentPage: page,
            totalPages,
            totalItemCount: total[0].count,
            data: comments
        };
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

module.exports = {
    createComment,
    updateComment,
    deleteComment,
    findCommentById,
>>>>>>> 01e288fe870bf45d6036d404a8fe3bc828f671f1
    getCommentsByPostId,
};
