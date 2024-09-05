const db = require('../db/db');
const groupModel = require('./groupModel');

// 게시글 등록
const createPost = async (groupId, postData) => {
    try {
        const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = postData;
        const [result] = await db.execute(
            'INSERT INTO posts (groupId, nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [groupId, nickname, title, content, postPassword, imageUrl, JSON.stringify(tags), location, moment, isPublic]
        );

        await groupModel.incrementPostCount(groupId);
        return result.insertId;
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('게시글 생성 중 오류가 발생했습니다.');
    }
};

// 게시글 찾기
const findPostById = async (postId) => {
    const [rows] = await db.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    return rows[0];
};

// 게시글 수정
const updatePost = async (postId, postData) => {
    const { nickname, title, content, imageUrl, tags, location, moment, isPublic } = postData;
    await db.execute(
        'UPDATE posts SET nickname = ?, title = ?, content = ?, imageUrl = ?, tags = ?, location = ?, moment = ?, isPublic = ? WHERE id = ?',
        [nickname, title, content, imageUrl, JSON.stringify(tags), location, moment, isPublic, postId]
    );
};

// 게시글 삭제
const deletePost = async (postId) => {
    try {
        const post = await findPostById(postId);
        if (!post) {
            throw new Error('게시글이 존재하지 않습니다.');
        }

        // 게시글 삭제
        await db.execute('DELETE FROM posts WHERE id = ?', [postId]);

        // 그룹의 postCount 감소
        await groupModel.decrementPostCount(post.groupId);
    } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('게시글 삭제 중 오류가 발생했습니다.');
    }
};

// 게시글 목록 조회
const getPosts = async (groupId, { page, pageSize, sortBy, keyword, isPublic }) => {
    const limit = pageSize;
    const offset = (page - 1) * limit;

    let query = `
        SELECT id, nickname, title, imageUrl, tags, location, moment, isPublic, likeCount, commentCount, createdAt
        FROM posts
        WHERE groupId = ?`;
    
    const queryParams = [groupId];

    if (isPublic !== undefined) {
        query += ` AND isPublic = ?`;
        queryParams.push(isPublic);
    }

    if (keyword) {
        const searchPattern = `%${keyword}%`;
        query += ` AND (title LIKE ? OR JSON_CONTAINS(tags, ?))`;
        queryParams.push(searchPattern, JSON.stringify([keyword]));
    }

    switch (sortBy) {
        case 'mostCommented':
            query += ' ORDER BY commentCount DESC';
            break;
        case 'mostLiked':
            query += ' ORDER BY likeCount DESC';
            break;
        case 'latest':
        default:
            query += ' ORDER BY createdAt DESC';
            break;
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [posts] = await db.query(query, queryParams);

    const [totalCountResult] = await db.query(`
        SELECT COUNT(*) as count
        FROM posts
        WHERE groupId = ?
        ${isPublic !== undefined ? ' AND isPublic = ?' : ''}
        ${keyword ? ' AND (title LIKE ? OR JSON_CONTAINS(tags, ?))' : ''}`,
        isPublic !== undefined ? [groupId, isPublic, ...queryParams.slice(2, queryParams.length - 2)] : [groupId, ...queryParams.slice(1, queryParams.length - 2)]
    );
    
    const totalItemCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalItemCount / limit);

    return {
        currentPage: page,
        totalPages: totalPages,
        totalItemCount: totalItemCount,
        data: posts,
    };
};

// 게시글 상세 정보 조회
const getPostById = async (postId) => {
    const [rows] = await db.query(
        'SELECT id, groupId, nickname, title, content, imageUrl, tags, location, moment, isPublic, likeCount, commentCount, createdAt FROM posts WHERE id = ?',
        [postId]
    );
    return rows[0];
};

// 게시글 공감하기
const incrementLikeCount = async (postId) => {
    await db.query('UPDATE posts SET likeCount = likeCount + 1 WHERE id = ?', [postId]);
};

const getPostsByGroupId = async (groupId) => {
    const [rows] = await db.execute(
        'SELECT id, nickname, title, content, imageUrl, tags, location, moment, isPublic, likeCount, commentCount, createdAt FROM posts WHERE groupId = ?',
        [groupId]
    );
    return rows;
};

// 그룹 id로 post 찾기
const countPostsByGroupId = async (groupId) => {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM `posts` WHERE groupId = ?', [groupId]);
    return rows[0].count;
};

// 게시글 댓글 수 증가
const incrementCommentCount = async (postId) => {
    await db.query('UPDATE posts SET commentCount = commentCount + 1 WHERE id = ?', [postId]);
};

// 게시글 댓글 수 감소
const decrementCommentCount = async (postId) => {
    await db.query('UPDATE posts SET commentCount = commentCount - 1 WHERE id = ?', [postId]);
};

module.exports = {
    incrementCommentCount,
    decrementCommentCount,
    countPostsByGroupId,
    getPostsByGroupId,
    incrementLikeCount,
    getPostById,
    createPost,
    findPostById,
    updatePost,
    deletePost,
    getPosts,
};
