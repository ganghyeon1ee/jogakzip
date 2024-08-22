const groupModel = require('../models/groupModel');
const postModel = require('../models/postModel');

const createGroup = async (req, res) => {
    try {
        const { name, password, imageUrl, isPublic, introduction } = req.body;
        if (!name || !password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }
        const groupId = await groupModel.createGroup(req.body);
        const group = await groupModel.findGroupById(groupId);
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: "서버 오류" });
    }
};

const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, password, imageUrl, isPublic, introduction } = req.body;

        const group = await groupModel.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        if (group.password !== password) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await groupModel.updateGroup(groupId, req.body);
        const updatedGroup = await groupModel.findGroupById(groupId);
        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: "서버 오류" });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { password } = req.body;

        const group = await groupModel.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        if (group.password !== password) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await groupModel.deleteGroup(groupId);
        res.status(200).json({ message: "그룹 삭제 성공" });
    } catch (error) {
        res.status(500).json({ message: "서버 오류" });
    }
};

const getGroups = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, sortBy = 'latest', keyword = '', isPublic } = req.query;

        const filters = {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            sortBy,
            keyword,
            isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
        };

        const { groups, totalItemCount } = await groupModel.getGroups(filters);

        const totalPages = Math.ceil(totalItemCount / filters.pageSize);

        res.status(200).json({
            currentPage: filters.page,
            totalPages,
            totalItemCount,
            data: groups,
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

const checkGroupIsPublic = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await groupModel.findGroupById(groupId);

        if (!group) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

        res.status(200).json({
            id: group.id,
            isPublic: group.isPublic,
        });
    } catch (error) {
        console.error('Error checking group public status:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

const likeGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        // 그룹이 존재하는지 확인
        const group = await groupModel.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

        // 그룹의 공감 수 증가
        await groupModel.incrementLikeCount(groupId);

        res.status(200).json({ message: '그룹 공감하기 성공' });
    } catch (error) {
        console.error('Error liking group:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

const verifyPassword = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { password } = req.body;

        const group = await groupModel.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

        if (group.password !== password) {
            return res.status(401).json({ message: '비밀번호가 틀렸습니다' });
        }

        res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await groupModel.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

        // 그룹의 배지 목록 가져오기
        const badges = await groupModel.getGroupBadges(groupId);

        // 생성 후 지난 일수 (디데이) 계산
        const createdAt = new Date(group.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today - createdAt);
        const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // postCount 계산
        const postCount = await postModel.countPostsByGroupId(groupId);

        res.status(200).json({
            id: group.id,
            name: group.name,
            imageUrl: group.imageUrl,
            isPublic: group.isPublic,
            likeCount: group.likeCount,
            badges: badges, // 배지 목록 포함
            postCount: postCount,
            createdAt: group.createdAt,
            introduction: group.introduction,
            dDay: dDay,
        });
    } catch (error) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ message: '서버 오류' });
    }
};

module.exports = {
    verifyPassword,
    getGroupDetails,
    likeGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroups,
    checkGroupIsPublic,
};