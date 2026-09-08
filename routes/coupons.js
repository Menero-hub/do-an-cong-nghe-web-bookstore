const express = require('express');
const { readDB, writeDB } = require('./db');
const { adminMiddleware } = require('./middleware');
const router = express.Router();

// Tính số tiền được giảm dựa trên 1 mã & tạm tính
function computeDiscount(coupon, subtotal) {
  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round(subtotal * (coupon.value / 100));
    if (coupon.maxDiscount && coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  return Math.max(0, Math.min(discount, subtotal));
}

// Kiểm tra hợp lệ của mã, trả về { coupon, error }
function validateCoupon(db, code, subtotal) {
  const coupon = (db.coupons || []).find(c => c.code.toUpperCase() === String(code || '').trim().toUpperCase());
  if (!coupon) return { error: 'Mã giảm giá không tồn tại' };
  if (!coupon.active) return { error: 'Mã giảm giá đã ngừng áp dụng' };
  if (coupon.expiry && new Date(coupon.expiry) < new Date(new Date().toISOString().split('T')[0])) {
    return { error: 'Mã giảm giá đã hết hạn' };
  }
  if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) {
    return { error: 'Mã giảm giá đã hết lượt sử dụng' };
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return { error: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ để dùng mã này` };
  }
  return { coupon };
}

// Danh sách mã đang hoạt động (công khai cho trang Khuyến mãi)
router.get('/public', (req, res) => {
  const db = readDB();
  const today = new Date(new Date().toISOString().split('T')[0]);
  const list = (db.coupons || [])
    .filter(c => c.active && (!c.expiry || new Date(c.expiry) >= today) && (!c.usageLimit || c.used < c.usageLimit))
    .map(({ used, usageLimit, ...c }) => c);
  res.json(list);
});

// Áp dụng / kiểm tra mã (public, dùng ở trang thanh toán)
router.post('/apply', (req, res) => {
  const db = readDB();
  const { code, subtotal } = req.body;
  const sub = Number(subtotal) || 0;
  const { coupon, error } = validateCoupon(db, code, sub);
  if (error) return res.status(400).json({ message: error });
  const discount = computeDiscount(coupon, sub);
  res.json({
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    discount,
  });
});

// ===== ADMIN =====
router.get('/', adminMiddleware, (req, res) => {
  res.json(readDB().coupons || []);
});

router.post('/', adminMiddleware, (req, res) => {
  const db = readDB();
  if (!db.coupons) db.coupons = [];
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
  if (db.coupons.find(c => c.code.toUpperCase() === code)) {
    return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
  }
  if (!db.nextId.coupon) db.nextId.coupon = 1;
  const newCoupon = {
    id: db.nextId.coupon++,
    code,
    type: req.body.type === 'fixed' ? 'fixed' : 'percent',
    value: Number(req.body.value) || 0,
    minOrder: Number(req.body.minOrder) || 0,
    maxDiscount: Number(req.body.maxDiscount) || 0,
    usageLimit: Number(req.body.usageLimit) || 0,
    used: 0,
    active: req.body.active !== false,
    expiry: req.body.expiry || '',
    description: req.body.description || '',
  };
  db.coupons.push(newCoupon);
  writeDB(db);
  res.status(201).json(newCoupon);
});

router.put('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = (db.coupons || []).findIndex(c => c.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
  const data = { ...req.body };
  if (data.code) data.code = String(data.code).trim().toUpperCase();
  if (data.type) data.type = data.type === 'fixed' ? 'fixed' : 'percent';
  ['value', 'minOrder', 'maxDiscount', 'usageLimit'].forEach(k => {
    if (data[k] !== undefined) data[k] = Number(data[k]) || 0;
  });
  db.coupons[idx] = { ...db.coupons[idx], ...data };
  writeDB(db);
  res.json(db.coupons[idx]);
});

router.delete('/:id', adminMiddleware, (req, res) => {
  const db = readDB();
  const idx = (db.coupons || []).findIndex(c => c.id == req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
  db.coupons.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Đã xóa mã giảm giá' });
});

module.exports = router;
module.exports.validateCoupon = validateCoupon;
module.exports.computeDiscount = computeDiscount;
