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

    // 현재 그룹이 이미 가지고 있는 배지를 조회합니다.
    const existingBadges = await groupModel.getGroupBadges(groupId);
    const existingBadgeNames = existingBadges.map(badge => badge.name);

    for (const badgeName of badgesToAward) {
        // 이미 그룹이 보유하고 있는 배지는 건너뜁니다.
        if (!existingBadgeNames.includes(badgeName)) {
            const badge = await badgeModel.findBadgeByName(badgeName);
            if (badge && badge.image) {
                await badgeModel.awardBadgeToGroup(groupId, badge.id);
                console.log(`그룹에 '${badgeName}' 배지가 부여되었습니다. 이미지: ${badge.image}`);
            }
        }
    }
};
