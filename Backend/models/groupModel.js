const db = require('../db/db');
const groupModel = require('./groupModel');

// 그룹 생성하기
const createGroup = async (groupData) => {
    try {
        const { name, password, imageUrl, isPublic, introduction } = groupData;
        const [result] = await db.execute(
            'INSERT INTO `groups` (name, password, imageUrl, isPublic, introduction) VALUES (?, ?, ?, ?, ?)',
            [name, password, imageUrl, isPublic, introduction]
        );
        return result.insertId;
    } catch (error) {
        console.error('Database error on createGroup:', error);  // 데이터베이스 오류 로그 추가
        throw error;
    }
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

    let query = `
        SELECT g.id, g.name, g.imageUrl, g.isPublic, g.likeCount, g.postCount, g.createdAt, g.introduction,
               COUNT(b.id) AS badgeCount
        FROM \`groups\` g
        LEFT JOIN group_badges gb ON g.id = gb.groupId
        LEFT JOIN badges b ON gb.badgeId = b.id
        WHERE 1=1`;
    const params = [];

    if (keyword) {
        query += ' AND g.name LIKE ?';
        params.push(`%${keyword}%`);
    }

    if (isPublic !== undefined) {
        query += ' AND g.isPublic = ?';
        params.push(isPublic ? 1 : 0);
    }

    query += ' GROUP BY g.id ';

    switch (sortBy) {
        case 'mostPosted':
            query += 'ORDER BY g.postCount DESC';
            break;
        case 'mostLiked':
            query += 'ORDER BY g.likeCount DESC';
            break;
        case 'mostBadges':
            query += 'ORDER BY badgeCount DESC';
            break;
        case 'latest':
        default:
            query += 'ORDER BY g.createdAt DESC';
            break;
    }

    query += ` LIMIT ${parseInt(pageSize, 10)} OFFSET ${parseInt((page - 1) * pageSize, 10)}`;

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

// 그룹 ID로 그룹 찾기
const findGroupById = async (groupId) => {
    try {
        const [rows] = await db.query('SELECT * FROM `groups` WHERE id = ?', [groupId]); // 백틱으로 groups를 감싸서 SQL 구문 오류 해결
        return rows.length > 0;
    } catch (error) {
        console.error('Error finding group:', error);
        throw new Error('그룹 조회 중 오류가 발생했습니다.');
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

const getGroupBadges = async (groupId) => {
    const [rows] = await db.query(
        `SELECT b.id, b.name, b.description FROM badges b
        INNER JOIN group_badges gb ON b.id = gb.badgeId
        WHERE gb.groupId = ?`,
        [groupId]
    );
    return rows;
};

const incrementPostCount = async (groupId) => {
    await db.execute('UPDATE `groups` SET postCount = postCount + 1 WHERE id = ?', [groupId]);
};

const decrementPostCount = async (groupId) => {
    await db.execute('UPDATE `groups` SET postCount = postCount - 1 WHERE id = ?', [groupId]);
};

// 특정 그룹이 7일 연속 게시글을 등록했는지 확인
const has7DayStreak = async (groupId) => {
    const query = `
        SELECT COUNT(DISTINCT DATE(createdAt)) as streak
        FROM posts
        WHERE groupId = ? AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;
    const [rows] = await db.execute(query, [groupId]);
    return rows[0].streak === 7;
};

// 특정 그룹의 게시글 중 10,000개 이상의 공감을 받은 게시글이 있는지 확인
const hasMemoryWith10kLikes = async (groupId) => {
    const query = `
        SELECT COUNT(*) as count
        FROM posts
        WHERE groupId = ? AND likeCount >= 10000
    `;
    const [rows] = await db.execute(query, [groupId]);
    return rows[0].count > 0;
};

// 그룹 목록 전체 조회
const getAllGroups = async () => {
    const [rows] = await db.query('SELECT id FROM `groups`');
    return rows;
};

module.exports = {
    findGroupById,
    getAllGroups,
    has7DayStreak,
    hasMemoryWith10kLikes,
    decrementPostCount,
    incrementPostCount,
    getGroupBadges,
    countPostsByGroupId,
    getPostsByGroupId,
    incrementLikeCount,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroups,
};
