const groupModel = require('../models/groupModel');
const badgeModel = require('../models/badgeModel');

const checkAndAwardBadges = async (groupId) => {
    const group = await groupModel.findGroupById(groupId);
    
    if (!group) return;

    const badgesToAward = [];

    // 7일 연속 추억 등록
    const has7DayStreak = await groupModel.has7DayStreak(groupId);
    if (has7DayStreak) {
        badgesToAward.push('7일 연속 추억 등록');
    }

    // 추억 수 20개 이상 등록
    if (group.postCount >= 20) {
        badgesToAward.push('추억 수 20개 이상 등록');
    }

    // 그룹 생성 후 1년 달성
    const oneYearSinceCreation = new Date() - new Date(group.createdAt) >= 365 * 24 * 60 * 60 * 1000;
    if (oneYearSinceCreation) {
        badgesToAward.push('그룹 생성 후 1년 달성');
    }

    // 그룹 공감 1만 개 이상 받기
    if (group.likeCount >= 10000) {
        badgesToAward.push('그룹 공감 1만 개 이상 받기');
    }

    // 추억 공감 1만 개 이상 받기
    const hasMemoryWith10kLikes = await groupModel.hasMemoryWith10kLikes(groupId);
    if (hasMemoryWith10kLikes) {
        badgesToAward.push('추억 공감 1만 개 이상 받기');
    }

    for (const badgeName of badgesToAward) {
        const badge = await badgeModel.findBadgeByName(badgeName);
        await badgeModel.awardBadgeToGroup(groupId, badge.id);
    }
};

module.exports = { checkAndAwardBadges };
