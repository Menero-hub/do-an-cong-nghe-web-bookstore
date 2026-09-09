<div align="center">
  <h1>📚 D2TP BOOK</h1>
  <p><b>Online Bookstore E-Commerce Platform — Web Technology Course Project</b></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
</div>

---

## 🌟 Project Overview

**D2TP BOOK** is a full-stack e-commerce web application designed for browsing, ordering, and managing an online book catalog. The entire platform is developed from scratch across both the frontend and backend architectures without third-party UI component libraries, emphasizing lightweight performance and a deep mastery of foundational web technologies.

> 🎓 **Academic Information:**
> * **Student:** Nguyen Tien Dat (Student ID: A50470)
> * **Institution:** Thang Long University
> * **Course:** Web Technology

---

## ✨ Key Features

The system is structured into two dedicated operational subsystems:

### 👤 1. Client Subsystem
* 🔐 **Authentication:** Secure user registration and login mechanisms (passwords encrypted via `bcryptjs`, session handling via JSON Web Tokens).
* 📖 **Catalog & Discovery:** Real-time search by title or author, category-based filtering, and dynamic sorting (price, sales volume).
* 🔍 **Product Details:** Detailed book views including author, publisher, publication year, rating, and real-time inventory count.
* 🛒 **Shopping Cart:** Real-time item quantity adjustment with cart state persistence using `LocalStorage`.
* 💳 **Checkout:** Order placement workflow with address validation and Cash-on-Delivery (COD) processing.
* 📦 **Order History:** Personal order tracking interface with live fulfillment status updates.

### ⚙️ 2. Admin Subsystem
* 📊 **Dashboard:** Real-time statistical overview displaying total books, incoming orders, registered user accounts, and gross revenue.
* 📚 **Catalog & Category CRUD:** Full Create, Read, Update, and Delete operations for book products and genres.
* 📝 **Order Fulfillment:** Comprehensive customer order review and multi-stage status management (Processing ➔ Shipping ➔ Delivered ➔ Cancelled).
* 👥 **User Management:** Directory of registered user profiles and role privilege inspection.

---

## 🚀 Tech Stack

* **Frontend:** Semantic HTML5, modern CSS3 (Flexbox & CSS Grid), and Vanilla JavaScript. Built without UI frameworks to ensure complete DOM control and zero bloat.
* **Backend:** Node.js with the Express.js framework implementing RESTful API architecture.
* **Database:** Lightweight JSON file-based database (`db.json`) combined with **In-Memory Caching** to ensure ultra-low query latency.
* **Security:** `bcryptjs` for one-way password hashing, `jsonwebtoken` (JWT) for stateless bearer authentication.

---

## 🛠️ Getting Started & Installation

### Prerequisites
Make sure you have **Node.js** (v14 or higher) installed on your machine.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Menero-hub/do-an-cong-nghe-web-bookstore.git](https://github.com/Menero-hub/do-an-cong-nghe-web-bookstore.git)
   cd do-an-cong-nghe-web-bookstore
   1 .Install project dependencies:
   npm install
   2.Start the local server:
   node server.js
   # or
   npm start
   3 Access the application:
   Open your browser and navigate to:
   http://localhost:3001
   🔑 Demo Administrator Credentials:

  Email: admin@bookstore.com
  Password: password
   📁 Project Directory Structure
   📦 do-an-cong-nghe-web-bookstore
 ┣ 📂 data           # Persistent JSON storage (db.json)
 ┣ 📂 public         # Static web assets (CSS styles, client-side JS, cover images)
 ┃ ┣ 📂 css
 ┃ ┣ 📂 images
 ┃ ┗ 📂 js
 ┣ 📂 routes         # Express API controllers (Auth, Books, Categories, Orders, Users)
 ┣ 📂 views          # HTML interface pages (Storefront & Admin views)
 ┣ 📜 server.js      # Main Express application entry point
 ┗ 📜 package.json   # Project dependencies and script definitions
