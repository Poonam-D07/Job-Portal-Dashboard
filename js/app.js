import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { Toast } from './components/Toast.js';
import { DashboardView } from './pages/DashboardView.js';
import { JobsView } from './pages/JobsView.js';
import { SavedJobsView } from './pages/SavedJobsView.js';
import { ApplicationsView } from './pages/ApplicationsView.js';
import { NotificationsView } from './pages/NotificationsView.js';
import { ProfileView } from './pages/ProfileView.js';
import { SettingsView } from './pages/SettingsView.js';
import { AboutView } from './pages/AboutView.js';
import { NotFoundView } from './pages/NotFoundView.js';

// Page title map
const PAGE_TITLES = {
  dashboard:     'Dashboard',
  jobs:          'Find Jobs',
  saved:         'Saved Jobs',
  applications:  'My Applications',
  notifications: 'Notifications',
  profile:       'Profile',
  settings:      'Settings',
  about:         'About Project',
};

class App {
  constructor() {
    this.sidebar = null;
    this.header = null;
    this.toast = null;
    this.currentView = null;
    this.activeRoute = '';
    this.activeParam = null;
  }

  init() {
    // 1. Initialize Toast notification manager (global, always mounted)
    this.toast = new Toast();
    this.toast.init();

    // 2. Initialize Header
    this.header = new Header('appHeader');
    this.header.init();

    // 3. Initialize Sidebar with navigation callback
    this.sidebar = new Sidebar('appSidebar', (route, params) => {
      this.navigate(route, params);
    });
    this.sidebar.init();

    // 4. Navigate to starting route
    const parsed = this.parseHash();
    this.navigate(parsed.route || 'dashboard', parsed.param);

    // 5. Handle browser back/forward navigation
    window.addEventListener('hashchange', () => {
      const current = this.parseHash();
      if (current.route !== this.activeRoute || current.param !== this.activeParam) {
        this.navigate(current.route, current.param);
      }
    });

    // 6. Hide boot loader after first render
    setTimeout(() => {
      const loader = document.getElementById('appBootLoader');
      if (loader) loader.classList.add('hidden');
    }, 600);
  }

  parseHash() {
    const hash = window.location.hash;
    if (!hash || hash === '#') {
      return { route: 'dashboard', param: null };
    }
    const parts = hash.replace('#/', '').split('/');
    return {
      route: parts[0] || 'dashboard',
      param: parts[1] || null
    };
  }

  navigate(routeId, param = null) {
    // Destroy previous view subscriptions
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    this.activeRoute = routeId;
    this.activeParam = param;

    // Update URL hash
    const hashVal = param ? `#/${routeId}/${param}` : `#/${routeId}`;
    if (window.location.hash !== hashVal) {
      window.location.hash = hashVal;
    }

    // Highlight active sidebar item
    if (this.sidebar) this.sidebar.setActive(routeId);

    // Resolve view class and page title
    let ViewClass;
    const pageTitle = PAGE_TITLES[routeId] || 'TalentSphere';

    switch (routeId) {
      case 'dashboard':
        ViewClass = DashboardView;
        break;
      case 'jobs':
        ViewClass = JobsView;
        break;
      case 'saved':
        ViewClass = SavedJobsView;
        break;
      case 'applications':
        ViewClass = ApplicationsView;
        break;
      case 'notifications':
        ViewClass = NotificationsView;
        break;
      case 'profile':
        ViewClass = ProfileView;
        break;
      case 'settings':
        ViewClass = SettingsView;
        break;
      case 'about':
        ViewClass = AboutView;
        break;
      default:
        ViewClass = NotFoundView;
        break;
    }

    // Update document and header titles
    document.title = `TalentSphere — ${pageTitle}`;
    if (this.header) this.header.setPageTitle(pageTitle);

    const navigateFn = (route, p) => this.navigate(route, p);

    if (routeId === 'jobs') {
      this.currentView = new JobsView('appMain', param, navigateFn);
    } else {
      this.currentView = new ViewClass('appMain', navigateFn);
    }
    this.currentView.init();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
