const postModel = require('../models/postModel');

// 게시글 등록
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

// 게시글 수정
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = req.body;

        if (!nickname || !title || !content || !postPassword) {
            return res.status(400).json({ message: "잘못된 요청입니다" });
        }

        // 기존 게시글 조회
        const existingPost = await postModel.findPostById(postId);

        if (!existingPost) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        // 비밀번호 확인
        if (existingPost.postPassword !== postPassword) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        // 게시글 수정
        await postModel.updatePost(postId, req.body);

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

        // 기존 게시글 조회
        const existingPost = await postModel.findPostById(postId);

        if (!existingPost) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        // 비밀번호 확인
        if (existingPost.postPassword !== postPassword) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        // 게시글 삭제
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

        // 실제 데이터 가져오기
        const postsData = await postModel.getPosts(groupId, {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            sortBy,
            keyword,
            isPublic: isPublic == 1 // boolean 변환
        });

        // 응답 생성
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

module.exports = {
    likePost,
    verifyPostPassword,
    getPostDetails,
    createPost,
    updatePost,
    deletePost,
    getPosts,
};
