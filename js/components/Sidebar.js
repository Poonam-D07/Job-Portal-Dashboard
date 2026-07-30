export class Sidebar {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
    this.currentActive = 'dashboard';
    this.isCollapsed = false;

    const storedState = localStorage.getItem('sidebar-collapsed');
    if (storedState) {
      this.isCollapsed = storedState === 'true';
    }
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.updateCollapseState();
  }

  setActive(routeId) {
    this.currentActive = routeId;
    const links = this.container.querySelectorAll('.sidebar-nav-link');
    links.forEach(link => {
      if (link.dataset.route === routeId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebar-collapsed', this.isCollapsed);
    this.updateCollapseState();
  }

  updateCollapseState() {
    const appContainer = document.getElementById('appContainer');
    if (this.isCollapsed) {
      appContainer.classList.add('sidebar-collapsed');
      this.container.classList.add('collapsed');
    } else {
      appContainer.classList.remove('sidebar-collapsed');
      this.container.classList.remove('collapsed');
    }
  }

  navItem(route, label, svgPath) {
    const isActive = this.currentActive === route;
    return `
      <li>
        <button
          class="sidebar-nav-link ${isActive ? 'active' : ''}"
          data-route="${route}"
          aria-label="Navigate to ${label}"
          ${isActive ? 'aria-current="page"' : ''}
        >
          <span class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${svgPath}
            </svg>
          </span>
          <span class="nav-text">${label}</span>
        </button>
      </li>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="sidebar-brand-wrapper">
        <div class="sidebar-brand">
          <div class="brand-logo-hex">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary)" />
              <path d="M2 17L12 22L22 17" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="brand-name">TalentSphere</span>
        </div>
      </div>

      <nav class="sidebar-nav" aria-label="Primary Navigation">
        <ul class="sidebar-nav-list">

          ${this.navItem('dashboard', 'Dashboard',
            `<rect x="3" y="3" width="7" height="7"></rect>
             <rect x="14" y="3" width="7" height="7"></rect>
             <rect x="14" y="14" width="7" height="7"></rect>
             <rect x="3" y="14" width="7" height="7"></rect>`
          )}

          ${this.navItem('jobs', 'Find Jobs',
            `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
             <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>`
          )}

          ${this.navItem('saved', 'Saved Jobs',
            `<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>`
          )}

          ${this.navItem('applications', 'My Applications',
            `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
             <polyline points="14 2 14 8 20 8"></polyline>
             <line x1="16" y1="13" x2="8" y2="13"></line>
             <line x1="16" y1="17" x2="8" y2="17"></line>
             <polyline points="10 9 9 9 8 9"></polyline>`
          )}

          ${this.navItem('notifications', 'Notifications',
            `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
             <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>`
          )}

          <li class="nav-section-label">Account</li>

          ${this.navItem('profile', 'Profile',
            `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
             <circle cx="12" cy="7" r="4"></circle>`
          )}

          ${this.navItem('settings', 'Settings',
            `<circle cx="12" cy="12" r="3"></circle>
             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`
          )}

          ${this.navItem('about', 'About',
            `<circle cx="12" cy="12" r="10"></circle>
             <line x1="12" y1="16" x2="12" y2="12"></line>
             <line x1="12" y1="8" x2="12.01" y2="8"></line>`
          )}

        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="sidebar-toggle-btn" id="sidebarCollapseBtn" aria-label="Collapse Navigation Menu">
          <span class="toggle-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </span>
          <span class="toggle-text">Collapse Menu</span>
        </button>
      </div>
    `;
  }

  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      const link = e.target.closest('.sidebar-nav-link');
      if (link) {
        const route = link.dataset.route;
        this.setActive(route);
        if (this.onNavigate) {
          this.onNavigate(route);
        }
        if (window.innerWidth <= 768) {
          this.container.classList.remove('mobile-active');
        }
      }

      const toggleBtn = e.target.closest('#sidebarCollapseBtn');
      if (toggleBtn) {
        this.toggleCollapse();
      }
    });
  }
}
