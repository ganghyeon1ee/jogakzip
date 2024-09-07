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
const imageRoutes = require('./routes/images');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우트 설정
app.use('/api', groupRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', imageRoutes);

// 크론 작업 설정 - 5초마다 작업 수행
cron.schedule('*/5 * * * * *', async () => {
    console.log('배지 확인 및 부여 작업 시작');
    try {
        await checkBadgesForAllGroups();
        console.log('배지 확인 및 부여 작업 완료');
    } catch (error) {
        console.error('배지 작업 중 에러 발생:', error);
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
