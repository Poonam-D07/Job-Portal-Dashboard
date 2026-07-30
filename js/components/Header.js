import { store } from '../store.js';

export class Header {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.theme = localStorage.getItem('theme') || 'dark';
    this.notificationsOpen = false;
  }

  init() {
    this.render();
    this.setupTheme();
    this.setupEventListeners();

    // Subscribe to global store updates for notifications, profile, and theme changes
    store.subscribe(() => {
      this.theme = localStorage.getItem('theme') || 'dark';
      this.render();
      this.updateThemeButton();
    });
  }

  setupTheme() {
    this.theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeButton();
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeButton();
  }

  updateThemeButton() {
    const themeBtn = this.container.querySelector('#themeToggleBtn');
    if (!themeBtn) return;
    
    this.theme = localStorage.getItem('theme') || 'dark';
    if (this.theme === 'light') {
      themeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeBtn.setAttribute('aria-label', 'Switch to Dark Mode');
    } else {
      themeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeBtn.setAttribute('aria-label', 'Switch to Light Mode');
    }
  }

  setPageTitle(title) {
    const titleEl = this.container.querySelector('.header-page-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    const panel = this.container.querySelector('.notifications-dropdown');
    if (panel) {
      panel.classList.toggle('active', this.notificationsOpen);
    }
    
    // Mark notifications as read when opening dropdown
    if (this.notificationsOpen) {
      store.markAllNotificationsRead();
    }
  }

  render() {
    const notifications = store.getNotifications();
    const unreadCount = notifications.filter(n => n.unread).length;
    const profile = store.getProfile();
    
    this.container.innerHTML = `
      <div class="header-left">
        <button class="mobile-sidebar-toggle" id="mobileMenuBtn" aria-label="Open Sidebar Navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 class="header-page-title">Dashboard</h1>
      </div>

      <div class="header-right">
        <!-- Theme Toggle -->
        <button class="header-icon-btn" id="themeToggleBtn" aria-label="Toggle Theme"></button>
        
        <!-- Notifications -->
        <div class="notifications-container">
          <button class="header-icon-btn" id="notificationBtn" aria-label="View Notifications" aria-haspopup="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
          </button>
          
          <div class="notifications-dropdown glass-panel ${this.notificationsOpen ? 'active' : ''}">
            <div class="notifications-header">
              <h3>Notifications</h3>
            </div>
            <ul class="notifications-list">
              ${notifications.slice(0, 5).map(n => `
                <li class="notification-item ${n.unread ? 'unread' : ''}">
                  <div class="notification-dot"></div>
                  <div class="notification-content">
                    <p class="notification-title">${n.title}</p>
                    <p class="notification-desc">${n.description}</p>
                    <span class="notification-time">${n.time}</span>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div class="header-divider"></div>

        <!-- User Profile -->
        <div class="user-profile">
          <div class="user-avatar-wrapper">
            <div class="user-avatar-placeholder">${profile.avatar}</div>
            <div class="user-status-dot"></div>
          </div>
          <div class="user-info">
            <span class="user-name">${profile.name}</span>
            <span class="user-role">${profile.role}</span>
          </div>
        </div>
      </div>
    `;

    this.updateThemeButton();
  }

  setupEventListeners() {
    // Theme toggle click
    this.container.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('#themeToggleBtn');
      if (themeBtn) {
        this.toggleTheme();
      }
    });

    // Mobile sidebar toggle click
    this.container.addEventListener('click', (e) => {
      const menuBtn = e.target.closest('#mobileMenuBtn');
      if (menuBtn) {
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) {
          sidebar.classList.toggle('mobile-active');
        }
      }
    });

    // Notifications toggle click
    this.container.addEventListener('click', (e) => {
      const notifBtn = e.target.closest('#notificationBtn');
      if (notifBtn) {
        e.stopPropagation();
        this.toggleNotifications();
      }
    });

    // Close notifications panel when clicking outside
    document.addEventListener('click', (e) => {
      if (this.notificationsOpen && !e.target.closest('.notifications-container')) {
        this.notificationsOpen = false;
        const panel = this.container.querySelector('.notifications-dropdown');
        if (panel) panel.classList.remove('active');
      }
    });
  }
}
