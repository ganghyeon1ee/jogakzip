const db = require('../db/db');

// 게시글 등록
const createPost = async (groupId, postData) => {
    const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = postData;
    const [result] = await db.execute(
        'INSERT INTO posts (groupId, nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [groupId, nickname, title, content, postPassword, imageUrl, JSON.stringify(tags), location, moment, isPublic]
    );
    return result.insertId;
};

// 게시글 찾기
const findPostById = async (postId) => {
    const [rows] = await db.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    return rows[0];
};

// 게시글 수정
const updatePost = async (postId, postData) => {
    const { nickname, title, content, imageUrl, tags, location, moment, isPublic } = postData;
    await db.execute(
        'UPDATE posts SET nickname = ?, title = ?, content = ?, imageUrl = ?, tags = ?, location = ?, moment = ?, isPublic = ? WHERE id = ?',
        [nickname, title, content, imageUrl, JSON.stringify(tags), location, moment, isPublic, postId]
    );
};

// 게시글 삭제
const deletePost = async (postId) => {
    await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
};


module.exports = {
    createPost,
    findPostById,
    updatePost,
    deletePost,
};
