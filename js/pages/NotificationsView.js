import { store } from '../store.js';

export class NotificationsView {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
    this.filter = 'all'; // all | unread | read
    this.unsubscribe = null;
  }

  init() {
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
    this.render();
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  getIconSVG(iconType) {
    const icons = {
      calendar: `<path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>`,
      eye: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`,
      briefcase: `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>`,
      file: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>`,
      x: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`,
      download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>`,
      alert: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`
    };
    return icons[iconType] || icons.file;
  }

  getIconColor(type) {
    const colors = {
      interview: 'var(--success)',
      view:      'var(--primary)',
      job:       'var(--info-text)',
      application:'var(--warning-text)',
      decline:   'var(--danger-text)',
      download:  'var(--primary-light)',
      alert:     'var(--warning-text)'
    };
    return colors[type] || 'var(--text-secondary)';
  }

  getIconBg(type) {
    const colors = {
      interview:   'var(--success-bg)',
      view:        'var(--primary-glow)',
      job:         'var(--info-bg)',
      application: 'var(--warning-bg)',
      decline:     'var(--danger-bg)',
      download:    'var(--primary-glow)',
      alert:       'var(--warning-bg)'
    };
    return colors[type] || 'var(--bg-tertiary)';
  }

  markAllRead() {
    store.markAllNotificationsRead();
  }

  markRead(id) {
    store.markNotificationRead(id);
  }

  render() {
    if (!this.container) return;

    const notifications = store.getNotifications();

    const filtered = notifications.filter(n => {
      if (this.filter === 'unread') return n.unread;
      if (this.filter === 'read') return !n.unread;
      return true;
    });

    const unreadCount = notifications.filter(n => n.unread).length;

    this.container.innerHTML = `
      <section class="page-intro" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 class="hero-title">Notifications</h2>
          <p class="hero-subtitle">
            You have <strong style="color: var(--primary-light);">${unreadCount} unread</strong> notification${unreadCount !== 1 ? 's' : ''}.
          </p>
        </div>
        ${unreadCount > 0 ? `
          <button class="secondary-btn" id="markAllReadBtn" style="align-self: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Mark all as read</span>
          </button>
        ` : ''}
      </section>

      <!-- Filter tabs -->
      <div class="glass-panel" style="display: flex; gap: 0.5rem; padding: 0.5rem; width: fit-content;">
        <button class="filter-type-btn ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
          All (${notifications.length})
        </button>
        <button class="filter-type-btn ${this.filter === 'unread' ? 'active' : ''}" data-filter="unread">
          Unread (${unreadCount})
        </button>
        <button class="filter-type-btn ${this.filter === 'read' ? 'active' : ''}" data-filter="read">
          Read (${notifications.length - unreadCount})
        </button>
      </div>

      <!-- Notifications List -->
      <div class="glass-panel" style="padding: 0; overflow: hidden;">
        ${filtered.length === 0 ? `
          <div class="empty-state" style="padding: 4rem 2rem; gap: 0.75rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">No notifications here</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Check back later for updates on your applications.</p>
          </div>
        ` : `
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${filtered.map((n, i) => `
              <li
                class="notification-list-item ${n.unread ? 'unread-item' : ''}"
                data-id="${n.id}"
                style="
                  display: flex;
                  align-items: flex-start;
                  gap: 1rem;
                  padding: 1.25rem 1.5rem;
                  border-bottom: ${i < filtered.length - 1 ? '1px solid var(--card-border)' : 'none'};
                  cursor: pointer;
                  transition: background 0.2s ease;
                  background-color: ${n.unread ? 'hsla(230, 80%, 60%, 0.04)' : 'transparent'};
                "
              >
                <!-- Icon badge -->
                <div style="
                  flex-shrink: 0;
                  width: 42px;
                  height: 42px;
                  border-radius: var(--radius-full);
                  background-color: ${this.getIconBg(n.type)};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="${this.getIconColor(n.type)}" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    ${this.getIconSVG(n.icon)}
                  </svg>
                </div>

                <!-- Content -->
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                    <p style="
                      font-size: 0.9rem;
                      font-weight: ${n.unread ? '700' : '500'};
                      color: var(--text-primary);
                      margin-bottom: 0.25rem;
                    ">${n.title}</p>
                    <span style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; flex-shrink: 0;">
                      ${n.time}
                    </span>
                  </div>
                  <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
                    ${n.description}
                  </p>
                </div>

                <!-- Unread dot -->
                ${n.unread ? `
                  <div style="
                    flex-shrink: 0;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--primary);
                    margin-top: 0.4rem;
                    box-shadow: 0 0 6px var(--primary-glow);
                  "></div>
                ` : ''}
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Mark all read button
    const markAllBtn = this.container.querySelector('#markAllReadBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => this.markAllRead());
    }

    // Filter tab buttons
    const filterBtns = this.container.querySelectorAll('[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this.render();
      });
    });

    // Click notification item to mark as read
    const listItems = this.container.querySelectorAll('.notification-list-item');
    listItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        this.markRead(id);
      });

      // Hover effect
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'var(--bg-tertiary)';
      });
      item.addEventListener('mouseleave', () => {
        const notif = store.getNotifications().find(n => n.id === parseInt(item.dataset.id));
        item.style.backgroundColor = notif && notif.unread
          ? 'hsla(230, 80%, 60%, 0.04)'
          : 'transparent';
      });
    });
  }
}
