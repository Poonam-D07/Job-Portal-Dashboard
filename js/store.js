import { mockJobs, mockUserProfile } from './utils/mockData.js';

const DATA_VERSION = 'v4'; // Bump this to force-reset stale localStorage

class Store {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    // Clear stale data if version changed
    const storedVersion = localStorage.getItem('talent_sphere_version');
    if (storedVersion !== DATA_VERSION) {
      localStorage.removeItem('talent_sphere_jobs');
      localStorage.removeItem('talent_sphere_profile');
      localStorage.removeItem('talent_sphere_recent_views');
      localStorage.removeItem('talent_sphere_notifications');
      localStorage.setItem('talent_sphere_version', DATA_VERSION);
    }

    const savedJobs = localStorage.getItem('talent_sphere_jobs');
    const savedProfile = localStorage.getItem('talent_sphere_profile');
    const savedRecent = localStorage.getItem('talent_sphere_recent_views');
    const savedNotifications = localStorage.getItem('talent_sphere_notifications');

    this.state = {
      jobs: savedJobs ? JSON.parse(savedJobs) : this.cloneMockJobs(),
      profile: savedProfile ? JSON.parse(savedProfile) : { ...mockUserProfile },
      recentlyViewed: savedRecent ? JSON.parse(savedRecent) : [],
      notifications: savedNotifications ? JSON.parse(savedNotifications) : [
        {
          id: 1,
          type: 'interview',
          title: 'Interview Scheduled',
          description: 'Accenture scheduled a technical interview for Associate Frontend Engineer role.',
          time: '2 hours ago',
          date: '2026-07-30',
          unread: true,
          icon: 'calendar'
        },
        {
          id: 2,
          type: 'view',
          title: 'Profile Viewed',
          description: 'TCS recruiter viewed your profile and checked your resume for Frontend Developer position.',
          time: '1 day ago',
          date: '2026-07-29',
          unread: true,
          icon: 'eye'
        },
        {
          id: 3,
          type: 'job',
          title: 'New Job Match',
          description: '4 new Frontend Developer openings match your skill profile in Noida and Bengaluru.',
          time: '2 days ago',
          date: '2026-07-28',
          unread: false,
          icon: 'briefcase'
        },
        {
          id: 4,
          type: 'application',
          title: 'Application Status Update',
          description: 'Your application to Wipro for Associate Frontend Developer has been moved to shortlisting stage.',
          time: '3 days ago',
          date: '2026-07-27',
          unread: false,
          icon: 'file'
        },
        {
          id: 5,
          type: 'decline',
          title: 'Application Not Selected',
          description: 'Capgemini updated your application status to Not Selected for Junior Frontend Developer role.',
          time: '5 days ago',
          date: '2026-07-25',
          unread: false,
          icon: 'x'
        },
        {
          id: 6,
          type: 'download',
          title: 'Resume Downloaded',
          description: 'IBM HR team downloaded your resume during initial screening round.',
          time: '6 days ago',
          date: '2026-07-24',
          unread: false,
          icon: 'download'
        },
        {
          id: 7,
          type: 'job',
          title: 'Saved Job Alert',
          description: 'The Oracle UI Developer role you bookmarked is receiving applications. Consider applying soon.',
          time: '1 week ago',
          date: '2026-07-23',
          unread: false,
          icon: 'alert'
        }
      ],
      recruiterActivities: [
        { id: 1, company: 'Accenture', activity: 'viewed your profile', time: '1 day ago', type: 'view' },
        { id: 2, company: 'TCS', activity: 'downloaded your resume', time: '2 days ago', type: 'download' },
        { id: 3, company: 'Wipro', activity: 'viewed your application', time: '4 days ago', type: 'view' },
        { id: 4, company: 'Capgemini', activity: 'declined application', time: '5 days ago', type: 'decline' }
      ],
      interviews: [
        { id: 1, company: 'Accenture', role: 'Associate Frontend Engineer', date: '2026-08-05', time: '14:30', interviewer: 'Ravi Sharma (Noida Hub)', status: 'Scheduled' },
        { id: 2, company: 'TCS', role: 'Frontend Developer (Design System)', date: '2026-08-12', time: '11:00', interviewer: 'Priya Nair (Bengaluru)', status: 'Tentative' }
      ]
    };

    if (!savedJobs) this.saveState();
  }

  cloneMockJobs() {
    return mockJobs.map(j => ({ ...j, bookmarked: false }));
  }

  saveState() {
    localStorage.setItem('talent_sphere_jobs', JSON.stringify(this.state.jobs));
    localStorage.setItem('talent_sphere_profile', JSON.stringify(this.state.profile));
    localStorage.setItem('talent_sphere_recent_views', JSON.stringify(this.state.recentlyViewed));
    localStorage.setItem('talent_sphere_notifications', JSON.stringify(this.state.notifications));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  showToast(message, type = 'success') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }

  // --- Actions ---

  getJobs() {
    return this.state.jobs;
  }

  getJobById(id) {
    return this.state.jobs.find(j => j.id === id);
  }

  getProfile() {
    return this.state.profile;
  }

  getNotifications() {
    return this.state.notifications;
  }

  markNotificationRead(id) {
    this.state.notifications = this.state.notifications.map(n =>
      n.id === id ? { ...n, unread: false } : n
    );
    this.saveState();
    this.notify();
  }

  markAllNotificationsRead() {
    this.state.notifications = this.state.notifications.map(n => ({ ...n, unread: false }));
    this.saveState();
    this.notify();
    this.showToast('All notifications marked as read.', 'success');
  }

  getStats() {
    const appliedJobs = this.state.jobs.filter(j => j.applied);
    const pendingCount = appliedJobs.filter(j => j.status === 'Pending').length;
    const interviewCount = appliedJobs.filter(j => j.status === 'Interview').length;
    const rejectedCount = appliedJobs.filter(j => j.status === 'Rejected').length;
    const savedCount = this.state.jobs.filter(j => j.bookmarked).length;

    return {
      applied: appliedJobs.length,
      pending: pendingCount,
      interviews: interviewCount,
      rejected: rejectedCount,
      saved: savedCount,
      totalSaved: this.state.jobs.length
    };
  }

  applyToJob(jobId) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (job && !job.applied) {
      job.applied = true;
      job.appliedDate = new Date().toISOString().split('T')[0];
      job.status = 'Pending';
      
      this.saveState();
      this.notify();
      this.showToast(`Application submitted to ${job.company}!`, 'success');
      return true;
    }
    return false;
  }

  withdrawApplication(jobId) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (job && job.applied) {
      const company = job.company;
      job.applied = false;
      delete job.appliedDate;
      delete job.status;
      
      this.saveState();
      this.notify();
      this.showToast(`Withdrew application from ${company}`, 'info');
      return true;
    }
    return false;
  }

  toggleBookmark(jobId) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (job) {
      job.bookmarked = !job.bookmarked;
      this.saveState();
      this.notify();
      
      if (job.bookmarked) {
        this.showToast(`Saved ${job.title} at ${job.company}`, 'success');
      } else {
        this.showToast(`Removed bookmark for ${job.title}`, 'info');
      }
      return true;
    }
    return false;
  }

  viewJob(jobId) {
    let recent = this.state.recentlyViewed.filter(id => id !== jobId);
    recent.unshift(jobId);
    if (recent.length > 5) recent.pop();
    this.state.recentlyViewed = recent;
    
    this.saveState();
    this.notify();
  }

  getRecentlyViewed() {
    return this.state.recentlyViewed.map(id => this.getJobById(id)).filter(Boolean);
  }

  getRecommendedJobs() {
    const userSkills = this.state.profile.skills.map(s => s.toLowerCase());
    return this.state.jobs.filter(job => {
      // Find jobs that mention any of the user's skills in their requirements/description
      const matchesSkill = job.requirements.some(req => 
        userSkills.some(skill => req.toLowerCase().includes(skill))
      ) || userSkills.some(skill => job.title.toLowerCase().includes(skill));
      
      return matchesSkill && !job.applied;
    }).slice(0, 3);
  }

  updateProfile(newData) {
    this.state.profile = { ...this.state.profile, ...newData };
    this.saveState();
    this.notify();
    this.showToast('Profile updated successfully!', 'success');
  }

  getRecruiterActivities() {
    return this.state.recruiterActivities;
  }

  getUpcomingInterviews() {
    return this.state.interviews;
  }

  resetStore() {
    localStorage.removeItem('talent_sphere_jobs');
    localStorage.removeItem('talent_sphere_profile');
    localStorage.removeItem('talent_sphere_recent_views');
    localStorage.removeItem('talent_sphere_notifications');
    this.loadState();
    this.notify();
    this.showToast('All local storage data reset.', 'info');
  }
}

export const store = new Store();
