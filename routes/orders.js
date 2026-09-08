const express = require('express');
const { readDB, writeDB } = require('./db');
const { authMiddleware, adminMiddleware } = require('./middleware');
const { validateCoupon, computeDiscount } = require('./coupons');
const router = express.Router();

// Lịch sử đơn hàng của user
router.get('/my', authMiddleware, (req, res) => {
  const db = readDB();
  const orders = db.orders.filter(o => o.userId === req.user.id).map(o => ({
    ...o,
    items: o.items.map(item => ({ ...item, book: db.books.find(b => b.id === item.bookId) }))
  }));
  res.json(orders);
});

// Tất cả đơn hàng (admin)
router.get('/', adminMiddleware, (req, res) => {
  const db = readDB();
  const orders = db.orders.map(o => ({
    ...o,
    user: db.users.find(u => u.id === o.userId),
    items: o.items.map(item => ({ ...item, book: db.books.find(b => b.id === item.bookId) }))
  }));
  res.json(orders);
});

// Tạo đơn hàng mới
router.post('/', authMiddleware, (req, res) => {
  const db = readDB();
  const { items, address, phone, couponCode } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'Giỏ hàng trống' });

  let subtotal = 0;
  const orderItems = items.map(item => {
    const book = db.books.find(b => b.id === item.bookId);
    if (!book) throw new Error(`Không tìm thấy sách ${item.bookId}`);
    subtotal += book.price * item.quantity;
    book.stock -= item.quantity;
    book.sold += item.quantity;
    return { bookId: item.bookId, quantity: item.quantity, price: book.price };
  });

  // Áp dụng mã giảm giá (nếu có)
  let discount = 0;
  let appliedCode = '';
  if (couponCode) {
    const { coupon, error } = validateCoupon(db, couponCode, subtotal);
    if (error) return res.status(400).json({ message: error });
    discount = computeDiscount(coupon, subtotal);
    appliedCode = coupon.code;
    coupon.used = (coupon.used || 0) + 1;
  }

  const total = Math.max(0, subtotal - discount);

  const newOrder = {
    id: db.nextId.order++,
    userId: req.user.id,
    items: orderItems,
    subtotal,
    discount,
    couponCode: appliedCode,
    total,
    status: 'processing',
    address,
    phone,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

// Tạo đơn hàng mới bởi Admin (chọn user bất kỳ)
router.post('/admin', adminMiddleware, (req, res) => {
  const db = readDB();
  const { userId, items, address, phone } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'Giỏ hàng trống' });
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ message: 'Không tìm thấy người dùng' });

  let total = 0;
  const orderItems = items.map(item => {
    const book = db.books.find(b => b.id === item.bookId);
    if (!book) throw new Error(`Không tìm thấy sách ${item.bookId}`);
    total += book.price * item.quantity;
    book.stock = Math.max(0, (book.stock || 0) - item.quantity);
    book.sold = (book.sold || 0) + item.quantity;
    return { bookId: item.bookId, quantity: item.quantity, price: book.price };
  });

  const newOrder = {
    id: db.nextId.order++,
    userId,
    items: orderItems,
    total,
    status: 'processing',
    address,
    phone,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});


router.put('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  order.status = req.body.status;
  writeDB(db);
  res.json(order);
});
// API Khách hàng tự hủy đơn (Có lý do bắt buộc)
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.id);
  const { reason } = req.body; // Lấy lý do từ request gửi lên

  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  if (order.userId !== req.user.id) return res.status(403).json({ message: 'Không có quyền hủy đơn này' });
  if (order.status !== 'processing') return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
  
  // Bắt buộc phải có lý do
  if (!reason || reason.trim() === '') return res.status(400).json({ message: 'Vui lòng cung cấp lý do hủy đơn' });

  // Hoàn lại kho
  order.items.forEach(item => {
    const book = db.books.find(b => b.id === item.bookId);
    if (book) {
      book.stock += item.quantity;
      book.sold = Math.max(0, (book.sold || 0) - item.quantity);
    }
  });

  order.status = 'cancelled';
  order.cancelReason = reason.trim(); // Lưu lý do vào database
  writeDB(db);
  
  res.json({ message: 'Đã hủy đơn hàng', order });
});
module.exports = router;
