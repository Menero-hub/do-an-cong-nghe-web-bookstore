const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('./db');
const { JWT_SECRET, authMiddleware } = require('./middleware');
const router = express.Router();

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    const db = readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email đã tồn tại' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: db.nextId.user++, name, email, password: hashed, role: 'user', createdAt: new Date().toISOString().split('T')[0] };
    db.users.push(newUser);
    writeDB(db);
    res.json({ message: 'Đăng ký thành công' });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thông tin người dùng hiện tại
router.get('/me', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  const { password, ...safe } = user;
  res.json(safe);
});

module.exports = router;
