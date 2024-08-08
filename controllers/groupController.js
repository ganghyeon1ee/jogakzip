const groupModel = require('../models/groupModel');

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

module.exports = {
    createGroup,
    updateGroup,
    deleteGroup
};
