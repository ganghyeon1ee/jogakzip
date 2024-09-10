const { uploadImageToS3 } = require('./imageController');
const postModel = require('../models/postModel');
const { checkAndAwardBadges } = require('../services/badgeService');
const groupModel = require('../models/groupModel');

const createPost = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { nickname, title, content, postPassword, tags, location, moment, isPublic } = req.body;

        if (!groupId || !nickname || !title || !content || !postPassword) {
            return res.status(400).json({ message: "모든 필수 필드를 입력해 주세요." });
        }

        const groupExists = await groupModel.findGroupById(groupId);
        if (!groupExists) {
            return res.status(400).json({ message: "유효하지 않은 그룹 ID입니다." });
        }

        const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const imageUrl = req.file ? await uploadImageToS3(req.file) : null;

        const postId = await postModel.createPost(groupId, {
            nickname,
            title,
            content,
            postPassword,
            imageUrl,
            tags: JSON.stringify(parsedTags),
            location,
            moment,
            isPublic: parseInt(isPublic, 10) === 1
        });

        await checkAndAwardBadges(groupId);

        res.status(200).json({
            id: postId,
            groupId: parseInt(groupId, 10),
            nickname,
            title,
            content,
            imageUrl,
            tags: parsedTags,
            location,
            moment,
            isPublic: parseInt(isPublic, 10) === 1,
            likeCount: 0,
            commentCount: 0,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { nickname, title, content, postPassword, tags, location, moment, isPublic } = req.body;

        // 기존 게시글 확인
        const existingPost = await postModel.findPostById(postId);
        if (!existingPost) {
            return res.status(404).json({ message: "존재하지 않는 게시글입니다." });
        }

        // 비밀번호 확인
        if (existingPost.postPassword !== postPassword) {
            return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        // 이미지 처리: req.file이 존재하는 경우 S3에 업로드, 없으면 기존 이미지 사용
        let imageUrl = existingPost.imageUrl;  // 기존 이미지 URL 사용
        if (req.file) {
            imageUrl = await uploadImageToS3(req.file);  // S3에 업로드 후 URL 반환
        }

        // 태그 처리
        const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

        // 게시글 업데이트
        await postModel.updatePost(postId, {
            nickname,
            title,
            content,
            postPassword,
            imageUrl,  // 이미지 URL 처리
            tags: JSON.stringify(parsedTags),
            location,
            moment,
            isPublic: parseInt(isPublic, 10) === 1
        });

        const updatedPost = await postModel.findPostById(postId);
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 게시글 삭제
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { postPassword } = req.body;

        if (!postPassword) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const existingPost = await postModel.findPostById(postId);

        if (!existingPost) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        if (existingPost.postPassword !== postPassword) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        await postModel.deletePost(postId);

        res.status(200).json({ message: "게시글 삭제 성공" });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 게시글 목록 조회
const getPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, pageSize = 10, sortBy = 'latest', keyword = '', isPublic = 1 } = req.query;

        // 유효성 검사
        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const validSortByOptions = ['latest', 'mostLiked', 'mostCommented'];
        if (!validSortByOptions.includes(sortBy)) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        if (![0, 1].includes(parseInt(isPublic, 10))) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const postsData = await postModel.getPosts(groupId, {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            sortBy,
            keyword,
            isPublic: isPublic == 1 
        });

        res.status(200).json(postsData);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};



// 게시글 상세 정보 조회
const getPostDetails = async (req, res) => {
    try {
        const { postId } = req.params;

        if (isNaN(postId) || parseInt(postId, 10) <= 0) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        const post = await postModel.getPostById(postId);

        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};


// 게시글 조회 권한 확인
const verifyPostPassword = async (req, res) => {
    try {
        const { postId } = req.params;
        const { password } = req.body;

        const post = await postModel.findPostById(postId);

        if (!post) {
            return res.status(404).json({ message: '존재하지 않습니다' });
        }

        console.log('입력된 비밀번호:', password);
        console.log('저장된 비밀번호:', post.postPassword);

        if (post.postPassword === password) {
            return res.status(200).json({ message: '비밀번호가 확인되었습니다' });
        } else {
            return res.status(401).json({ message: '비밀번호가 틀렸습니다' });
        }
    } catch (error) {
        console.error('Error verifying post password:', error);
        return res.status(500).json({ message: '서버 오류' });
    }
};

// 게시글 공감하기
const likePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await postModel.getPostById(postId);

        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        await postModel.incrementLikeCount(postId);

        res.status(200).json({ message: "게시글 공감하기 성공" });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

// 게시글 공개 여부 확인
const checkPostIsPublic = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await postModel.getPostById(postId);

        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        res.status(200).json({ id: post.id, isPublic: post.isPublic });
    } catch (error) {
        console.error('Error checking post visibility:', error);
        res.status(500).json({ message: "서버 오류" });
    }
};

module.exports = {
    checkPostIsPublic,
    likePost,
    verifyPostPassword,
    getPostDetails,
    createPost,
    updatePost,
    deletePost,
    getPosts,
};