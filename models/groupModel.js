const db = require('../db/db');

const createGroup = async (groupData) => {
    const { name, password, imageUrl, isPublic, introduction } = groupData;
    const [result] = await db.execute(
        'INSERT INTO `groups` (name, password, imageUrl, isPublic, introduction) VALUES (?, ?, ?, ?, ?)',
        [name, password, imageUrl, isPublic, introduction]
    );
    return result.insertId;
};

const findGroupById = async (groupId) => {
    const [rows] = await db.execute('SELECT * FROM `groups` WHERE id = ?', [groupId]);
    return rows[0];
};

const updateGroup = async (groupId, groupData) => {
    const { name, imageUrl, isPublic, introduction } = groupData;
    await db.execute(
        'UPDATE `groups` SET name = ?, imageUrl = ?, isPublic = ?, introduction = ? WHERE id = ?',
        [name, imageUrl, isPublic, introduction, groupId]
    );
};

const deleteGroup = async (groupId) => {
    await db.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);
};

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

    // 디버깅을 위한 로그 추가
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




module.exports = {
    createGroup,
    findGroupById,
    updateGroup,
    deleteGroup,
    getGroups,
};
