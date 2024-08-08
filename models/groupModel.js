const db = require('../db/db');

const createGroup = async (groupData) => {
    const { name, password, imageUrl, isPublic, introduction } = groupData;
    const [result] = await db.execute(
        'INSERT INTO groups (name, password, imageUrl, isPublic, introduction) VALUES (?, ?, ?, ?, ?)',
        [name, password, imageUrl, isPublic, introduction]
    );
    return result.insertId;
};

const findGroupById = async (groupId) => {
    const [rows] = await db.execute('SELECT * FROM groups WHERE id = ?', [groupId]);
    return rows[0];
};

const updateGroup = async (groupId, groupData) => {
    const { name, imageUrl, isPublic, introduction } = groupData;
    await db.execute(
        'UPDATE groups SET name = ?, imageUrl = ?, isPublic = ?, introduction = ? WHERE id = ?',
        [name, imageUrl, isPublic, introduction, groupId]
    );
};

const deleteGroup = async (groupId) => {
    await db.execute('DELETE FROM groups WHERE id = ?', [groupId]);
};

module.exports = {
    createGroup,
    findGroupById,
    updateGroup,
    deleteGroup
};
