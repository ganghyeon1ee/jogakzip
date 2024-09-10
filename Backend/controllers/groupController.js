const groupModel = require('../models/groupModel');
const { uploadImageToS3 } = require('../utils/imageUtils');  // S3 업로드 함수

const createGroup = async (req, res) => {
    try {
        const { name, password, isPublic, introduction } = req.body;
        let imageUrl = '';

        if (!name || !password || !introduction) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        // 이미지 업로드가 포함된 경우
        if (req.file) {
            try {
                imageUrl = await uploadImageToS3(req.file);  // S3에 이미지 업로드하고 URL 받기
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                return res.status(500).json({ message: "이미지 업로드 오류", error: uploadError.message });
            }
        }

        const groupId = await groupModel.createGroup({
            name,
            password,
            imageUrl, // 이미지 URL 포함
            isPublic,
            introduction
        });

        const group = await groupModel.findGroupById(groupId);

        res.status(201).json({
            id: group.id,
            name: group.name,
            imageUrl: group.imageUrl,
            isPublic: group.isPublic,
            likeCount: group.likeCount,
            badges: [],
            postCount: group.postCount,
            createdAt: group.createdAt,
            introduction: group.introduction
        });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
};

const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, password, isPublic, introduction } = req.body;
        let imageUrl = req.body.imageUrl;

        if (!name || !password || !introduction) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        // 이미지 업데이트가 필요한 경우 처리
        if (req.file) {
            try {
                imageUrl = await uploadImageToS3(req.file);
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                return res.status(500).json({ message: "이미지 업로드 오류", error: uploadError.message });
            }
        }

        await groupModel.updateGroup(groupId, { name, password, imageUrl, isPublic, introduction });
        const group = await groupModel.findGroupById(groupId);
        
        res.status(200).json({
            id: group.id,
            name: group.name,
            imageUrl: group.imageUrl,
            isPublic: group.isPublic,
            likeCount: group.likeCount,
            badges: [],
            postCount: group.postCount,
            createdAt: group.createdAt,
            introduction: group.introduction
        });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

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
            data: groups.map(group => ({
                id: group.id,
                name: group.name,
                imageUrl: group.imageUrl,
                isPublic: group.isPublic,
                likeCount: group.likeCount,
                badgeCount: group.badgeCount, 
                postCount: group.postCount,
                createdAt: group.createdAt,
                introduction: group.introduction
            })),
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

        const group = await groupModel.findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

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

        if (!password) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

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

        const badges = await groupModel.getGroupBadges(groupId);

        res.status(200).json({
            id: group.id,
            name: group.name,
            imageUrl: group.imageUrl,
            isPublic: group.isPublic,
            likeCount: group.likeCount,
            badges: badges.map(badge => badge.name), 
            postCount: group.postCount,
            createdAt: group.createdAt,
            introduction: group.introduction
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
