<div align="center">
  <h1>📚 D2TP BOOK</h1>
  <p><b>Hệ thống Website Bán Sách Trực Tuyến - Đồ án môn Công nghệ Web</b></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
</div>

---

## 🌟 Giới thiệu đồ án

**D2TP BOOK** là một nền tảng thương mại điện tử chuyên cung cấp các đầu sách đa dạng. Hệ thống được xây dựng hoàn toàn "từ đầu" (from scratch) ở cả phía giao diện (Frontend) và máy chủ (Backend), không sử dụng các framework UI có sẵn, nhằm tối ưu hóa hiệu năng và thể hiện sự nắm vững kiến thức lập trình cốt lõi.

> 🎓 **Thông tin đồ án:**
> * **Sinh viên thực hiện:** Nguyễn Tiến Đạt (MSSV: A50470)
> * **Đơn vị:** Đại học Thăng Long
> * **Học phần:** Công nghệ Web

---

## ✨ Chức năng chi tiết (Features)

Hệ thống được chia làm 2 phân hệ rõ ràng với đầy đủ các nghiệp vụ thực tế:

### 👤 1. Phân hệ Khách hàng (Client)
* 🔐 **Xác thực:** Đăng ký và Đăng nhập bảo mật (mã hóa mật khẩu Bcrypt, xác thực JWT).
* 📖 **Sản phẩm:** Xem danh sách sách, lọc theo danh mục, tìm kiếm theo tên/tác giả, và sắp xếp (giá, lượt bán).
* 🔍 **Chi tiết:** Hiển thị thông tin chi tiết của sách (tác giả, nhà xuất bản, đánh giá, số lượng tồn kho).
* 🛒 **Giỏ hàng:** Thêm/bớt số lượng sách, lưu trữ trạng thái giỏ hàng ngay cả khi tải lại trang (LocalStorage).
* 💳 **Thanh toán:** Nhập thông tin giao hàng và xác nhận đặt hàng (Thanh toán khi nhận hàng - COD).
* 📦 **Cá nhân:** Xem lịch sử mua hàng cá nhân và theo dõi trạng thái đơn hàng trực tiếp.

### ⚙️ 2. Phân hệ Quản trị viên (Admin)
* 📊 **Dashboard:** Thống kê tổng quan số lượng Sách, Đơn hàng, Người dùng và Tổng doanh thu.
* 📚 **Quản lý Sách & Danh mục:** Đầy đủ thao tác Thêm mới, Chỉnh sửa, và Xóa sản phẩm/danh mục (CRUD).
* 📝 **Quản lý Đơn hàng:** Xem chi tiết thông tin khách đặt mua và cập nhật trạng thái đơn (Đang xử lý ➔ Đang giao ➔ Đã giao ➔ Đã hủy).
* 👥 **Quản lý Người dùng:** Giám sát danh sách tài khoản và phân quyền hệ thống.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

* **Giao diện (Frontend):** HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript. Không sử dụng thư viện ngoài để làm chủ DOM và tối ưu hóa UI/UX.
* **Máy chủ (Backend):** Node.js kết hợp framework Express.js.
* **Cơ sở dữ liệu:** File-based Database (`db.json`) kết hợp kỹ thuật **In-memory Caching** giúp truy xuất dữ liệu siêu tốc độ.
* **Bảo mật:** `bcryptjs` (Mã hóa mật khẩu), `jsonwebtoken` (Quản lý phiên đăng nhập).

---

 Hướng dẫn cài đặt và Khởi chạy

Yêu cầu máy tính đã cài đặt sẵn **Node.js**. Thực hiện theo các bước sau để chạy dự án:

**Bước 1:** Clone kho mã nguồn này về máy tính:
```bash
git clone [https://github.com/Menero-hub/do-an-cong-nghe-web-bookstore.git](https://github.com/Menero-hub/do-an-cong-nghe-web-bookstore.git)
