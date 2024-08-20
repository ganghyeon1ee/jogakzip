const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const groupRoutes = require('./routes/groups');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', groupRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

module.exports = app;