const express = require('express');
const { readDB, writeDB } = require('./db');
const { adminMiddleware } = require('./middleware');
const router = express.Router();

router.get('/', (req, res) => res.json(readDB().categories));

router.post('/', adminMiddleware, (req, res) => {
  const db = readDB();
  const newCat = { id: Date.now(), ...req.body };
  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json(newCat);
});

router.put('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.categories.findIndex(c => c.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  db.categories[idx] = { ...db.categories[idx], ...req.body };
  writeDB(db);
  res.json(db.categories[idx]);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.categories.findIndex(c => c.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  db.categories.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Đã xóa danh mục' });
});

module.exports = router;
