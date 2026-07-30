import { store } from '../store.js';
import { AnalyticsChart } from '../components/AnalyticsChart.js';
import { mockSalaryAnalytics } from '../utils/mockData.js';

export class DashboardView {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
    this.unsubscribe = null;
  }

  init() {
    this.render();
    this.setupViewEventListeners();

    this.unsubscribe = store.subscribe(() => {
      this.render();
    });
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    if (!this.container) return;

    const stats = store.getStats();
    const profile = store.getProfile();
    const jobs = store.getJobs();
    const appliedJobs = jobs.filter(j => j.applied);
    const savedJobs = jobs.filter(j => j.bookmarked);
    
    // Fetch store upgrades
    const recommendedJobs = store.getRecommendedJobs();
    const recentlyViewed = store.getRecentlyViewed();
    const recruiterActivity = store.getRecruiterActivities();
    const interviews = store.getUpcomingInterviews();

    // Calculate dynamic strength
    const skillCount = profile.skills.length;
    const resumeStrength = Math.min(60 + skillCount * 4, 100);

    this.container.innerHTML = `
      <!-- Greeting, Subtitle & Quick Actions -->
      <section class="dashboard-hero flex-between" style="flex-wrap: wrap; gap: 1.5rem;">
        <div class="hero-left">
          <h2 class="hero-title">Welcome back, ${profile.name.split(' ')[0]}! 👋</h2>
          <p class="hero-subtitle">You have ${stats.interviews} interviews scheduled and ${stats.pending} pending applications.</p>
        </div>
        <div class="quick-actions-bar" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="primary-btn" id="findJobsBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Search Jobs</span>
          </button>
          <button class="secondary-btn" id="profileQuickBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Profile CV</span>
          </button>
          <button class="secondary-btn" id="settingsQuickBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Config Settings</span>
          </button>
        </div>
      </section>

      <!-- Stat Cards Grid -->
      <section class="stats-grid grid-cols-12">
        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon applied">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Total Applied</span>
            <span class="stat-number">${stats.applied}</span>
          </div>
        </div>

        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon interview">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Interviews</span>
            <span class="stat-number">${stats.interviews}</span>
          </div>
        </div>

        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon pending">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Pending Reviews</span>
            <span class="stat-number">${stats.pending}</span>
          </div>
        </div>

        <div class="glass-panel stat-card col-span-3">
          <div class="stat-icon applied" style="background-color: var(--warning-glow); color: var(--warning-text);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Saved Vacancies</span>
            <span class="stat-number">${stats.saved}</span>
          </div>
        </div>
      </section>

      <!-- Center Analytics Grid -->
      <section class="analytics-grid grid-cols-12">
        <!-- Application trend chart -->
        <div class="glass-panel col-span-8 chart-panel" id="trendChartContainer">
          <!-- Populated by AnalyticsChart.js -->
        </div>

        <!-- Profile Completion Score Widget -->
        <div class="glass-panel col-span-4 profile-summary-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div class="profile-header flex-align-center">
            <div class="profile-avatar">${profile.avatar}</div>
            <div class="profile-meta">
              <h3 class="profile-name">${profile.name}</h3>
              <p class="profile-location flex-align-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${profile.location}</span>
              </p>
            </div>
          </div>
          
          <div class="profile-resume-progress" style="margin-top: 1rem;">
            <div class="flex-between">
              <span class="progress-label">Resume Strength</span>
              <span class="progress-pct" style="color: var(--primary-light); font-weight: 700;">${resumeStrength}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${resumeStrength}%;"></div>
            </div>
          </div>

          <div class="profile-skills" style="margin-top: 1rem;">
            <h4 class="skills-title">Core Competencies</h4>
            <div class="skills-flex">
              ${profile.skills.slice(0, 5).map(s => `<span class="skill-tag">${s}</span>`).join('')}
              ${profile.skills.length > 5 ? `<span class="skill-tag" style="background-color: var(--primary-glow); border-color: var(--primary); color: var(--primary-light);">+${profile.skills.length - 5} more</span>` : ''}
            </div>
          </div>
        </div>
      </section>

      <!-- Application stages progress timeline -->
      <section class="glass-panel application-timeline-panel" style="padding: 1.5rem 2rem;">
        <h3 class="panel-title" style="margin-bottom: 1.5rem;">Job Application Funnel Pipeline</h3>
        <div class="pipeline-progress-wrapper" style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 1.5rem;">
          <!-- Connecting Line -->
          <div style="position: absolute; left: 0; right: 0; top: 12px; height: 3px; background-color: var(--bg-tertiary); z-index: 1; display: none;"></div>
          
          <!-- Stage 1 -->
          <div class="pipeline-stage active" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; flex: 1; z-index: 2; min-width: 120px;">
            <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background-color: var(--success); color: #fff; font-size: 0.75rem; font-weight:700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px var(--success-glow);">1</div>
            <span style="font-size: 0.8rem; font-weight:600; color: var(--text-primary);">Profile Setup</span>
          </div>

          <!-- Stage 2 -->
          <div class="pipeline-stage active" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; flex: 1; z-index: 2; min-width: 120px;">
            <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background-color: var(--success); color: #fff; font-size: 0.75rem; font-weight:700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px var(--success-glow);">2</div>
            <span style="font-size: 0.8rem; font-weight:600; color: var(--text-primary);">Applied sent (${stats.applied})</span>
          </div>

          <!-- Stage 3 -->
          <div class="pipeline-stage active" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; flex: 1; z-index: 2; min-width: 120px;">
            <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background-color: var(--primary); color: #fff; font-size: 0.75rem; font-weight:700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px var(--primary-glow);">3</div>
            <span style="font-size: 0.8rem; font-weight:600; color: var(--primary-light);">Resume Screen</span>
          </div>

          <!-- Stage 4 -->
          <div class="pipeline-stage ${stats.interviews > 0 ? 'active' : ''}" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; flex: 1; z-index: 2; min-width: 120px;">
            <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background-color: ${stats.interviews > 0 ? 'var(--primary)' : 'var(--bg-tertiary)'}; color: ${stats.interviews > 0 ? '#fff' : 'var(--text-muted)'}; font-size: 0.75rem; font-weight:700; display: flex; align-items: center; justify-content: center;">4</div>
            <span style="font-size: 0.8rem; font-weight:600; color: ${stats.interviews > 0 ? 'var(--text-primary)' : 'var(--text-muted)'};">Interviews Scheduled</span>
          </div>

          <!-- Stage 5 -->
          <div class="pipeline-stage" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; flex: 1; z-index: 2; min-width: 120px;">
            <div style="width: 26px; height: 26px; border-radius: var(--radius-full); background-color: var(--bg-tertiary); color: var(--text-muted); font-size: 0.75rem; font-weight:700; display: flex; align-items: center; justify-content: center;">5</div>
            <span style="font-size: 0.8rem; font-weight:600; color: var(--text-muted);">Offer Released</span>
          </div>
        </div>
      </section>

      <!-- Bottom Applications and Salaries Insights -->
      <section class="info-details-grid grid-cols-12">
        <!-- Applications History List -->
        <div class="glass-panel col-span-8 recent-apps-panel">
          <div class="panel-header flex-between">
            <h3 class="panel-title">Track Applications</h3>
            <span class="panel-badge badge badge-info">${appliedJobs.length} active</span>
          </div>

          <div class="apps-table-container">
            ${appliedJobs.length === 0 ? `
              <div class="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>No job applications tracked yet.</p>
                <button class="secondary-btn" id="findJobsBtnEmpty">Browse Jobs</button>
              </div>
            ` : `
              <table class="apps-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th></th>
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
                        <button class="action-btn select-job-btn" data-job-id="${job.id}">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>
        </div>

        <!-- Saved Jobs Widget -->
        <div class="glass-panel col-span-4 saved-jobs-widget" style="display: flex; flex-direction: column;">
          <h3 class="panel-title">Saved Jobs Checklist</h3>
          <p class="panel-subtitle" style="margin-bottom: 1rem;">Saved jobs waiting for action</p>
          
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.75rem;">
            ${savedJobs.length === 0 ? `
              <div class="empty-state" style="padding: 1.5rem 0.5rem; gap: 0.5rem;">
                <p style="font-size: 0.8rem;">No saved vacancies.</p>
              </div>
            ` : savedJobs.slice(0, 3).map(job => `
              <div class="saved-job-mini-item flex-between" style="background-color: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--card-border);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="company-logo" style="background-color: ${job.logoBg}; width: 28px; height: 28px; font-size: 0.75rem;">${job.logoText}</div>
                  <div style="line-height: 1.25;">
                    <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${job.title}</h4>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${job.company}</span>
                  </div>
                </div>
                <button class="secondary-btn select-job-btn" data-job-id="${job.id}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;">Apply</button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Advanced Recruiter activities & Recommended vacancies row -->
      <section class="grid-cols-12" style="margin-top: 1.5rem;">
        <!-- Recommended Jobs (Based on skill matches) -->
        <div class="glass-panel col-span-8 recommended-jobs-panel">
          <h3 class="panel-title">Recommended for You</h3>
          <p class="panel-subtitle" style="margin-bottom: 1.25rem;">Based on your Frontend Developer skills match rate</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            ${recommendedJobs.length === 0 ? `
              <div class="empty-state" style="grid-column: 1/-1; padding: 2rem;">
                <p>All matching openings applied. Good job!</p>
              </div>
            ` : recommendedJobs.map(job => {
              // Calculate dynamic match pct based on skills overlap
              const jobReqLower = job.requirements.join(' ').toLowerCase();
              const matchCount = profile.skills.filter(s => jobReqLower.includes(s.toLowerCase())).length;
              const matchPct = Math.min(60 + matchCount * 15, 100);

              return `
                <div class="recommended-card glass-panel" style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.25rem; border-color: var(--card-border);">
                  <div class="flex-between">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <div class="company-logo" style="background-color: ${job.logoBg}; width: 28px; height: 28px; font-size: 0.75rem;">${job.logoText}</div>
                      <span style="font-size: 0.75rem; font-weight:700; color: var(--text-secondary);">${job.company}</span>
                    </div>
                    <span class="badge badge-success" style="font-size: 0.65rem;">${matchPct}% Match</span>
                  </div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${job.title}</h4>
                  <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.45;">${job.description.substring(0, 75)}...</p>
                  <button class="secondary-btn select-job-btn" data-job-id="${job.id}" style="margin-top: auto; padding: 0.4rem; font-size: 0.75rem; width: 100%; justify-content: center;">
                    Apply Shortcut
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Upcoming Interviews Widget -->
        <div class="glass-panel col-span-4 interviews-list-panel">
          <h3 class="panel-title">Upcoming Interviews</h3>
          <p class="panel-subtitle" style="margin-bottom: 1.25rem;">Hiring coordinator meet links</p>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${interviews.length === 0 ? `
              <div class="empty-state" style="padding: 1.5rem 0.5rem;">
                <p style="font-size: 0.8rem;">No scheduled interviews.</p>
              </div>
            ` : interviews.map(i => `
              <div class="interview-card" style="position: relative; padding-left: 1rem; border-left: 3px solid var(--primary); display: flex; flex-direction: column; line-height: 1.35;">
                <span class="interview-company" style="font-size: 0.75rem; font-weight: 700; color: var(--primary-light); text-transform: uppercase;">${i.company}</span>
                <span class="interview-role" style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${i.role}</span>
                <span class="interview-time" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">Date: <strong>${i.date}</strong> @ ${i.time}</span>
                <span class="interview-details" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">Interviewer: ${i.interviewer}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Recruiter Activity widget -->
      <section class="grid-cols-12" style="margin-top: 1.5rem; margin-bottom: 2rem;">
        <!-- Recruiter activities list -->
        <div class="glass-panel col-span-8 recruiter-activity-panel">
          <h3 class="panel-title">Recruiter Activity</h3>
          <p class="panel-subtitle" style="margin-bottom: 1rem;">Updates on your profile search views and CV downloads</p>
          
          <ul class="activity-list" style="display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0;">
            ${recruiterActivity.map(act => `
              <li class="activity-item flex-between" style="padding: 0.75rem; background-color: var(--bg-tertiary); border-radius: var(--radius-md); border: 1px solid var(--card-border);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span class="activity-icon-badge badge badge-${act.type === 'decline' ? 'danger' : act.type === 'download' ? 'info' : 'success'}" style="padding: 0.35rem;">
                    ${act.type === 'decline' ? '✘' : act.type === 'download' ? '⬇' : '👁'}
                  </span>
                  <span style="font-size: 0.85rem; color: var(--text-primary);">
                    <strong>${act.company}</strong> ${act.activity}
                  </span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${act.time}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Recently Viewed Jobs widget -->
        <div class="glass-panel col-span-4 recent-views-panel">
          <h3 class="panel-title">Recently Viewed</h3>
          <p class="panel-subtitle" style="margin-bottom: 1rem;">Positions you recently browsed</p>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${recentlyViewed.length === 0 ? `
              <div class="empty-state" style="padding: 1.5rem 0.5rem;">
                <p style="font-size: 0.8rem;">No recently browsed vacancies.</p>
              </div>
            ` : recentlyViewed.slice(0, 3).map(job => `
              <div class="saved-job-mini-item flex-between select-job-btn" data-job-id="${job.id}" style="background-color: var(--bg-tertiary); padding: 0.65rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--card-border); cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div class="company-logo" style="background-color: ${job.logoBg}; width: 24px; height: 24px; font-size: 0.65rem;">${job.logoText}</div>
                  <div style="line-height: 1.2;">
                    <h4 style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${job.title}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${job.company}</span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;

    // Initialize SVG Chart Component
    const trendChart = new AnalyticsChart('trendChartContainer');
    trendChart.init();
  }

  setupViewEventListeners() {
    // Navigate shortcuts
    const findJobsBtn = this.container.querySelector('#findJobsBtn');
    if (findJobsBtn) {
      findJobsBtn.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('jobs');
      });
    }

    const findJobsBtnEmpty = this.container.querySelector('#findJobsBtnEmpty');
    if (findJobsBtnEmpty) {
      findJobsBtnEmpty.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('jobs');
      });
    }

    const profileBtn = this.container.querySelector('#profileQuickBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('profile');
      });
    }

    const settingsBtn = this.container.querySelector('#settingsQuickBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('settings');
      });
    }

    // Job card / shortcut button click → navigate to jobs with job ID
    this.container.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('.select-job-btn');
      if (targetBtn) {
        const jobId = targetBtn.dataset.jobId;
        if (this.onNavigate) {
          this.onNavigate('jobs', jobId || null);
        }
      }
    });
  }
}
