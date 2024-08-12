const express = require('express');
require('dotenv').config();
const groupRoutes = require('./routes/groups');

const app = express();
app.use(express.json());

app.use('/api', groupRoutes);

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
