import { store } from '../store.js';

export class SettingsView {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
    this.unsubscribe = null;
  }

  init() {
    this.render();
    this.setupEventListeners();
    
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  saveProfile(e) {
    e.preventDefault();
    const name = this.container.querySelector('#editNameInput').value.trim();
    const role = this.container.querySelector('#editRoleInput').value.trim();
    const location = this.container.querySelector('#editLocationInput').value.trim();

    if (!name || !role || !location) {
      store.showToast('Please fill out all profile fields!', 'warning');
      return;
    }

    // Split name to update avatar
    const nameParts = name.split(' ');
    const avatar = nameParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();

    store.updateProfile({
      name,
      role,
      location,
      avatar
    });
  }

  render() {
    if (!this.container) return;

    const profile = store.getProfile();
    const currentTheme = localStorage.getItem('theme') || 'dark';

    this.container.innerHTML = `
      <section class="page-intro">
        <h2 class="hero-title">Account Settings</h2>
        <p class="hero-subtitle">Update your profile parameters, theme selections, and developer database.</p>
      </section>

      <div class="grid-cols-12">
        <!-- Edit Profile Form -->
        <form class="glass-panel col-span-8 settings-form" id="settingsForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 class="panel-title" style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.75rem;">Modify Profile Details</h3>
          
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <label for="editNameInput" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Full Name</label>
            <input type="text" id="editNameInput" value="${profile.name}" style="background-color: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 0.65rem; font-size: 0.9rem; color: var(--text-primary);">
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <label for="editRoleInput" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Current Role / Focus</label>
            <input type="text" id="editRoleInput" value="${profile.role}" style="background-color: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 0.65rem; font-size: 0.9rem; color: var(--text-primary);">
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <label for="editLocationInput" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Location</label>
            <input type="text" id="editLocationInput" value="${profile.location}" style="background-color: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 0.65rem; font-size: 0.9rem; color: var(--text-primary);">
          </div>

          <button type="submit" class="primary-btn" style="margin-top: 0.5rem; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.25rem;">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Save Profile Modifications</span>
          </button>
        </form>

        <!-- Right Side: Preferences and Reset options -->
        <div class="col-span-4 flex-col-gap" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Theme Preference panel -->
          <div class="glass-panel theme-pref-card" style="display: flex; flex-direction: column; gap: 1rem;">
            <h3 class="panel-title">Theme Preferences</h3>
            
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label for="themePreferenceSelect" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Select Interface Theme</label>
              <div class="filter-dropdown-wrapper" style="min-width: 100%; height: 40px; padding: 0 0.5rem;">
                <select id="themePreferenceSelect" style="width: 100%; font-size: 0.85rem; cursor: pointer;">
                  <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Cosmic Obsidian (Dark)</option>
                  <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Daylight Pearl (Light)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Application Database tools -->
          <div class="glass-panel db-tools-card" style="display: flex; flex-direction: column; gap: 1rem; border: 1px solid hsla(350, 80%, 55%, 0.2);">
            <h3 class="panel-title" style="color: var(--danger-text);">System Recovery</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45;">
              Wipe out all application changes, local storage saves, and bookmarked jobs to restore the system.
            </p>
            <button class="secondary-btn" id="resetSystemDbBtn" style="width: 100%; justify-content: center; border-color: var(--danger); color: var(--danger-text); padding: 0.65rem; font-weight: 700; background-color: var(--danger-bg);">
              Reset Dashboard State
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Form submit listener
    const form = this.container.querySelector('#settingsForm');
    if (form) {
      form.addEventListener('submit', (e) => this.saveProfile(e));
    }

    // Theme dropdown change listener
    const themeSelect = this.container.querySelector('#themePreferenceSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        localStorage.setItem('theme', selected);
        document.documentElement.setAttribute('data-theme', selected);
        store.notify(); // Sync header theme toggle icon instantly
        store.showToast(`Theme switched to ${selected} mode.`, 'info');
      });
    }

    // Reset database button click
    const resetBtn = this.container.querySelector('#resetSystemDbBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Warning: This will clear all application histories, bookmarks, and skill increments. Proceed?')) {
          store.resetStore();
          // Redirect to dashboard view after reset
          if (this.onNavigate) this.onNavigate('dashboard');
        }
      });
    }
  }
}
