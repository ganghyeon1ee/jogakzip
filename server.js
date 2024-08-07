const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Dummy database
let groups = [];
let nextId = 1;

// Create a new group
app.post('/api/groups', (req, res) => {
    const { name, password, imageUrl, isPublic, introduction } = req.body;

    // Validate request body
    if (!name || !password || !imageUrl || typeof isPublic !== 'boolean' || !introduction) {
        return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const newGroup = {
        id: nextId++,
        name,
        password,
        imageUrl,
        isPublic,
        introduction,
        likeCount: 0,
        badges: [],
        postCount: 0,
        createdAt: new Date().toISOString()
    };

    groups.push(newGroup);

    res.status(201).json(newGroup);
});

// Update a group
app.put('/api/groups/:groupId', (req, res) => {
    const { groupId } = req.params;
    const { name, password, imageUrl, isPublic, introduction } = req.body;

    // Find group by ID
    const group = groups.find(g => g.id === parseInt(groupId));

    if (!group) {
        return res.status(404).json({ message: "존재하지 않습니다" });
    }

    // Check password
    if (group.password !== password) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
    }

    // Validate request body
    if (!name || !password || !imageUrl || typeof isPublic !== 'boolean' || !introduction) {
        return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    // Update group details
    group.name = name;
    group.imageUrl = imageUrl;
    group.isPublic = isPublic;
    group.introduction = introduction;

    res.status(200).json(group);
});

// Delete a group
app.delete('/api/groups/:groupId', (req, res) => {
    const { groupId } = req.params;
    const { password } = req.body;

    // Find group by ID
    const groupIndex = groups.findIndex(g => g.id === parseInt(groupId));

    if (groupIndex === -1) {
        return res.status(404).json({ message: "존재하지 않습니다" });
    }

    const group = groups[groupIndex];

    // Check password
    if (group.password !== password) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
    }

    // Remove group from array
    groups.splice(groupIndex, 1);

    res.status(200).json({ message: "그룹 삭제 성공" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
