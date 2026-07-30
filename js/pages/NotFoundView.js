export class NotFoundView {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="glass-panel" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 5rem 2rem; gap: 1.5rem; max-width: 600px; margin: 3rem auto;">
        <div style="font-size: 5rem; font-weight: 800; color: var(--primary-light); line-height: 1; letter-spacing: -0.05em; text-shadow: 0 4px 15px var(--primary-glow);">
          404
        </div>
        
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">Page Not Found</h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">
            The URL path you requested does not exist. It may have been relocated or deleted.
          </p>
        </div>

        <button class="primary-btn" id="backToHomeBtn" style="margin-top: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Return to Dashboard</span>
        </button>
      </section>
    `;
  }

  setupEventListeners() {
    const btn = this.container.querySelector('#backToHomeBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('dashboard');
      });
    }
  }
}
