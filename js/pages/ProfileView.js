import { store } from '../store.js';

export class ProfileView {
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

  handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show mock loading state for upload
    const uploadBtn = this.container.querySelector('.resume-upload-wrapper');
    const originalHTML = uploadBtn.innerHTML;
    
    uploadBtn.innerHTML = `
      <div class="skeleton-loader" style="height: 50px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; width: 100%;">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary-light);">Uploading resume...</span>
      </div>
    `;

    setTimeout(() => {
      // Restore button HTML and trigger store toast
      uploadBtn.innerHTML = originalHTML;
      store.showToast(`Resume "${file.name}" uploaded successfully!`, 'success');
      
      // Update store state with mock resume strength increment
      store.updateProfile({
        resumeName: file.name,
        resumeUploadedDate: new Date().toISOString().split('T')[0]
      });
    }, 2000);
  }

  addNewSkill() {
    const input = this.container.querySelector('#newSkillInput');
    const skillName = input.value.trim();
    if (!skillName) return;

    const profile = store.getProfile();
    if (profile.skills.includes(skillName)) {
      store.showToast('Skill already exists!', 'warning');
      return;
    }

    const updatedSkills = [...profile.skills, skillName];
    store.updateProfile({ skills: updatedSkills });
    input.value = '';
  }

  removeSkill(skillToRemove) {
    const profile = store.getProfile();
    const updatedSkills = profile.skills.filter(s => s !== skillToRemove);
    store.updateProfile({ skills: updatedSkills });
  }

  render() {
    if (!this.container) return;

    const profile = store.getProfile();
    const stats = store.getStats();

    // Calculate dynamic strength based on skill counts (base 60% + 4% per skill, capped at 100%)
    const skillCount = profile.skills.length;
    const resumeStrength = Math.min(60 + skillCount * 4, 100);

    this.container.innerHTML = `
      <section class="page-intro">
        <h2 class="hero-title">Candidate Profile</h2>
        <p class="hero-subtitle">Manage your resume, developer skills, and education details.</p>
      </section>

      <div class="grid-cols-12">
        <!-- Left Column: Core Info & Resume -->
        <div class="col-span-8 flex-col-gap" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Profile Main Card -->
          <div class="glass-panel profile-banner-card">
            <div class="profile-card-layout flex-align-center" style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
              <div class="profile-big-avatar" style="width: 80px; height: 80px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: #fff; font-size: 2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px var(--primary-glow); flex-shrink:0;">
                ${profile.avatar}
              </div>
              <div class="profile-banner-details" style="flex: 1;">
                <div class="flex-between" style="align-items: flex-start;">
                  <div>
                    <h3 class="profile-title" style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${profile.name}</h3>
                    <p style="color: var(--primary-light); font-weight: 600; font-size: 0.95rem; margin-top: 0.15rem;">${profile.role}</p>
                    <p class="profile-location flex-align-center" style="margin-top: 0.4rem;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 0.25rem;">${profile.location}</span>
                    </p>
                  </div>
                  <button class="secondary-btn" id="editProfileBtn" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Edit Settings</button>
                </div>
              </div>
            </div>
            
            <div class="profile-about-summary" style="margin-top: 1.5rem; border-top: 1px solid var(--card-border); padding-top: 1.25rem;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Professional Summary</h4>
              <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
                Enthusiastic and detail-oriented Frontend Developer Graduate from Noida, India. Passionate about building premium, highly-interactive user experiences with clean HTML, modern CSS paradigms, and Vanilla ES6 JavaScript. Experienced in building responsive interfaces, single-page application systems, and integrating state stores. Cares deeply about clean architecture, speed, accessibility (WCAG), and responsive layouts.
              </p>
            </div>
          </div>

          <!-- Resume Attachment Card -->
          <div class="glass-panel resume-manager-card">
            <h3 class="panel-title">Resume Attachment</h3>
            <p class="panel-subtitle" style="margin-bottom: 1.25rem;">Upload or update your CV to share with recruiters automatically.</p>
            
            <div class="flex-align-center" style="background-color: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
              <div style="background-color: var(--primary-glow); padding: 0.75rem; border-radius: var(--radius-md); color: var(--primary-light); flex-shrink: 0;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div style="flex: 1; line-height: 1.3;">
                <h4 style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${profile.resumeName || 'Poonam_Mishra_Frontend_Dev.pdf'}</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">Size: 1.2 MB • Uploaded on: ${profile.resumeUploadedDate || '2026-07-28'}</p>
              </div>
              <span class="badge badge-success">Verified</span>
            </div>

            <div class="resume-upload-wrapper" style="margin-top: 1.25rem;">
              <label for="resumeFilePicker" class="primary-btn" style="width: 100%; display: inline-flex; justify-content: center; cursor: pointer;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Upload New Resume (.pdf)</span>
              </label>
              <input type="file" id="resumeFilePicker" accept=".pdf" style="display: none;">
            </div>
          </div>

          <!-- Academic History / Projects -->
          <div class="glass-panel profile-education-card">
            <h3 class="panel-title" style="margin-bottom: 1.25rem;">Education & Projects</h3>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <!-- Education Block -->
              <div style="position: relative; padding-left: 1.5rem; border-left: 2px solid var(--primary-glow);">
                <div style="position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: var(--radius-full); background-color: var(--primary); border: 2px solid var(--bg-secondary);"></div>
                <span class="badge badge-info" style="font-size: 0.65rem; padding: 0.15rem 0.5rem; margin-bottom: 0.35rem;">2022 - 2026</span>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">B.Tech in Computer Science & Engineering</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.1rem;">Noida Institute of Engineering & Technology (NIET)</p>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Completed studies in Web Engineering, Algorithms, Database Management, and UI/UX Design. CGPA: 8.4/10</p>
              </div>

              <!-- Projects Block -->
              <div style="position: relative; padding-left: 1.5rem; border-left: 2px solid var(--primary-glow);">
                <div style="position: absolute; left: -6px; top: 4px; width: 10px; height: 10px; border-radius: var(--radius-full); background-color: var(--primary); border: 2px solid var(--bg-secondary);"></div>
                <span class="badge badge-success" style="font-size: 0.65rem; padding: 0.15rem 0.5rem; margin-bottom: 0.35rem;">Featured Portfolio Project</span>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">TalentSphere: Interactive Job Portal</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.1rem;">HTML5, CSS3 Grid/Flexbox, Vanilla JS ES6 modules, LocalStorage Store</p>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Built a professional applicant tracking system client interface from scratch. Includes state managers, mathematical SVG funnels, collapsible responsive layouts, and debounced text search engines.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Skills matches and Strength -->
        <div class="col-span-4 flex-col-gap" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Resume Strength Panel -->
          <div class="glass-panel score-card-wrapper" style="text-align: center; display: flex; flex-direction: column; align-items: center; padding: 2rem 1.5rem;">
            <h3 class="panel-title" style="margin-bottom: 1rem;">Profile Completion</h3>
            
            <div class="strength-gauge-wrapper" style="position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
              <!-- Circle Progress svg -->
              <svg width="120" height="120" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-tertiary)" stroke-width="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="${314 - (314 * resumeStrength) / 100}" stroke-linecap="round" style="transition: stroke-dashoffset 0.5s ease;" />
              </svg>
              <div style="position: absolute; display: flex; flex-direction: column; line-height: 1.1;">
                <span style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${resumeStrength}%</span>
                <span style="font-size: 0.65rem; color: var(--text-muted); font-weight:600; text-transform: uppercase;">Strength</span>
              </div>
            </div>

            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              Your profile is matching <strong>${skillCount} core skills</strong>. Add more tech competencies to raise your score.
            </p>
          </div>

          <!-- Add / Manage Skills Panel -->
          <div class="glass-panel skills-manager-card">
            <h3 class="panel-title" style="margin-bottom: 0.75rem;">Manage Skills</h3>
            <p class="panel-subtitle" style="margin-bottom: 1.25rem;">Add technical competencies to boost your matching rate.</p>

            <div class="skills-flex" style="margin-bottom: 1.25rem;">
              ${profile.skills.map(skill => `
                <span class="skill-tag" style="display: inline-flex; align-items: center; gap: 0.25rem;">
                  <span>${skill}</span>
                  <button class="remove-skill-btn" data-skill="${skill}" aria-label="Remove skill ${skill}" style="color: var(--danger-text); padding: 0.15rem; font-weight: 700;">&times;</button>
                </span>
              `).join('')}
            </div>

            <div class="skill-adder-field" style="display: flex; gap: 0.5rem; border-top: 1px solid var(--card-border); padding-top: 1rem;">
              <input type="text" id="newSkillInput" placeholder="Add skill (e.g. Git, Sass)" aria-label="New skill name" style="background-color: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 0.5rem; flex: 1; font-size: 0.85rem; color: var(--text-primary);">
              <button class="primary-btn" id="addSkillBtn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Add</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Navigate to edit profile/settings
    const editBtn = this.container.querySelector('#editProfileBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (this.onNavigate) this.onNavigate('settings');
      });
    }

    // Add skill event listeners
    const addBtn = this.container.querySelector('#addSkillBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addNewSkill());
    }

    const input = this.container.querySelector('#newSkillInput');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addNewSkill();
        }
      });
    }

    // Remove skill click delegates
    this.container.addEventListener('click', (e) => {
      const rmBtn = e.target.closest('.remove-skill-btn');
      if (rmBtn) {
        const skill = rmBtn.dataset.skill;
        this.removeSkill(skill);
      }
    });

    // File picker change event
    const filePicker = this.container.querySelector('#resumeFilePicker');
    if (filePicker) {
      filePicker.addEventListener('change', (e) => this.handleResumeUpload(e));
    }
  }
}
