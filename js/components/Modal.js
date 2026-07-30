import { store } from '../store.js';

export class Modal {
  constructor(onApplyCallback) {
    this.onApplyCallback = onApplyCallback;
    this.job = null;
    this.isOpen = false;
    this.modalEl = null;
  }

  open(job) {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    this.job = job;
    this.isOpen = true;
    this.render();
    this.setupEventListeners();
    
    // Add class to body to prevent background scrolling
    document.body.classList.add('modal-open');
    
    // Slide in effect
    setTimeout(() => {
      if (this.modalEl) {
        this.modalEl.classList.add('active');
      }
    }, 10);
  }

  close() {
    this.isOpen = false;
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
      
      // Wait for transition before removing from DOM
      setTimeout(() => {
        if (this.modalEl) {
          this.modalEl.remove();
          this.modalEl = null;
        }
        document.body.classList.remove('modal-open');
      }, 300);
    }
  }

  handleApply() {
    if (!this.job) return;
    
    const success = store.applyToJob(this.job.id);
    if (success) {
      this.job = store.getJobById(this.job.id); // reload updated job
      this.renderBody(); // re-render modal interior
      
      if (this.onApplyCallback) {
        this.onApplyCallback(this.job.id);
      }
    }
  }

  render() {
    // Create modal element if it doesn't exist
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'job-modal-overlay';
    this.modalEl.id = 'jobDetailsModal';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'modalTitle');
    
    document.body.appendChild(this.modalEl);
    this.renderBody();
  }

  renderBody() {
    if (!this.job || !this.modalEl) return;

    const isApplied = this.job.applied;

    this.modalEl.innerHTML = `
      <div class="job-modal-container glass-panel">
        <button class="modal-close-btn" id="closeModalBtn" aria-label="Close Job Details">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-content-wrapper">
          <!-- Job Details Header -->
          <header class="modal-job-header">
            <div class="flex-align-center">
              <div class="modal-company-logo" style="background-color: ${this.job.logoBg}">${this.job.logoText}</div>
              <div class="modal-header-meta">
                <span class="modal-company-name">${this.job.company}</span>
                <h2 class="modal-job-title" id="modalTitle">${this.job.title}</h2>
              </div>
            </div>

            <div class="modal-tags-row">
              <span class="badge badge-info">${this.job.location}</span>
              <span class="badge badge-success">${this.job.type}</span>
              <span class="badge badge-warning">${this.job.experience}</span>
              <span class="modal-salary-badge">${this.job.salary}</span>
            </div>
          </header>

          <hr class="modal-divider" />

          <!-- Job Details Body -->
          <div class="modal-job-body">
            <section class="modal-section">
              <h3 class="modal-section-title">About the Role</h3>
              <p class="modal-description">${this.job.description}</p>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Requirements</h3>
              <ul class="modal-bullets-list">
                ${this.job.requirements.map(req => `<li>${req}</li>`).join('')}
              </ul>
            </section>

            <section class="modal-section">
              <h3 class="modal-section-title">Benefits & Perks</h3>
              <ul class="modal-bullets-list">
                ${this.job.benefits.map(ben => `<li>${ben}</li>`).join('')}
              </ul>
            </section>
          </div>

          <!-- Job Details Footer Actions -->
          <footer class="modal-job-footer">
            ${isApplied ? `
              <div class="applied-status-indicator">
                <div class="flex-align-center success-msg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Application Submitted (${this.job.status})</span>
                </div>
                <p class="applied-date-lbl">Applied on ${this.job.appliedDate}</p>
              </div>
            ` : `
              <button class="primary-btn apply-submit-btn" id="submitAppBtn">
                <span>Submit Application</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            `}
          </footer>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.modalEl) return;

    // Close button click
    const closeBtn = this.modalEl.querySelector('#closeModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Apply button click
    this.modalEl.addEventListener('click', (e) => {
      const submitBtn = e.target.closest('#submitAppBtn');
      if (submitBtn) {
        this.handleApply();
      }
    });

    // Close when overlay clicked outside container
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // Close on Escape key press
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    this.keyHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }
}
