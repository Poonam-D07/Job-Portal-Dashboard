# Task Checklist - TalentSphere Job Portal Dashboard

- [x] **1. Mock Data & Indian Localization Setup**
  - [x] Standardize candidate profile: Poonam Mishra, Frontend Developer (Fresher), Noida, India
  - [x] Standardize companies: Infosys, TCS, Wipro, Accenture, Capgemini, IBM, Oracle, Adobe, Microsoft India
  - [x] Standardize locations: Noida, Gurugram, Pune, Hyderabad, Bengaluru, Chennai
  - [x] Standardize salary format: ₹4.5 LPA, ₹6 LPA, ₹8 LPA, ₹10 LPA, ₹12 LPA
  - [x] Replace any leftover placeholder data (e.g., Meta, Google) in notifications/logs with Indian enterprise companies

- [x] **2. Link & Register `AboutView.js`**
  - [x] Import and register `AboutView` in `js/app.js` router
  - [x] Add `About` navigation link to `js/components/Sidebar.js`

- [x] **3. Centralize Notifications in `store.js`**
  - [x] Add `notifications` array to `store.js` initial state
  - [x] Add `getNotifications()`, `markNotificationRead(id)`, and `markAllNotificationsRead()` actions to `store.js`
  - [x] Update `Header.js` to use centralized notifications store
  - [x] Update `NotificationsView.js` to use centralized notifications store

- [x] **4. Fix Broken Salary Sorting in `JobsView.js`**
  - [x] Fix LPA salary parsing logic for `salary-desc` and `salary-asc` sorting

- [x] **5. Fix UI & Sync Bugs**
  - [x] Sync `Header.js` theme toggle icon when theme changes via `SettingsView.js`
  - [x] Fix event delegation handling on card bookmarks in `JobsView.js`
  - [x] Ensure dynamic stats calculation across views
