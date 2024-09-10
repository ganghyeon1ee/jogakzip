const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const cron = require('node-cron');
const { checkBadgesForAllGroups } = require('./services/badgeService');

// 라우트 파일 임포트
const groupRoutes = require('./routes/groups');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const imageRoutes = require('./routes/images'); // 이미지 업로드 라우트

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api', groupRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', imageRoutes); // 이미지 업로드 라우트

// 크론 작업 설정 - 5초마다 작업 수행
cron.schedule('*/5 * * * * *', async () => {
    try {
        await checkBadgesForAllGroups();
    } catch (error) {
        console.error(error);
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});