const express = require('express');
const cors = require('cors');
require('dotenv').config();

const groupRoutes = require('./routes/groups');
const postRoutes = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', groupRoutes);
app.use('/api', postRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
