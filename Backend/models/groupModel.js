const db = require('../db/db');

// 그룹 생성하기
const createGroup = async (groupData) => {
    const { name, password, imageUrl, isPublic, introduction } = groupData;
    const [result] = await db.execute(
        'INSERT INTO `groups` (name, password, imageUrl, isPublic, introduction) VALUES (?, ?, ?, ?, ?)',
        [name, password, imageUrl, isPublic, introduction]
    );
    return result.insertId;
};

// 그룹 id를 활용해 그룹 정보 가져오기
const findGroupById = async (groupId) => {
    const [rows] = await db.execute('SELECT * FROM `groups` WHERE id = ?', [groupId]);
    return rows[0];
};

// 그룹 수정하기
const updateGroup = async (groupId, groupData) => {
    const { name, imageUrl, isPublic, introduction } = groupData;
    await db.execute(
        'UPDATE `groups` SET name = ?, imageUrl = ?, isPublic = ?, introduction = ? WHERE id = ?',
        [name, imageUrl, isPublic, introduction, groupId]
    );
};

// 그룹 삭제하기
const deleteGroup = async (groupId) => {
    await db.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);
};

// 그룹 목록 조회하기
const getGroups = async (filters) => {
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword = '', isPublic } = filters;

    let query = 'SELECT id, name, imageUrl, isPublic, likeCount, postCount, createdAt, introduction FROM `groups` WHERE 1=1';
    const params = [];

    if (keyword) {
        query += ' AND name LIKE ?';
        params.push(`%${keyword}%`);
    }

    if (isPublic !== undefined) {
        query += ' AND isPublic = ?';
        params.push(isPublic ? 1 : 0);
    }

    switch (sortBy) {
        case 'mostPosted':
            query += ' ORDER BY postCount DESC';
            break;
        case 'mostLiked':
            query += ' ORDER BY likeCount DESC';
            break;
        case 'latest':
        default:
            query += ' ORDER BY createdAt DESC';
            break;
    }

    query += ` LIMIT ${parseInt(pageSize, 10)} OFFSET ${parseInt((page - 1) * pageSize, 10)}`;

    // 디버깅을 위한 로그
    console.log('Executing SQL:', query);
    console.log('With params:', params);

    try {
        const [rows] = await db.execute(query, params);
        const [totalCountRows] = await db.execute('SELECT COUNT(*) as count FROM `groups` WHERE 1=1');

        return {
            groups: rows,
            totalItemCount: totalCountRows[0].count,
        };
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// 그룹 공감하기
const incrementLikeCount = async (groupId) => {
    await db.execute('UPDATE `groups` SET likeCount = likeCount + 1 WHERE id = ?', [groupId]);
};

// 그룹 id로 post 찾기
const getPostsByGroupId = async (groupId) => {
    const [rows] = await db.query(
        'SELECT id, nickname, title, imageUrl, tags, location, moment, isPublic, likeCount, commentCount, createdAt FROM posts WHERE groupId = ? ORDER BY createdAt DESC',
        [groupId]
    );
    return rows;
};

const countPostsByGroupId = async (groupId) => {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM `posts` WHERE groupId = ?', [groupId]);
    return rows[0].count;
};

module.exports = {
    countPostsByGroupId,
    getPostsByGroupId,
    incrementLikeCount,
    createGroup,
    findGroupById,
    updateGroup,
    deleteGroup,
    getGroups,
};
