const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const cron = require('node-cron');
const { checkBadgesForAllGroups } = require('./services/badgeService');

const commentRoutes = require('./routes/comments');
const groupRoutes = require('./routes/groups');
const postRoutes = require('./routes/posts');
const imageRoutes = require('./routes/images');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', groupRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', imageRoutes);

cron.schedule('0 0 * * *', async () => {
    console.log('배지 확인 및 부여 작업 시작');
    try {
        await checkBadgesForAllGroups();
        console.log('배지 확인 및 부여 작업 완료');
    } catch (error) {
        console.error('배지 작업 중 에러 발생:', error);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});