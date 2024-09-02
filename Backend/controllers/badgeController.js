const groupModel = require('../models/groupModel');
const badgeModel = require('../models/badgeModel');
const postModel = require('../models/postModel'); // postModel을 추가하여 has7DayStreak와 hasMemoryWith10kLikes를 참조할 수 있도록 수정

const checkAndAwardBadges = async (groupId) => {
    const group = await groupModel.findGroupById(groupId);
    
    if (!group) return;

    const badgesToAward = [];

    // 7일 연속 추억 등록
    const has7DayStreak = await postModel.has7DayStreak(groupId);
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
    const hasMemoryWith10kLikes = await postModel.hasMemoryWith10kLikes(groupId);
    if (hasMemoryWith10kLikes) {
        badgesToAward.push('추억 공감 1만 개 이상 받기');
    }

    for (const badgeName of badgesToAward) {
        const badge = await badgeModel.findBadgeByName(badgeName);
        const alreadyAwarded = await badgeModel.hasBadge(groupId, badge.id);

        if (!alreadyAwarded) { // 배지를 이미 받은 경우 중복으로 부여하지 않도록 처리
            await badgeModel.awardBadgeToGroup(groupId, badge.id);
        }
    }
};

module.exports = { checkAndAwardBadges };
