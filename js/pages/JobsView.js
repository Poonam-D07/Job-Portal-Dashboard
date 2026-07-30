import { store } from '../store.js';
import { Modal } from '../components/Modal.js';

export class JobsView {
  constructor(containerId, initialJobId = null, onNavigate = null) {
    this.container = document.getElementById(containerId);
    this.initialJobId = initialJobId;
    this.onNavigate = onNavigate;
    this.unsubscribe = null;
    this.modal = null;

    // Search and advanced filter state
    this.filters = {
      search: '',
      location: 'all',
      experience: 'all',
      type: 'all',
      salary: 'all',
      sort: 'latest'
    };

    // Pagination state
    this.currentPage = 1;
    this.itemsPerPage = 4;

    // Mock search loader state
    this.isLoading = false;
  }

  init() {
    this.modal = new Modal((jobId) => {
      this.renderJobList();
    });

    this.unsubscribe = store.subscribe(() => {
      this.renderJobList();
    });

    this.render();
    this.setupFiltersListeners();
    this.renderJobList();

    if (this.initialJobId) {
      const job = store.getJobById(this.initialJobId);
      if (job) {
        store.viewJob(job.id);
        setTimeout(() => this.modal.open(job), 100);
      }
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.modal) this.modal.close();
  }

  triggerSearchLoading() {
    this.isLoading = true;
    this.renderJobList();
    
    // Simulate database lookup latency for premium feel
    setTimeout(() => {
      this.isLoading = false;
      this.renderJobList();
    }, 450);
  }

  render() {
    if (!this.container) return;

    const jobs = store.getJobs();
    // Unique list of raw location tags
    const locations = [...new Set(jobs.map(j => {
      const parts = j.location.split(' (');
      return parts[0].split(', ')[0];
    }))];

    this.container.innerHTML = `
      <!-- Filters header control panel -->
      <section class="jobs-control-panel glass-panel">
        <div class="search-field-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="jobSearchInput" placeholder="Search roles, skills, or companies..." aria-label="Search jobs" value="${this.filters.search}">
        </div>

        <div class="filters-flex-row" style="display: flex; gap: 0.75rem; flex-wrap: wrap; width: 100%;">
          <!-- Location select -->
          <div class="filter-dropdown-wrapper">
            <label for="locationFilter" class="sr-only">Location</label>
            <select id="locationFilter">
              <option value="all">Any Location</option>
              <option value="remote" ${this.filters.location === 'remote' ? 'selected' : ''}>Remote Only</option>
              ${locations.map(loc => `
                <option value="${loc.toLowerCase()}" ${this.filters.location === loc.toLowerCase() ? 'selected' : ''}>${loc}</option>
              `).join('')}
            </select>
          </div>

          <!-- Experience Select -->
          <div class="filter-dropdown-wrapper">
            <label for="experienceFilter" class="sr-only">Experience</label>
            <select id="experienceFilter">
              <option value="all" ${this.filters.experience === 'all' ? 'selected' : ''}>Any Experience</option>
              <option value="fresher" ${this.filters.experience === 'fresher' ? 'selected' : ''}>Fresher / Entry (0-2 yrs)</option>
              <option value="junior" ${this.filters.experience === 'junior' ? 'selected' : ''}>Junior / Mid</option>
              <option value="senior" ${this.filters.experience === 'senior' ? 'selected' : ''}>Senior / Mid-Senior</option>
            </select>
          </div>

          <!-- Salary range Select -->
          <div class="filter-dropdown-wrapper">
            <label for="salaryFilter" class="sr-only">Salary Range</label>
            <select id="salaryFilter">
              <option value="all" ${this.filters.salary === 'all' ? 'selected' : ''}>Any Salary</option>
              <option value="inr" ${this.filters.salary === 'inr' ? 'selected' : ''}>Rupee Packages (INR)</option>
              <option value="usd" ${this.filters.salary === 'usd' ? 'selected' : ''}>Dollar Packages (USD)</option>
            </select>
          </div>

          <!-- Sort Select -->
          <div class="filter-dropdown-wrapper" style="margin-left: auto;">
            <label for="sortJobsSelect" class="sr-only">Sort by</label>
            <select id="sortJobsSelect" style="color: var(--primary-light); font-weight: 600;">
              <option value="latest" ${this.filters.sort === 'latest' ? 'selected' : ''}>Sort by: Latest</option>
              <option value="salary-desc" ${this.filters.sort === 'salary-desc' ? 'selected' : ''}>Salary: High to Low</option>
              <option value="salary-asc" ${this.filters.sort === 'salary-asc' ? 'selected' : ''}>Salary: Low to High</option>
            </select>
          </div>
        </div>

        <div class="job-types-flex" style="width: 100%; border-top: 1px solid var(--card-border); padding-top: 0.75rem;">
          <button class="filter-type-btn ${this.filters.type === 'all' ? 'active' : ''}" data-type="all">All Types</button>
          <button class="filter-type-btn ${this.filters.type === 'full-time' ? 'active' : ''}" data-type="full-time">Full-time</button>
          <button class="filter-type-btn ${this.filters.type === 'remote' ? 'active' : ''}" data-type="remote">Remote Only</button>
          <button class="filter-type-btn ${this.filters.type === 'contract' ? 'active' : ''}" data-type="contract">Contract Basis</button>
        </div>
      </section>

      <!-- Active filter status -->
      <div class="active-filters-info flex-between" id="filterStatusInfo" style="display: none;">
        <span class="filter-summary-text">Showing job matches</span>
        <button class="clear-filters-btn" id="clearFiltersBtn">Reset Filters</button>
      </div>

      <!-- Job Cards Grid Container -->
      <section class="jobs-feed-grid" id="jobsFeedGrid">
        <!-- Renders skeleton cards or actual cards list -->
      </section>

      <!-- Pagination Footer Bar -->
      <nav class="pagination-container flex-between" id="jobsPagination" aria-label="Job Search Pagination" style="margin-top: 2rem;"></nav>
    `;
  }

  renderJobList() {
    const grid = this.container.querySelector('#jobsFeedGrid');
    const pagination = this.container.querySelector('#jobsPagination');
    if (!grid || !pagination) return;

    if (this.isLoading) {
      this.renderSkeletons(grid);
      pagination.style.display = 'none';
      return;
    }

    const jobs = store.getJobs();
    
    // 1. Filtering logic
    let filteredJobs = jobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(this.filters.search.toLowerCase()) || 
                          job.company.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                          job.description.toLowerCase().includes(this.filters.search.toLowerCase());
      
      let matchLocation = true;
      if (this.filters.location === 'remote') {
        matchLocation = job.location.toLowerCase().includes('remote');
      } else if (this.filters.location !== 'all') {
        matchLocation = job.location.toLowerCase().includes(this.filters.location);
      }

      let matchType = true;
      if (this.filters.type === 'remote') {
        matchType = job.location.toLowerCase().includes('remote');
      } else if (this.filters.type !== 'all') {
        matchType = job.type.toLowerCase() === this.filters.type;
      }

      let matchExp = true;
      if (this.filters.experience === 'fresher') {
        matchExp = job.experience.toLowerCase().includes('fresher') || job.experience.toLowerCase().includes('entry');
      } else if (this.filters.experience === 'junior') {
        matchExp = job.experience.toLowerCase().includes('junior') || job.experience.toLowerCase().includes('mid');
      } else if (this.filters.experience === 'senior') {
        matchExp = job.experience.toLowerCase().includes('senior') || job.experience.toLowerCase().includes('staff') || job.experience.toLowerCase().includes('principal');
      }

      let matchSal = true;
      if (this.filters.salary === 'inr') {
        matchSal = job.salary.includes('₹');
      } else if (this.filters.salary === 'usd') {
        matchSal = job.salary.includes('$');
      }

      return matchSearch && matchLocation && matchType && matchExp && matchSal;
    });

    // 2. Sorting logic
    filteredJobs.sort((a, b) => {
      if (this.filters.sort === 'salary-desc' || this.filters.sort === 'salary-asc') {
        const getVal = (str) => {
          if (!str) return 0;
          const matched = str.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
          if (!matched) return 0;
          let num = parseFloat(matched[0]);
          if (str.toUpperCase().includes('LPA')) {
            num *= 100000;
          } else if (str.toLowerCase().includes('/ mo') || str.toLowerCase().includes('month')) {
            num *= 12;
          }
          return num;
        };
        const valA = getVal(a.salary);
        const valB = getVal(b.salary);
        return this.filters.sort === 'salary-desc' ? valB - valA : valA - valB;
      }
      return 0; // maintain default catalog sorting
    });

    // Toggle active filters info bar
    const infoBar = this.container.querySelector('#filterStatusInfo');
    if (infoBar) {
      const isFiltered = this.filters.search !== '' || this.filters.location !== 'all' || 
                         this.filters.type !== 'all' || this.filters.experience !== 'all' || 
                         this.filters.salary !== 'all';
      infoBar.style.display = isFiltered ? 'flex' : 'none';
      if (isFiltered) {
        const text = infoBar.querySelector('.filter-summary-text');
        text.textContent = `Found ${filteredJobs.length} matching job vacancies`;
      }
    }

    if (filteredJobs.length === 0) {
      grid.innerHTML = `
        <div class="glass-panel no-jobs-fallback">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No vacancy matches found</h3>
          <p>Try refining your search queries or clearing current category filters.</p>
        </div>
      `;
      pagination.style.display = 'none';
      return;
    }

    // 3. Pagination slicing
    const totalPages = Math.ceil(filteredJobs.length / this.itemsPerPage);
    if (this.currentPage > totalPages) this.currentPage = totalPages || 1;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    // Render Cards
    grid.innerHTML = paginatedJobs.map(job => `
      <article class="glass-panel job-card ${job.applied ? 'applied' : ''}" data-job-id="${job.id}">
        <div class="card-top flex-between">
          <div class="company-badge-row flex-align-center">
            <div class="company-logo" style="background-color: ${job.logoBg}">${job.logoText}</div>
            <div class="company-info">
              <h4 class="company-title">${job.company}</h4>
              <span class="job-post-time">${job.posted}</span>
            </div>
          </div>
          <button class="bookmark-btn ${job.bookmarked ? 'active' : ''}" data-job-id="${job.id}" aria-label="${job.bookmarked ? 'Remove Bookmark' : 'Bookmark Job'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${job.bookmarked ? 'var(--warning-text)' : 'none'}" stroke="${job.bookmarked ? 'var(--warning-text)' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    `).join('');

    // Render Pagination Controls
    pagination.style.display = totalPages > 1 ? 'flex' : 'none';
    if (totalPages > 1) {
      pagination.innerHTML = `
        <button class="secondary-btn prev-page-btn" ${this.currentPage === 1 ? 'disabled' : ''} style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
          Previous
        </button>
        <span style="font-size: 0.85rem; font-weight:600; color: var(--text-secondary);">Page ${this.currentPage} of ${totalPages}</span>
        <button class="secondary-btn next-page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
          Next
        </button>
      `;
    }
  }

  renderSkeletons(grid) {
    let skeletonsHTML = '';
    for (let i = 0; i < this.itemsPerPage; i++) {
      skeletonsHTML += `
        <div class="skeleton-card glass-panel">
          <div class="skeleton-logo"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-footer"></div>
        </div>
      `;
    }
    grid.innerHTML = skeletonsHTML;
  }

  setupFiltersListeners() {
    const searchInput = this.container.querySelector('#jobSearchInput');
    const locationSelect = this.container.querySelector('#locationFilter');
    const expSelect = this.container.querySelector('#experienceFilter');
    const salSelect = this.container.querySelector('#salaryFilter');
    const sortSelect = this.container.querySelector('#sortJobsSelect');
    const typeBtnContainer = this.container.querySelector('.job-types-flex');
    const clearBtn = this.container.querySelector('#clearFiltersBtn');
    const pagination = this.container.querySelector('#jobsPagination');

    // Debounced text search inputs
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filters.search = e.target.value;
          this.currentPage = 1; // reset page on filter change
          this.triggerSearchLoading();
        }, 300);
      });
    }

    // Select input changes
    const changeHandler = (key, event) => {
      this.filters[key] = event.target.value;
      this.currentPage = 1;
      this.triggerSearchLoading();
    };

    if (locationSelect) locationSelect.addEventListener('change', (e) => changeHandler('location', e));
    if (expSelect) expSelect.addEventListener('change', (e) => changeHandler('experience', e));
    if (salSelect) salSelect.addEventListener('change', (e) => changeHandler('salary', e));
    if (sortSelect) sortSelect.addEventListener('change', (e) => changeHandler('sort', e));

    // Type button click filters
    if (typeBtnContainer) {
      typeBtnContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-type-btn');
        if (btn) {
          typeBtnContainer.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.filters.type = btn.dataset.type;
          this.currentPage = 1;
          this.triggerSearchLoading();
        }
      });
    }

    // Reset filters click
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.filters = { search: '', location: 'all', experience: 'all', type: 'all', salary: 'all', sort: 'latest' };
        this.currentPage = 1;
        if (searchInput) searchInput.value = '';
        if (locationSelect) locationSelect.value = 'all';
        if (expSelect) expSelect.value = 'all';
        if (salSelect) salSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'latest';
        if (typeBtnContainer) {
          typeBtnContainer.querySelectorAll('.filter-type-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === 'all');
          });
        }
        this.triggerSearchLoading();
      });
    }

    // Pagination prev/next delegates
    if (pagination) {
      pagination.addEventListener('click', (e) => {
        const prevBtn = e.target.closest('.prev-page-btn');
        const nextBtn = e.target.closest('.next-page-btn');
        
        if (prevBtn && !prevBtn.disabled && this.currentPage > 1) {
          this.currentPage--;
          this.renderJobList();
        }
        if (nextBtn && !nextBtn.disabled) {
          this.currentPage++;
          this.renderJobList();
        }
      });
    }

    // Bookmark toggles on the cards
    this.container.addEventListener('click', (e) => {
      const bookmarkBtn = e.target.closest('.bookmark-btn');
      if (bookmarkBtn) {
        e.stopImmediatePropagation();
        const jobId = bookmarkBtn.dataset.jobId;
        store.toggleBookmark(jobId);
      }
    });

    // Detail modal delegates
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.job-card');
      const actionBtn = e.target.closest('.view-job-btn');
      
      if (card && (actionBtn || !e.target.closest('.bookmark-btn'))) {
        const jobId = card.dataset.jobId;
        const job = store.getJobById(jobId);
        if (job) {
          store.viewJob(job.id); // Add to recently viewed lists
          this.modal.open(job);
        }
      }
    });
  }
}
