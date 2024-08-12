const db = require('../db/db');

const createPost = async (groupId, postData) => {
    const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = postData;
    const [result] = await db.execute(
        'INSERT INTO posts (groupId, nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [groupId, nickname, title, content, postPassword, imageUrl, JSON.stringify(tags), location, moment, isPublic]
    );
    return result.insertId;
};

module.exports = {
    createPost,
};
