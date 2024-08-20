const db = require('../db/db');

const findBadgeByName = async (badgeName) => {
    const [rows] = await db.query('SELECT * FROM badges WHERE name = ?', [badgeName]);
    return rows[0];
};

const awardBadgeToGroup = async (groupId, badgeId) => {
    await db.query('INSERT INTO group_badges (groupId, badgeId) VALUES (?, ?)', [groupId, badgeId]);
};

module.exports = {
    findBadgeByName,
    awardBadgeToGroup,
};
