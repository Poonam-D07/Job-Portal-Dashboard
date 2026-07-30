import { store } from '../store.js';
import { Modal } from '../components/Modal.js';

export class SavedJobsView {
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

    const jobs = store.getJobs();
    const savedJobs = jobs.filter(j => j.bookmarked);

    this.container.innerHTML = `
      <section class="page-intro">
        <h2 class="hero-title">Bookmarked Openings</h2>
        <p class="hero-subtitle">You have saved ${savedJobs.length} job openings to review and apply.</p>
      </section>

      <section class="jobs-feed-grid" id="savedJobsGrid">
        ${savedJobs.length === 0 ? `
          <div class="glass-panel no-jobs-fallback">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>No bookmarked vacancies</h3>
            <p>Browse listings and click the bookmark badge to save roles here.</p>
            <button class="primary-btn" id="browseJobsBtn" style="margin-top: 1rem;">Browse Jobs</button>
          </div>
        ` : savedJobs.map(job => `
          <article class="glass-panel job-card ${job.applied ? 'applied' : ''}" data-job-id="${job.id}">
            <div class="card-top flex-between">
              <div class="company-badge-row flex-align-center">
                <div class="company-logo" style="background-color: ${job.logoBg}">${job.logoText}</div>
                <div class="company-info">
                  <h4 class="company-title">${job.company}</h4>
                  <span class="job-post-time">${job.posted}</span>
                </div>
              </div>
              <button class="bookmark-btn active" data-job-id="${job.id}" aria-label="Remove Bookmark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--warning-text)" stroke="var(--warning-text)" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>

            <div class="card-mid">
              <h3 class="job-card-title">${job.title}</h3>
              <p class="job-card-excerpt">${job.description.substring(0, 110)}...</p>
            </div>

            <div class="card-tags">
              <span class="badge badge-info">${job.location.split(' (')[0]}</span>
              <span class="badge badge-success">${job.type}</span>
              <span class="card-salary-info">${job.salary}</span>
            </div>

            <hr class="card-divider" />

            <div class="card-bottom flex-between">
              ${job.applied ? `
                <span class="badge badge-success flex-align-center" style="gap: 0.25rem;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Applied (${job.status})</span>
                </span>
              ` : `
                <span class="experience-requirement">${job.experience}</span>
              `}
              <button class="view-job-btn secondary-btn" data-job-id="${job.id}">
                <span>${job.applied ? 'View Details' : 'Apply Now'}</span>
              </button>
            </div>
          </article>
        `).join('')}
      </section>
    `;
  }

  setupEventListeners() {
    // Browse jobs CTA button click
    this.container.addEventListener('click', (e) => {
      const browseBtn = e.target.closest('#browseJobsBtn');
      if (browseBtn && this.onNavigate) {
        this.onNavigate('jobs');
      }
    });

    // Toggle bookmark click delegate
    this.container.addEventListener('click', (e) => {
      const bookmarkBtn = e.target.closest('.bookmark-btn');
      if (bookmarkBtn) {
        e.stopImmediatePropagation();
        const jobId = bookmarkBtn.dataset.jobId;
        store.toggleBookmark(jobId);
      }
    });

    // Delegate card detail modal clicks
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.job-card');
      const actionBtn = e.target.closest('.view-job-btn');
      
      if (card && (actionBtn || !e.target.closest('.bookmark-btn'))) {
        const jobId = card.dataset.jobId;
        const job = store.getJobById(jobId);
        if (job) {
          this.modal.open(job);
        }
      }
    });
  }
}
