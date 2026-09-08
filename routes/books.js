const express = require('express');
const { readDB, writeDB } = require('./db');
const { adminMiddleware } = require('./middleware');
const router = express.Router();

// Lấy danh sách sách
router.get('/', (req, res) => {
  const db = readDB();
  let books = db.books;
  const { category, search, featured, sort } = req.query;
  if (category) books = books.filter(b => b.categoryId == category);
  if (featured) books = books.filter(b => b.featured);
  if (search) books = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'price_asc') books.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') books.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') books.sort((a, b) => b.rating - a.rating);
  else if (sort === 'sold') books.sort((a, b) => b.sold - a.sold);
  res.json(books);
});

// Lấy chi tiết sách
router.get('/:id', (req, res) => {
  const db = readDB();
  const book = db.books.find(b => b.id == req.params.id);
  if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
  const category = db.categories.find(c => c.id === book.categoryId);
  res.json({ ...book, category });
});

// Thêm sách (admin)
router.post('/', adminMiddleware, (req, res) => {
  const db = readDB();
  const newBook = { id: Date.now(), ...req.body, sold: 0, rating: 5.0 };
  db.books.push(newBook);
  writeDB(db);
  res.status(201).json(newBook);
});

// Cập nhật sách (admin)
router.put('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.books.findIndex(b => b.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy sách' });
  db.books[idx] = { ...db.books[idx], ...req.body };
  writeDB(db);
  res.json(db.books[idx]);
});

// Xóa sách (admin)
router.delete('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = db.books.findIndex(b => b.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy sách' });
  db.books.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Đã xóa sách' });
});

module.exports = router;
