// AUTH
const Auth = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('token'),
  isAdmin: () => { const u = Auth.getUser(); return u && u.role === 'admin'; },
  setAuth: (token, user) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); },
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; },
};

// API (Thêm try/catch & tự động gắn Token mượt hơn)
const api = async (method, url, body) => {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  const token = Auth.getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi server');
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// CART
const Cart = {
  get: () => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } },
  save: (c) => { localStorage.setItem('cart', JSON.stringify(c)); Cart.updateBadge(); },
  add: (book, qty = 1) => {
    const cart = Cart.get();
    const idx = cart.findIndex(i => i.bookId === book.id);
    if (idx > -1) cart[idx].quantity += qty;
    else cart.push({ bookId: book.id, title: book.title, author: book.author, cover: book.cover, price: book.price, quantity: qty });
    Cart.save(cart);
    Toast.show('✅ Đã thêm vào giỏ hàng!', 'success');
  },
  remove: (id) => { Cart.save(Cart.get().filter(i => i.bookId !== id)); },
  updateQty: (id, qty) => {
    const cart = Cart.get();
    const idx = cart.findIndex(i => i.bookId === id);
    if (idx > -1) { 
        if (qty <= 0) cart.splice(idx, 1); 
        else cart[idx].quantity = qty; 
    }
    Cart.save(cart);
  },
  total: () => Cart.get().reduce((s, i) => s + i.price * i.quantity, 0),
  count: () => Cart.get().reduce((s, i) => s + i.quantity, 0),
  clear: () => { localStorage.removeItem('cart'); Cart.updateBadge(); },
  updateBadge: () => {
    const el = document.getElementById('cart-badge'); // Đã fix đúng ID
    if (!el) return;
    const n = Cart.count();
    el.textContent = n;
    el.style.display = n > 0 ? 'inline-block' : 'none';
  }
};

// TOAST
const Toast = {
  init() {
    if (!document.querySelector('.toast-wrap')) {
      this._wrap = document.createElement('div');
      this._wrap.className = 'toast-wrap';
      document.body.appendChild(this._wrap);
    } else {
      this._wrap = document.querySelector('.toast-wrap');
    }
  },
  show(msg, type = '') {
    this.init();
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    this._wrap.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
};

// FORMAT
const fmt = {
  price: n => (n || 0).toLocaleString('vi-VN') + 'đ',
  date: s => s ? new Date(s).toLocaleDateString('vi-VN') : '',
  status: s => ({ processing: '⏳ Đang xử lý', shipping: '🚚 Đang giao', delivered: '✅ Đã giao', cancelled: '❌ Đã hủy' }[s] || s),
  statusClass: s => ({ processing: 'st-processing', shipping: 'st-shipping', delivered: 'st-delivered', cancelled: 'st-cancelled' }[s] || ''), // Đã fix đúng tên hàm
};

// UI INITIALIZATION - Tự động chạy khi load web
document.addEventListener('DOMContentLoaded', () => {
  renderNavUser();
  initNavSearch();
});

function renderNavUser() {
  const user = Auth.getUser();
  const loginLink = document.getElementById('login-link'); 
  const userMenu = document.getElementById('user-menu'); 
  
  if (loginLink) loginLink.style.display = user ? 'none' : 'flex';
  if (userMenu) {
    userMenu.style.display = user ? 'block' : 'none';
    const nameEl = document.getElementById('user-name');
    if (nameEl && user) nameEl.textContent = '👤 ' + user.name.split(' ').pop();
    
    document.querySelectorAll('.admin-link').forEach(el => {
        el.style.display = Auth.isAdmin() ? 'flex' : 'none';
    });
  }
  Cart.updateBadge();
}

function toggleDropdown() {
  document.getElementById('user-dropdown')?.classList.toggle('show');
}

document.addEventListener('click', e => {
  if (!e.target.closest('#user-menu')) {
    document.getElementById('user-dropdown')?.classList.remove('show');
  }
});

function initNavSearch() {
  const inp = document.getElementById('nav-search');
  const btn = document.querySelector('.header-search button');
  const doSearch = () => {
    const q = inp?.value.trim();
    if (q) window.location.href = '/books?search=' + encodeURIComponent(q);
  };
  inp?.addEventListener('keydown', e => e.key === 'Enter' && doSearch());
  btn?.addEventListener('click', doSearch);
}

// ===== CHAT WIDGET (Hỗ trợ khách hàng) =====
const ChatWidget = {
  open: false,
  pollTimer: null,
  bgTimer: null,
  mounted: false,

  shortTime(s) {
    if (!s) return '';
    const d = new Date(s);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  },
  seenCount() { return parseInt(localStorage.getItem('chatSeenCount') || '0', 10); },
  setSeen(n) { localStorage.setItem('chatSeenCount', n); },

  mount() {
    if (this.mounted) return;
    // Admin có khu vực trò chuyện riêng trong trang quản trị
    if (location.pathname.startsWith('/admin')) return;
    const wrap = document.createElement('div');
    wrap.id = 'chat-widget';
    wrap.innerHTML = `
      <button id="chat-fab" onclick="ChatWidget.toggle()" title="Hỗ trợ khách hàng">
        💬<span id="chat-fab-dot" class="chat-dot" style="display:none;"></span>
      </button>
      <div id="chat-panel" class="chat-panel">
        <div class="chat-head">
          <div class="chat-head-info">
            <div class="chat-avatar">🎧</div>
            <div>
              <strong>Hỗ trợ D2TP Book</strong>
              <small>Phản hồi trong giờ làm việc (8h - 21h)</small>
            </div>
          </div>
          <button class="chat-close" onclick="ChatWidget.closePanel()">×</button>
        </div>
        <div id="chat-messages" class="chat-messages"></div>
        <div class="chat-foot">
          <input id="chat-input" type="text" placeholder="Nhập tin nhắn..." onkeydown="if(event.key==='Enter')ChatWidget.send()">
          <button onclick="ChatWidget.send()">Gửi</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    this.mounted = true;
    if (Auth.isLoggedIn()) {
      this.bgTimer = setInterval(() => this.checkUnread(), 8000);
      this.checkUnread();
    }
  },

  toggle() { this.open ? this.closePanel() : this.openPanel(); },

  openPanel() {
    if (!this.mounted) return;
    document.getElementById('chat-panel').classList.add('show');
    this.open = true;
    this.load();
    if (Auth.isLoggedIn()) {
      this.pollTimer = setInterval(() => this.load(true), 3500);
      setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
    }
  },

  closePanel() {
    document.getElementById('chat-panel')?.classList.remove('show');
    this.open = false;
    clearInterval(this.pollTimer);
  },

  async load(silent) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    if (!Auth.isLoggedIn()) {
      box.innerHTML = `
        <div class="chat-empty">
          <div style="font-size:34px;">💬</div>
          <p>Vui lòng <a href="/login" style="color:var(--red);font-weight:700;">đăng nhập</a> để trò chuyện với nhân viên hỗ trợ.</p>
        </div>`;
      document.getElementById('chat-input').disabled = true;
      return;
    }
    document.getElementById('chat-input').disabled = false;
    try {
      const chat = await api('GET', '/api/chat/my');
      this.render(chat);
      this.setSeen(chat.messages.length);
      document.getElementById('chat-fab-dot').style.display = 'none';
    } catch (e) { if (!silent) console.error(e); }
  },

  render(chat) {
    const box = document.getElementById('chat-messages');
    if (!chat.messages.length) {
      box.innerHTML = `
        <div class="chat-empty">
          <div style="font-size:34px;">👋</div>
          <p>Xin chào! Nhà sách D2TP Book có thể giúp gì cho bạn?</p>
        </div>`;
      return;
    }
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.innerHTML = chat.messages.map(m => `
      <div class="chat-msg ${m.from === 'user' ? 'mine' : 'theirs'}">
        ${m.from === 'admin' ? '<div class="chat-msg-from">🎧 Nhân viên hỗ trợ</div>' : ''}
        <div class="chat-bubble">${this.escape(m.text)}</div>
        <div class="chat-time">${this.shortTime(m.at)}</div>
      </div>`).join('');
    if (nearBottom) box.scrollTop = box.scrollHeight;
  },

  escape(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  async send() {
    if (!Auth.isLoggedIn()) { window.location.href = '/login'; return; }
    const inp = document.getElementById('chat-input');
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    try {
      const chat = await api('POST', '/api/chat/my', { text });
      this.render(chat);
      this.setSeen(chat.messages.length);
      const box = document.getElementById('chat-messages');
      box.scrollTop = box.scrollHeight;
    } catch (e) { Toast.show(e.message, 'error'); inp.value = text; }
  },

  async checkUnread() {
    if (!Auth.isLoggedIn() || this.open) return;
    try {
      const chat = await api('GET', '/api/chat/my');
      const last = chat.messages[chat.messages.length - 1];
      const hasNew = chat.messages.length > this.seenCount() && last && last.from === 'admin';
      const dot = document.getElementById('chat-fab-dot');
      if (dot) dot.style.display = hasNew ? 'block' : 'none';
    } catch (e) {}
  },
};
document.addEventListener('DOMContentLoaded', () => ChatWidget.mount());