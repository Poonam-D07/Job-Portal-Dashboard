export class Toast {
  constructor() {
    this.container = null;
  }

  init() {
    this.createContainer();
    this.setupListeners();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-notification-container';
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  show(message, type = 'success') {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item glass-panel toast-${type}`;
    
    // Icon selection
    let icon = '';
    if (type === 'success') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'info') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    } else if (type === 'warning') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <p class="toast-message">${message}</p>
      <button class="toast-close-btn" aria-label="Close Notification">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    this.container.appendChild(toast);

    // Slide-in animation hook
    setTimeout(() => toast.classList.add('visible'), 10);

    // Auto-remove helper
    const removeTimer = setTimeout(() => {
      this.dismiss(toast);
    }, 3500);

    // Close button trigger
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      clearTimeout(removeTimer);
      this.dismiss(toast);
    });
  }

  dismiss(toast) {
    toast.classList.remove('visible');
    toast.classList.add('dismissed');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  setupListeners() {
    window.addEventListener('show-toast', (e) => {
      const { message, type } = e.detail;
      this.show(message, type);
    });
  }
}
