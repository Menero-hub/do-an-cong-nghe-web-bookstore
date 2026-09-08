This is the **D2TP BOOK** project, an online bookstore e-commerce website built with Node.js, Express, and Vanilla JavaScript.

## Features & Architecture

**Core Architecture**
This project is built entirely from scratch without heavy frontend frameworks to deeply understand the core of Web Technology. The frontend utilizes Vanilla JavaScript to interact with a RESTful API built on Node.js and Express. Data is persisted in a lightweight JSON file (`db.json`) and cached in-memory, ensuring ultra-low latency and blazing-fast responses.

**Key Features**
* **Client Side:** Secure user authentication (JWT & Bcrypt), browsing and searching the book catalog, shopping cart management via LocalStorage, and a seamless checkout process.
* **Admin Side:** A dedicated dashboard for managing the book catalog, categories, user accounts, and tracking order statuses.

## Getting Started

First, install the dependencies and run the development server:

```bash
npm install
# then
npm start
Open http://localhost:3001 with your browser to see the result.

You can start editing the interface by modifying views/index.html or public/css/style.css. The pages will update as you refresh the browser. (Note: You will need to restart the server if you modify backend files like server.js or API routes).

This project uses a custom JSON-based database (data/db.json) combined with in-memory caching to automatically optimize and load data extremely fast without needing a heavy database engine.

Learn More
To learn more about the technologies used in this project, take a look at the following resources:

Node.js Documentation - learn about Node.js features and API.

Express.js Documentation - learn about the Express web framework routing and middleware.

MDN Web Docs (JavaScript) - an interactive resource to master Vanilla JS and DOM manipulation.

You can check out the source code and file structure in this repository - your feedback and contributions are welcome!

Deploy on Render / Vercel
The easiest way to deploy your Node.js/Express app is to use cloud platforms like Render or Vercel.

Check out the official Node.js deployment documentation for more details on how to host a full-stack web application.
