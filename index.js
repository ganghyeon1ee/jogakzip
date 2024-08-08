const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

// MySQL 데이터베이스 연결 풀 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// 그룹 등록
app.post('/api/groups', async (req, res) => {
  const { name, password, imageUrl, isPublic, introduction } = req.body;

  if (!name || !password || !imageUrl || isPublic === undefined || !introduction) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO `groups` (name, password, imageUrl, isPublic, introduction) VALUES (?, ?, ?, ?, ?)',
      [name, password, imageUrl, isPublic, introduction]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      imageUrl,
      isPublic,
      likeCount: 0,
      badges: [],
      postCount: 0,
      createdAt: new Date().toISOString(),
      introduction,
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 그룹 수정
app.put('/api/groups/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { name, password, imageUrl, isPublic, introduction } = req.body;

  if (!name || !password || !imageUrl || isPublic === undefined || !introduction) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM `groups` WHERE id = ?', [groupId]);
    const group = rows[0];

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    if (group.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    await pool.query(
      'UPDATE `groups` SET name = ?, imageUrl = ?, isPublic = ?, introduction = ? WHERE id = ?',
      [name, imageUrl, isPublic, introduction, groupId]
    );

    const [updatedRows] = await pool.query('SELECT * FROM `groups` WHERE id = ?', [groupId]);
    const updatedGroup = updatedRows[0];

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 그룹 삭제
app.delete('/api/groups/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM `groups` WHERE id = ?', [groupId]);
    const group = rows[0];

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    if (group.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    await pool.query('DELETE FROM `groups` WHERE id = ?', [groupId]);
    res.status(200).json({ message: '그룹 삭제 성공' });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 애플리케이션 서버 시작
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
