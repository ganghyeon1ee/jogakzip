const db = require('../db/db');

// 배지 이름으로 배지를 찾고 이미지 파일 이름을 반환
const badgeImageMapping = {
    '7일 연속 추억 등록': '7daysmemory.png',
    '추억 수 20개 이상 등록': '20memory.png',
    '그룹 생성 후 1년 달성': '1yeargroup.png',
    '그룹 공감 1만 개 이상 받기': '1klikesgroup.png',
    '추억 공감 1만 개 이상 받기': '1klikesmemory.png'
};

const findBadgeByName = async (badgeName) => {
    const [rows] = await db.query('SELECT * FROM badges WHERE name = ?', [badgeName]);
    if (rows.length > 0) {
        const badge = rows[0];
        badge.image = badgeImageMapping[badgeName]; // 이미지 파일 이름을 배지에 추가
        return badge;
    }
    return null;
};

const awardBadgeToGroup = async (groupId, badgeId) => {
    await db.query('INSERT INTO group_badges (groupId, badgeId) VALUES (?, ?)', [groupId, badgeId]);
};

// 그룹이 이미 해당 배지를 보유하고 있는지 확인하는 함수 추가
const hasBadge = async (groupId, badgeId) => {
    const [rows] = await db.query('SELECT * FROM group_badges WHERE groupId = ? AND badgeId = ?', [groupId, badgeId]);
    return rows.length > 0;
};

module.exports = {
    findBadgeByName,
    awardBadgeToGroup,
    hasBadge
};
