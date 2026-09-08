const express = require('express');
const { readDB, writeDB } = require('./db');
const { authMiddleware, adminMiddleware } = require('./middleware');
const router = express.Router();

function getOrCreateChat(db, userId, userName) {
  if (!db.chats) db.chats = [];
  let chat = db.chats.find(c => c.userId === userId);
  if (!chat) {
    chat = {
      userId,
      userName: userName || 'Khách hàng',
      messages: [],
      updatedAt: new Date().toISOString(),
      unreadByAdmin: 0,
      unreadByUser: 0,
    };
    db.chats.push(chat);
  }
  return chat;
}

// ===== KHÁCH HÀNG =====

// Lấy hội thoại của tôi (tạo mới nếu chưa có)
router.get('/my', authMiddleware, (req, res) => {
  const db = readDB();
  const chat = getOrCreateChat(db, req.user.id, req.user.name);
  chat.unreadByUser = 0; // user vừa đọc
  writeDB(db);
  res.json(chat);
});

// Khách hàng gửi tin nhắn
router.post('/my', authMiddleware, (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Nội dung trống' });
  const db = readDB();
  const chat = getOrCreateChat(db, req.user.id, req.user.name);
  chat.messages.push({ from: 'user', text, at: new Date().toISOString() });
  chat.updatedAt = new Date().toISOString();
  chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;
  chat.unreadByUser = 0;
  writeDB(db);
  res.status(201).json(chat);
});

// ===== ADMIN =====

// Danh sách tất cả hội thoại (mới nhất lên đầu)
router.get('/', adminMiddleware, (req, res) => {
  const db = readDB();
  const list = (db.chats || [])
    .map(c => {
      const last = c.messages[c.messages.length - 1];
      return {
        userId: c.userId,
        userName: c.userName,
        lastMessage: last ? last.text : '',
        lastFrom: last ? last.from : '',
        updatedAt: c.updatedAt,
        unreadByAdmin: c.unreadByAdmin || 0,
        count: c.messages.length,
      };
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(list);
});

// Tổng số tin chưa đọc (cho badge admin)
router.get('/unread-count', adminMiddleware, (req, res) => {
  const db = readDB();
  const total = (db.chats || []).reduce((s, c) => s + (c.unreadByAdmin || 0), 0);
  res.json({ total });
});

// Lấy 1 hội thoại theo userId (admin đọc -> reset unread)
router.get('/:userId', adminMiddleware, (req, res) => {
  const db = readDB();
  const chat = (db.chats || []).find(c => c.userId == req.params.userId);
  if (!chat) return res.status(404).json({ message: 'Không tìm thấy hội thoại' });
  chat.unreadByAdmin = 0;
  writeDB(db);
  res.json(chat);
});

// Admin trả lời 1 khách hàng
router.post('/:userId', adminMiddleware, (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Nội dung trống' });
  const db = readDB();
  const user = db.users.find(u => u.id == req.params.userId);
  const chat = getOrCreateChat(db, Number(req.params.userId), user ? user.name : 'Khách hàng');
  chat.messages.push({ from: 'admin', text, at: new Date().toISOString() });
  chat.updatedAt = new Date().toISOString();
  chat.unreadByUser = (chat.unreadByUser || 0) + 1;
  chat.unreadByAdmin = 0;
  writeDB(db);
  res.status(201).json(chat);
});

module.exports = router;
