const express = require('express');
const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('./db');
const { adminMiddleware } = require('./middleware');
const router = express.Router();

// Thêm tài khoản mới (admin)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    const db = readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email đã tồn tại' });
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: db.nextId.user++, name, email, password: hashed, role: role || 'user', createdAt: new Date().toISOString().split('T')[0] };
    db.users.push(newUser);
    writeDB(db);
    const { password: _, ...safe } = newUser;
    res.status(201).json(safe);
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/', adminMiddleware, (req, res) => {
  const db = readDB();
  res.json(db.users.map(({ password, ...u }) => u));
});

router.put('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  writeDB(db);
  const { password, ...safe } = db.users[idx];
  res.json(safe);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex(u => u.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  db.users.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Đã xóa tài khoản' });
});

module.exports = router;
