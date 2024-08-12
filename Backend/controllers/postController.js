const postModel = require('../models/postModel');

const createPost = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = req.body;

        if (!nickname || !title || !content || !postPassword) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const postId = await postModel.createPost(groupId, req.body);

        res.status(200).json({
            id: postId,
            groupId: parseInt(groupId, 10),
            nickname,
            title,
            content,
            imageUrl,
            tags,
            location,
            moment,
            isPublic,
            likeCount: 0,
            commentCount: 0,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

module.exports = {
    createPost,
};
