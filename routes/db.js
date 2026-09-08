const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../data/db.json');

// Biến lưu cache trên RAM
let memoryCache = null;

// Khởi tạo thư mục data nếu chưa có
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

function readDB() {
  try {
    // Nếu cache rỗng, mới phải đọc từ ổ cứng
    if (!memoryCache) {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        memoryCache = JSON.parse(data);
      } else {
        memoryCache = { users: [], categories: [], books: [], orders: [], coupons: [], chats: [], nextId: { user: 1, order: 1, coupon: 1 } };
      }
    }
    return memoryCache;
  } catch (error) {
    console.error("Lỗi khi đọc Database:", error);
    return { users: [], categories: [], books: [], orders: [], coupons: [], chats: [], nextId: { user: 1, order: 1, coupon: 1 } };
  }
}

function writeDB(data) {
  try {
    memoryCache = data; // Cập nhật ngay vào RAM
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); // Ghi đồng bộ xuống file
  } catch (error) {
    console.error("Lỗi khi ghi Database:", error);
  }
}

module.exports = { readDB, writeDB };