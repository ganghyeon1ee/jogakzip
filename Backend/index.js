const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
