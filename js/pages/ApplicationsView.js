import { store } from '../store.js';
import { Modal } from '../components/Modal.js';

export class ApplicationsView {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
    this.unsubscribe = null;
    this.modal = null;
  }

  init() {
    this.modal = new Modal();
    this.render();
    this.setupEventListeners();
    
    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.modal) this.modal.close();
  }

  render() {
    if (!this.container) return;

    const stats = store.getStats();
    const jobs = store.getJobs();
    const appliedJobs = jobs.filter(j => j.applied);

    this.container.innerHTML = `
      <section class="page-intro">
        <h2 class="hero-title">Track Applications</h2>
        <p class="hero-subtitle">You have applied to ${appliedJobs.length} active job listings.</p>
      </section>

      <!-- Mini Stats Row -->
      <section class="stats-grid grid-cols-12" style="margin-bottom: 2rem;">
        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon applied">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Total Sent</span>
            <span class="stat-number" style="font-size: 1.5rem;">${stats.applied}</span>
          </div>
        </div>

        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon pending">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Pending</span>
            <span class="stat-number" style="font-size: 1.5rem;">${stats.pending}</span>
          </div>
        </div>

        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon interview">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Interviews</span>
            <span class="stat-number" style="font-size: 1.5rem;">${stats.interviews}</span>
          </div>
        </div>

        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon rejected">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Disqualified</span>
            <span class="stat-number" style="font-size: 1.5rem;">${stats.rejected}</span>
          </div>
        </div>
      </section>

      <!-- Applications history block -->
      <section class="glass-panel recent-apps-panel">
        <div class="panel-header flex-between">
          <h3 class="panel-title">Application History</h3>
          <span class="badge badge-info">${appliedJobs.length} Submissions</span>
        </div>

        <div class="apps-table-container">
          ${appliedJobs.length === 0 ? `
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              </svg>
              <p>You haven't submitted any job applications yet.</p>
              <button class="primary-btn" id="browseJobsBtn" style="margin-top: 1rem;">Browse Jobs</button>
            </div>
          ` : `
            <table class="apps-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${appliedJobs.map(job => `
                  <tr>
                    <td>
                      <div class="app-company flex-align-center">
                        <div class="company-logo" style="background-color: ${job.logoBg}">${job.logoText}</div>
                        <span class="company-name">${job.company}</span>
                      </div>
                    </td>
                    <td>
                      <span class="app-role">${job.title}</span>
                    </td>
                    <td>
                      <span class="app-date">${job.appliedDate}</span>
                    </td>
                    <td>
                      <span class="badge badge-${job.status === 'Pending' ? 'warning' : job.status === 'Interview' ? 'success' : 'danger'}">${job.status}</span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <button class="secondary-btn view-job-btn" data-job-id="${job.id}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                          View Details
                        </button>
                        <button class="withdraw-app-btn text-btn" data-job-id="${job.id}" aria-label="Withdraw Application" style="color: var(--danger-text); font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.5rem;">
                          Withdraw
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </section>
    `;
  }

  setupEventListeners() {
    // Browse jobs CTA button click
    const browseBtn = this.container.querySelector('#browseJobsBtn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('jobs');
      });
    }

    // View details button click
    this.container.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.view-job-btn');
      if (viewBtn) {
        const jobId = viewBtn.dataset.jobId;
        const job = store.getJobById(jobId);
        if (job) {
          this.modal.open(job);
        }
      }
    });

    // Withdraw application button click
    this.container.addEventListener('click', (e) => {
      const withdrawBtn = e.target.closest('.withdraw-app-btn');
      if (withdrawBtn) {
        const jobId = withdrawBtn.dataset.jobId;
        if (confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
          store.withdrawApplication(jobId);
        }
      }
    });
  }
}
