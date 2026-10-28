/**
 * ScholarLib — College Library Management System
 * Core Client Application Controller (Vanilla JavaScript)
 */

(function () {
  'use strict';

  // --- STATE ---
  let currentUser = null;
  let allCategories = [];
  let dashboardStats = null;
  let cachedBooks = [];
  let cachedAvailableBooks = [];
  let cachedTransactions = [];
  let cachedStudents = [];

  // DOM Elements cache
  const elements = {
    sidebar: document.getElementById('sidebar'),
    mobileToggle: document.getElementById('mobile-sidebar-toggle'),
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view-section'),
    toastContainer: document.getElementById('toast-container'),

    // User info & Role
    currentUserAvatar: document.getElementById('current-user-avatar'),
    currentUserName: document.getElementById('current-user-name'),
    currentUserRole: document.getElementById('current-user-role'),
    roleButtons: document.querySelectorAll('.role-btn'),
    btnAuthAction: document.getElementById('btn-auth-action'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    storageModeIndicator: document.getElementById('storage-mode-indicator'),
    storageModeText: document.getElementById('storage-mode-text'),

    // Sidebar Badges
    sidebarAvailableCount: document.getElementById('sidebar-available-count'),
    sidebarTotalCount: document.getElementById('sidebar-total-count'),
    sidebarIssuedCount: document.getElementById('sidebar-issued-count'),

    // Global Search
    globalSearchInput: document.getElementById('global-search-input'),

    // Dashboard Stats
    statTotalTitles: document.getElementById('stat-total-titles'),
    statPhysicalCopies: document.getElementById('stat-physical-copies'),
    statAvailableCopies: document.getElementById('stat-available-copies'),
    statIssuedCopies: document.getElementById('stat-issued-copies'),
    statStudents: document.getElementById('stat-students'),
    statLibrarians: document.getElementById('stat-librarians'),
    statOverdueTxns: document.getElementById('stat-overdue-txns'),
    statFines: document.getElementById('stat-fines'),
    dashboardAvailableList: document.getElementById('dashboard-available-books-list'),
    dashboardRecentList: document.getElementById('dashboard-recent-books-list'),
    btnDashboardViewAllAvailable: document.getElementById('btn-dashboard-view-all-available'),
    btnQuickAddBook: document.getElementById('btn-quick-add-book'),

    // Available Books Page
    availableSearchInput: document.getElementById('available-search-input'),
    availableCategoryFilter: document.getElementById('available-category-filter'),
    availableSortFilter: document.getElementById('available-sort-filter'),
    availableBooksGrid: document.getElementById('available-books-grid'),
    availableEmptyState: document.getElementById('available-empty-state'),
    badgeAvailableSummary: document.getElementById('badge-available-summary'),
    btnResetAvailableFilters: document.getElementById('btn-reset-available-filters'),

    // Catalog Page
    catalogSearchInput: document.getElementById('catalog-search-input'),
    catalogCategoryFilter: document.getElementById('catalog-category-filter'),
    catalogAvailabilityFilter: document.getElementById('catalog-availability-filter'),
    catalogSortFilter: document.getElementById('catalog-sort-filter'),
    catalogBooksGrid: document.getElementById('catalog-books-grid'),
    catalogEmptyState: document.getElementById('catalog-empty-state'),
    btnCatalogAddBook: document.getElementById('btn-catalog-add-book'),

    // Issue Book
    formIssueBook: document.getElementById('form-issue-book'),
    issueStudentSearch: document.getElementById('issue-student-search'),
    issueStudentPreview: document.getElementById('issue-student-preview'),
    issueSelectedStudentId: document.getElementById('issue-selected-student-id'),
    issueBookSearch: document.getElementById('issue-book-search'),
    issueBookPreview: document.getElementById('issue-book-preview'),
    issueSelectedBookId: document.getElementById('issue-selected-book-id'),
    issueDate: document.getElementById('issue-date'),
    issueDueDate: document.getElementById('issue-due-date'),
    issueNotes: document.getElementById('issue-notes'),

    // Return Book
    returnSearchInput: document.getElementById('return-search-input'),
    returnTbody: document.getElementById('return-transactions-tbody'),
    returnEmptyState: document.getElementById('return-empty-state'),

    // Students Management
    studentSearchInput: document.getElementById('student-search-input'),
    studentsTbody: document.getElementById('students-tbody'),
    btnOpenRegisterStudentModal: document.getElementById('btn-open-register-student-modal'),
    formRegisterStudent: document.getElementById('form-register-student'),

    // Librarians Management
    librariansTbody: document.getElementById('librarians-tbody'),
    btnOpenAddLibrarianModal: document.getElementById('btn-open-add-librarian-modal'),
    formAddLibrarian: document.getElementById('form-add-librarian'),

    // Student Portal (My Loans)
    myLoansTbody: document.getElementById('my-loans-tbody'),

    // Settings
    formSettings: document.getElementById('form-settings'),
    settingCollegeName: document.getElementById('setting-college-name'),
    settingLoanDays: document.getElementById('setting-loan-days'),
    settingFineRate: document.getElementById('setting-fine-rate'),
    settingMaxLimit: document.getElementById('setting-max-limit'),
    settingsStorageModeDisplay: document.getElementById('settings-storage-mode-display'),
    btnShowSheetsGuide: document.getElementById('btn-show-sheets-guide'),

    // Modals & Forms
    modalAddBook: document.getElementById('modal-add-book'),
    formAddBook: document.getElementById('form-add-book'),
    modalEditBook: document.getElementById('modal-edit-book'),
    formEditBook: document.getElementById('form-edit-book'),
    modalBookDetails: document.getElementById('modal-book-details'),
    btnDetailIssueBook: document.getElementById('btn-detail-issue-book'),
    modalRegisterStudent: document.getElementById('modal-register-student'),
    modalAddLibrarian: document.getElementById('modal-add-librarian'),
    modalSheetsGuide: document.getElementById('modal-sheets-guide'),
    categoryDatalist: document.getElementById('category-datalist')
  };

  // --- THEME MANAGEMENT ---
  function initTheme() {
    const savedTheme = localStorage.getItem('scholarlib_theme') || 'dark';
    applyTheme(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scholarlib_theme', theme);
    const icon = document.querySelector('#btn-theme-toggle .theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  // --- INITIALIZATION ---
  async function init() {
    initTheme();

    const cachedUser = API.getCurrentUser();
    if (cachedUser && (cachedUser.email === 'admin@college.edu' || cachedUser.role === 'admin')) {
      cachedUser.name = 'Prof. ARCHANA .R';
      API.setCurrentUser(cachedUser);
    }

    setupEventListeners();
    setupDateDefaults();

    // Default to Admin login session for instant review
    await switchRole('admin', true);

    await loadInitialData();
  }

  // Set default dates for Issue Form (Issue Date = today, Due Date = +14 days)
  function setupDateDefaults() {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const formatDateInput = d => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (elements.issueDate) elements.issueDate.value = formatDateInput(today);
    if (elements.issueDueDate) elements.issueDueDate.value = formatDateInput(dueDate);
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Navigation items
    elements.navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        switchView(viewId);
        if (window.innerWidth <= 900) {
          elements.sidebar.classList.remove('open');
        }
      });
    });

    // Mobile sidebar toggle
    if (elements.mobileToggle) {
      elements.mobileToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
      });
    }

    // Theme Toggle
    if (elements.btnThemeToggle) {
      elements.btnThemeToggle.addEventListener('click', toggleTheme);
    }

    // Role switcher buttons in header
    elements.roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        switchRole(role);
      });
    });

    // Logout / Relogin button
    if (elements.btnAuthAction) {
      elements.btnAuthAction.addEventListener('click', () => {
        if (confirm(`You are currently logged in as ${currentUser ? currentUser.name : 'Guest'}. Log out and reset session?`)) {
          API.logout();
          showToast('Session logged out.', 'info');
          switchRole('student');
        }
      });
    }

    // Global Search
    let searchDebounce;
    if (elements.globalSearchInput) {
      elements.globalSearchInput.addEventListener('input', e => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          const query = e.target.value.trim();
          if (query) {
            switchView('available-books');
            elements.availableSearchInput.value = query;
            loadAvailableBooks();
          }
        }, 300);
      });
    }

    // Available Books Page Filter Listeners
    if (elements.availableSearchInput) {
      elements.availableSearchInput.addEventListener('input', () => debounce(loadAvailableBooks, 300)());
    }
    if (elements.availableCategoryFilter) {
      elements.availableCategoryFilter.addEventListener('change', loadAvailableBooks);
    }
    if (elements.availableSortFilter) {
      elements.availableSortFilter.addEventListener('change', loadAvailableBooks);
    }
    if (elements.btnResetAvailableFilters) {
      elements.btnResetAvailableFilters.addEventListener('click', () => {
        elements.availableSearchInput.value = '';
        elements.availableCategoryFilter.value = 'All';
        elements.availableSortFilter.value = 'recent';
        loadAvailableBooks();
      });
    }

    // Catalog Filters
    if (elements.catalogSearchInput) {
      elements.catalogSearchInput.addEventListener('input', () => debounce(loadCatalogBooks, 300)());
    }
    if (elements.catalogCategoryFilter) {
      elements.catalogCategoryFilter.addEventListener('change', loadCatalogBooks);
    }
    if (elements.catalogAvailabilityFilter) {
      elements.catalogAvailabilityFilter.addEventListener('change', loadCatalogBooks);
    }
    if (elements.catalogSortFilter) {
      elements.catalogSortFilter.addEventListener('change', loadCatalogBooks);
    }

    // Quick Add Book Buttons
    if (elements.btnQuickAddBook) {
      elements.btnQuickAddBook.addEventListener('click', () => openModal(elements.modalAddBook));
    }
    if (elements.btnCatalogAddBook) {
      elements.btnCatalogAddBook.addEventListener('click', () => openModal(elements.modalAddBook));
    }

    // Dashboard View All Available
    if (elements.btnDashboardViewAllAvailable) {
      elements.btnDashboardViewAllAvailable.addEventListener('click', () => {
        switchView('available-books');
      });
    }

    // Quick Action shortcuts on Dashboard
    const qaIssue = document.getElementById('qa-issue');
    const qaReturn = document.getElementById('qa-return');
    const qaAdd = document.getElementById('qa-add');
    const qaStudents = document.getElementById('qa-students');

    if (qaIssue) qaIssue.addEventListener('click', () => switchView('issue-book'));
    if (qaReturn) qaReturn.addEventListener('click', () => switchView('return-book'));
    if (qaAdd) qaAdd.addEventListener('click', () => openModal(elements.modalAddBook));
    if (qaStudents) qaStudents.addEventListener('click', () => switchView('students-mgmt'));

    // Modal Close Buttons (data-close attributes)
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-close');
        const modal = document.getElementById(targetId);
        if (modal) closeModal(modal);
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Form Submissions
    if (elements.formAddBook) elements.formAddBook.addEventListener('submit', handleAddBookSubmit);
    if (elements.formEditBook) elements.formEditBook.addEventListener('submit', handleEditBookSubmit);
    if (elements.formIssueBook) elements.formIssueBook.addEventListener('submit', handleIssueBookSubmit);
    if (elements.formRegisterStudent) elements.formRegisterStudent.addEventListener('submit', handleRegisterStudentSubmit);
    if (elements.formAddLibrarian) elements.formAddLibrarian.addEventListener('submit', handleAddLibrarianSubmit);
    if (elements.formSettings) elements.formSettings.addEventListener('submit', handleSettingsSubmit);

    // Issue Book Search Autocompletes
    if (elements.issueStudentSearch) {
      elements.issueStudentSearch.addEventListener('input', () => debounce(searchStudentForIssue, 250)());
    }
    if (elements.issueBookSearch) {
      elements.issueBookSearch.addEventListener('input', () => debounce(searchBookForIssue, 250)());
    }

    // Return search filter
    if (elements.returnSearchInput) {
      elements.returnSearchInput.addEventListener('input', () => debounce(loadReturnTransactions, 300)());
    }

    // Student directory search
    if (elements.studentSearchInput) {
      elements.studentSearchInput.addEventListener('input', () => debounce(loadStudents, 300)());
    }

    // Register Student Modal Opener
    if (elements.btnOpenRegisterStudentModal) {
      elements.btnOpenRegisterStudentModal.addEventListener('click', () => openModal(elements.modalRegisterStudent));
    }

    // Add Librarian Modal Opener
    if (elements.btnOpenAddLibrarianModal) {
      elements.btnOpenAddLibrarianModal.addEventListener('click', () => openModal(elements.modalAddLibrarian));
    }

    // Google Sheets Guide Modal Opener
    if (elements.btnShowSheetsGuide) {
      elements.btnShowSheetsGuide.addEventListener('click', () => openModal(elements.modalSheetsGuide));
    }
  }

  // --- ROLE SWITCHER ---
  async function switchRole(role, silent = false) {
    try {
      let email = 'admin@college.edu';
      let password = 'admin123';

      if (role === 'librarian') {
        email = 'librarian@college.edu';
        password = 'lib123';
      } else if (role === 'student') {
        email = 'student@college.edu';
        password = 'stu123';
      }

      const res = await API.login(email, password);
      currentUser = res.user;

      if (currentUser && (currentUser.email === 'admin@college.edu' || currentUser.role === 'admin')) {
        currentUser.name = 'Prof. ARCHANA .R';
        API.setCurrentUser(currentUser);
      }

      // Update Header role buttons if present
      if (elements.roleButtons) {
        elements.roleButtons.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-role') === role);
        });
      }

      // Update User Pill
      if (elements.currentUserName) elements.currentUserName.textContent = currentUser.name;
      if (elements.currentUserRole) elements.currentUserRole.textContent = currentUser.role.toUpperCase();
      if (elements.currentUserAvatar) {
        const cleanName = currentUser.name.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
        elements.currentUserAvatar.textContent = (cleanName.charAt(0) || 'A').toUpperCase();
      }

      // Adjust role-based UI visibility
      updateRoleUIVisibility(currentUser.role);

      if (!silent) {
        showToast(`Logged in as: ${currentUser.role.toUpperCase()} (${currentUser.name})`, 'info', 'Profile Active');
      }

      // Refresh current view
      await refreshData();
    } catch (err) {
      console.error('Role switch failed:', err);
      if (!silent) {
        showToast(err.message, 'error', 'Authentication Failed');
      }
    }
  }

  function updateRoleUIVisibility(role) {
    const isStaff = role === 'admin' || role === 'librarian';
    const isAdmin = role === 'admin';
    const isStudent = role === 'student';

    document.querySelectorAll('.staff-only').forEach(el => {
      el.style.display = isStaff ? '' : 'none';
    });

    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin ? '' : 'none';
    });

    document.querySelectorAll('.student-only').forEach(el => {
      el.style.display = isStudent ? '' : 'none';
    });
  }

  // --- VIEW SWITCHING ---
  function switchView(viewName) {
    elements.views.forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    elements.navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger view-specific loads
    if (viewName === 'dashboard') loadDashboard();
    else if (viewName === 'available-books') loadAvailableBooks();
    else if (viewName === 'all-books') loadCatalogBooks();
    else if (viewName === 'return-book') loadReturnTransactions();
    else if (viewName === 'students-mgmt') loadStudents();
    else if (viewName === 'librarians-mgmt') loadLibrarians();
    else if (viewName === 'my-loans') loadMyLoans();
    else if (viewName === 'settings') loadSettings();
  }

  // --- DATA LOADING & DASHBOARD (Requirement 6) ---
  async function loadInitialData() {
    await Promise.all([
      loadDashboard(),
      loadCategories(),
      loadAvailableBooks()
    ]);
  }

  async function refreshData() {
    await Promise.all([
      loadDashboard(),
      loadAvailableBooks(),
      loadCatalogBooks()
    ]);
  }

  async function loadDashboard() {
    try {
      const res = await API.getDashboardStats();
      if (!res.success) return;

      dashboardStats = res.stats;

      // Update Storage indicator
      if (elements.storageModeText) {
        elements.storageModeText.textContent = res.mode === 'sheets'
          ? 'Storage: Google Sheets Connected'
          : 'Storage: Demo Store';
      }
      if (elements.storageModeIndicator) {
        elements.storageModeIndicator.className = `mode-pill mode-${res.mode}`;
      }
      if (elements.settingsStorageModeDisplay) {
        elements.settingsStorageModeDisplay.textContent = res.mode === 'sheets'
          ? 'Connected to Google Sheets API / Apps Script Web App'
          : 'Demo Mode (In-Memory college dataset with instant calculation)';
      }

      // Update 8 Dynamic Summary Cards (Requirement 6)
      if (elements.statTotalTitles) elements.statTotalTitles.textContent = res.stats.totalTitles;
      if (elements.statPhysicalCopies) elements.statPhysicalCopies.textContent = res.stats.totalPhysicalCopies;
      if (elements.statAvailableCopies) elements.statAvailableCopies.textContent = res.stats.availableCopies;
      if (elements.statIssuedCopies) elements.statIssuedCopies.textContent = res.stats.issuedCopies;
      if (elements.statStudents) elements.statStudents.textContent = res.stats.registeredStudents;
      if (elements.statLibrarians) elements.statLibrarians.textContent = res.stats.registeredLibrarians;
      if (elements.statOverdueTxns) elements.statOverdueTxns.textContent = res.stats.overdueTransactions;
      if (elements.statFines) elements.statFines.textContent = `₹${res.stats.outstandingFines}`;

      // Update sidebar badges
      if (elements.sidebarAvailableCount) elements.sidebarAvailableCount.textContent = res.stats.availableCopies;
      if (elements.sidebarTotalCount) elements.sidebarTotalCount.textContent = res.stats.totalTitles;
      if (elements.sidebarIssuedCount) elements.sidebarIssuedCount.textContent = res.stats.issuedCopies;

      // Render "Currently Available Books" section on Dashboard (Requirement 6)
      renderDashboardAvailableBooks(res.stats.currentlyAvailableBooks || []);

      // Render "Recently Added Books" section on Dashboard (Requirement 6)
      renderDashboardRecentBooks(res.stats.recentlyAddedBooks || []);

    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    }
  }

  function renderDashboardAvailableBooks(books) {
    if (!elements.dashboardAvailableList) return;

    if (books.length === 0) {
      elements.dashboardAvailableList.innerHTML = `
        <div class="empty-state" style="padding: 2rem; grid-column: 1 / -1;">
          <p class="empty-state-text">No books currently in stock with available copies.</p>
        </div>
      `;
      return;
    }

    elements.dashboardAvailableList.innerHTML = books.map(book => `
      <div class="book-card" style="box-shadow: none; border-color: var(--border-color);">
        <div class="book-cover-container" style="height: 150px;">
          <img src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title)}" class="book-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'">
          <span class="book-rack-badge">📍 ${escapeHtml(book.rackNumber || 'A-01')}</span>
          <span class="book-category-badge">${escapeHtml(book.category)}</span>
        </div>
        <div class="book-info" style="padding: 1rem;">
          <h4 class="book-title" style="font-size: 0.95rem; min-height: 2.5rem;" title="${escapeHtml(book.title)}">
            ${escapeHtml(book.title)}
          </h4>
          <p class="book-author" style="font-size: 0.8rem;">
            <span>✍️</span> ${escapeHtml(book.author)}
          </p>
          <div class="book-availability-bar" style="padding: 0.4rem 0.65rem; margin-bottom: 0.75rem;">
            <span class="status-badge available" style="font-size: 0.7rem;">Available</span>
            <span class="copies-count" style="font-size: 0.75rem;">${book.availableCopies} / ${book.totalCopies} Copies</span>
          </div>
          <div class="book-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="ScholarLib.openBookDetails('${book.id}')">View</button>
            <button class="btn btn-primary btn-sm staff-only" onclick="ScholarLib.startIssueForBook('${book.id}')">Issue</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderDashboardRecentBooks(books) {
    if (!elements.dashboardRecentList) return;

    if (books.length === 0) {
      elements.dashboardRecentList.innerHTML = `<p class="form-help">No recent books recorded.</p>`;
      return;
    }

    elements.dashboardRecentList.innerHTML = books.map(book => {
      const isAvailable = book.availableCopies > 0;
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
          <div style="flex: 1; padding-right: 0.75rem;">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;" title="${escapeHtml(book.title)}">
              ${escapeHtml(book.title)}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              ${escapeHtml(book.author)} • <strong>${escapeHtml(book.rackNumber)}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="status-badge ${isAvailable ? 'available' : 'unavailable'}" style="font-size: 0.7rem;">
              ${isAvailable ? `${book.availableCopies} Avail` : 'Unavailable'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadCategories() {
    try {
      const res = await API.getCategories();
      if (!res.success) return;

      allCategories = res.categories || [];

      // Populate category filters
      const optionsHtml = ['<option value="All">All Categories</option>']
        .concat(allCategories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`))
        .join('');

      if (elements.availableCategoryFilter) elements.availableCategoryFilter.innerHTML = optionsHtml;
      if (elements.catalogCategoryFilter) elements.catalogCategoryFilter.innerHTML = optionsHtml;

      // Populate datalist for Add Book form
      if (elements.categoryDatalist) {
        elements.categoryDatalist.innerHTML = allCategories.map(c => `<option value="${escapeHtml(c)}">`).join('');
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  // --- VIEW 2: AVAILABLE BOOKS (Requirements 3 & 4) ---
  async function loadAvailableBooks() {
    try {
      const params = {
        availableOnly: true, // STRICT REQUIREMENT: Only books with at least 1 available copy!
        search: elements.availableSearchInput ? elements.availableSearchInput.value.trim() : '',
        category: elements.availableCategoryFilter ? elements.availableCategoryFilter.value : 'All',
        sort: elements.availableSortFilter ? elements.availableSortFilter.value : 'recent'
      };

      const res = await API.getBooks(params);
      if (!res.success) return;

      cachedAvailableBooks = res.books || [];

      if (elements.badgeAvailableSummary) {
        elements.badgeAvailableSummary.textContent = `${res.total} Titles In Stock`;
      }

      renderAvailableBooks(cachedAvailableBooks);
    } catch (err) {
      console.error('Failed to load available books:', err);
      showToast(err.message, 'error', 'Error Loading Available Books');
    }
  }

  function renderAvailableBooks(books) {
    if (!elements.availableBooksGrid) return;

    if (books.length === 0) {
      elements.availableBooksGrid.innerHTML = '';
      if (elements.availableEmptyState) elements.availableEmptyState.style.display = 'block';
      return;
    }

    if (elements.availableEmptyState) elements.availableEmptyState.style.display = 'none';

    elements.availableBooksGrid.innerHTML = books.map(book => `
      <div class="book-card">
        <div class="book-cover-container">
          <img src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title)}" class="book-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'">
          <span class="book-rack-badge">📍 Shelf: ${escapeHtml(book.rackNumber || 'A-01')}</span>
          <span class="book-category-badge">${escapeHtml(book.category)}</span>
        </div>
        <div class="book-info">
          <!-- Actual Book Name clearly displayed in visible heading (Requirement 3) -->
          <h3 class="book-title" title="${escapeHtml(book.title)}">
            ${escapeHtml(book.title)}
          </h3>
          <p class="book-author">
            <span>✍️</span> ${escapeHtml(book.author)}
          </p>

          <div class="book-availability-bar">
            <span class="status-badge available">
              🟢 Available
            </span>
            <span class="copies-count">
              <strong>${book.availableCopies}</strong> of ${book.totalCopies} Copies
            </span>
          </div>

          <div class="book-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="ScholarLib.openBookDetails('${book.id}')">
              View Details
            </button>
            <button class="btn btn-primary btn-sm staff-only" onclick="ScholarLib.startIssueForBook('${book.id}')">
              Issue Book
            </button>
            <button class="btn btn-primary btn-sm student-only" style="display:none;" onclick="ScholarLib.reserveBook('${book.id}')">
              Reserve
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Update staff vs student button display
    if (currentUser) updateRoleUIVisibility(currentUser.role);
  }

  // --- VIEW 3: COMPLETE BOOK CATALOG (Requirement 5) ---
  async function loadCatalogBooks() {
    try {
      const availabilityFilter = elements.catalogAvailabilityFilter ? elements.catalogAvailabilityFilter.value : 'all';
      const params = {
        search: elements.catalogSearchInput ? elements.catalogSearchInput.value.trim() : '',
        category: elements.catalogCategoryFilter ? elements.catalogCategoryFilter.value : 'All',
        sort: elements.catalogSortFilter ? elements.catalogSortFilter.value : 'recent'
      };

      if (availabilityFilter === 'available') {
        params.availableOnly = true;
      }

      const res = await API.getBooks(params);
      if (!res.success) return;

      let books = res.books || [];

      if (availabilityFilter === 'unavailable') {
        books = books.filter(b => b.availableCopies === 0);
      }

      cachedBooks = books;
      renderCatalogBooks(books);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    }
  }

  function renderCatalogBooks(books) {
    if (!elements.catalogBooksGrid) return;

    if (books.length === 0) {
      elements.catalogBooksGrid.innerHTML = '';
      if (elements.catalogEmptyState) elements.catalogEmptyState.style.display = 'block';
      return;
    }

    if (elements.catalogEmptyState) elements.catalogEmptyState.style.display = 'none';

    elements.catalogBooksGrid.innerHTML = books.map(book => {
      const isAvailable = book.availableCopies > 0;
      return `
        <div class="book-card">
          <div class="book-cover-container">
            <img src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title)}" class="book-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'">
            <span class="book-rack-badge">📍 ${escapeHtml(book.rackNumber || 'A-01')}</span>
            <span class="book-category-badge">${escapeHtml(book.category)}</span>
          </div>
          <div class="book-info">
            <h3 class="book-title" title="${escapeHtml(book.title)}">
              ${escapeHtml(book.title)}
            </h3>
            <p class="book-author">
              <span>✍️</span> ${escapeHtml(book.author)}
            </p>

            <div class="book-availability-bar">
              <span class="status-badge ${isAvailable ? 'available' : 'unavailable'}">
                ${isAvailable ? '🟢 Available' : '🔴 Currently Unavailable'}
              </span>
              <span class="copies-count">
                ${book.availableCopies} / ${book.totalCopies} Copies
              </span>
            </div>

            <div class="book-card-actions">
              <button class="btn btn-secondary btn-sm" onclick="ScholarLib.openBookDetails('${book.id}')">
                Details
              </button>
              <button class="btn btn-secondary btn-sm staff-only" onclick="ScholarLib.openEditBook('${book.id}')" title="Edit Book">
                ✏️ Edit
              </button>
              <button class="btn btn-danger btn-sm staff-only" onclick="ScholarLib.deleteBook('${book.id}')" title="Delete Book">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (currentUser) updateRoleUIVisibility(currentUser.role);
  }

  // --- REQUIREMENT 2: ADD BOOK WORKFLOW ---
  async function handleAddBookSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('add-book-title').value.trim();
    const author = document.getElementById('add-book-author').value.trim();
    const isbn = document.getElementById('add-book-isbn').value.trim();
    const category = document.getElementById('add-book-category').value.trim();
    const publisher = document.getElementById('add-book-publisher').value.trim();
    const edition = document.getElementById('add-book-edition').value.trim();
    const year = document.getElementById('add-book-year').value;
    const copies = parseInt(document.getElementById('add-book-copies').value, 10);
    const rackNumber = document.getElementById('add-book-rack').value.trim();
    const coverUrl = document.getElementById('add-book-cover').value.trim();
    const description = document.getElementById('add-book-desc').value.trim();

    // Frontend validations (Requirement 2)
    if (!title || !author || !isbn || !category || !rackNumber) {
      showToast('Please fill out all mandatory fields marked with *.', 'error', 'Validation Error');
      return;
    }

    if (isNaN(copies) || copies <= 0) {
      showToast('Total copies must be a positive number greater than zero.', 'error', 'Invalid Quantity');
      return;
    }

    const payload = {
      title,
      author,
      isbn,
      category,
      publisher: publisher || 'Not Specified',
      edition: edition || '1st Edition',
      publishedYear: year ? parseInt(year, 10) : new Date().getFullYear(),
      totalCopies: copies,
      rackNumber,
      coverUrl: coverUrl || '',
      description
    };

    try {
      const res = await API.addBook(payload);

      if (!res.success) {
        showToast(res.message, 'error', 'Failed to Add Book');
        return;
      }

      // Close modal & reset form
      closeModal(elements.modalAddBook);
      elements.formAddBook.reset();

      // 1. Display success message
      showToast(res.message, 'success', 'Book Registered Successfully!');

      // 2. Add book to catalog immediately & 3, 4. Update counts
      await Promise.all([
        loadDashboard(),
        loadCategories(),
        loadAvailableBooks(),
        loadCatalogBooks()
      ]);

      // 6. Open Book Details Modal immediately so user sees the newly registered record!
      openBookDetails(res.book.id);

    } catch (err) {
      showToast(err.message, 'error', 'Failed to Add Book');
    }
  }

  // --- EDIT BOOK WORKFLOW ---
  async function openEditBook(bookId) {
    try {
      const res = await API.getBookById(bookId);
      if (!res.success) return;

      const book = res.book;
      document.getElementById('edit-book-id').value = book.id;
      document.getElementById('edit-book-title').value = book.title;
      document.getElementById('edit-book-author').value = book.author;
      document.getElementById('edit-book-isbn').value = book.isbn;
      document.getElementById('edit-book-category').value = book.category;
      document.getElementById('edit-book-publisher').value = book.publisher || '';
      document.getElementById('edit-book-edition').value = book.edition || '';
      document.getElementById('edit-book-year').value = book.publishedYear || '';
      document.getElementById('edit-book-copies').value = book.totalCopies;
      document.getElementById('edit-book-rack').value = book.rackNumber || '';
      document.getElementById('edit-book-cover').value = book.coverUrl || '';
      document.getElementById('edit-book-desc').value = book.description || '';

      openModal(elements.modalEditBook);
    } catch (err) {
      showToast(err.message, 'error', 'Error Loading Book');
    }
  }

  async function handleEditBookSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-book-id').value;

    const payload = {
      title: document.getElementById('edit-book-title').value.trim(),
      author: document.getElementById('edit-book-author').value.trim(),
      isbn: document.getElementById('edit-book-isbn').value.trim(),
      category: document.getElementById('edit-book-category').value.trim(),
      publisher: document.getElementById('edit-book-publisher').value.trim(),
      edition: document.getElementById('edit-book-edition').value.trim(),
      publishedYear: parseInt(document.getElementById('edit-book-year').value, 10),
      totalCopies: parseInt(document.getElementById('edit-book-copies').value, 10),
      rackNumber: document.getElementById('edit-book-rack').value.trim(),
      coverUrl: document.getElementById('edit-book-cover').value.trim(),
      description: document.getElementById('edit-book-desc').value.trim()
    };

    try {
      const res = await API.updateBook(id, payload);
      if (!res.success) return;

      closeModal(elements.modalEditBook);
      showToast(res.message, 'success', 'Book Updated');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error', 'Update Failed');
    }
  }

  // --- DELETE BOOK WORKFLOW ---
  async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book from the catalog? This action will check for active borrowings first.')) {
      return;
    }

    try {
      const res = await API.deleteBook(bookId);
      if (!res.success) return;

      showToast(res.message, 'success', 'Book Deleted');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error', 'Cannot Delete Book');
    }
  }

  // --- VIEW DETAILS MODAL ---
  async function openBookDetails(bookId) {
    try {
      const res = await API.getBookById(bookId);
      if (!res.success) return;

      const book = res.book;
      const isAvailable = book.availableCopies > 0;

      document.getElementById('detail-book-title').textContent = book.title;
      document.getElementById('detail-modal-title').textContent = book.title;
      document.getElementById('detail-book-author').textContent = `By ${book.author}`;
      document.getElementById('detail-book-category').textContent = book.category;
      document.getElementById('detail-book-isbn').textContent = book.isbn;
      document.getElementById('detail-book-rack').textContent = book.rackNumber;
      document.getElementById('detail-book-publisher').textContent = book.publisher || 'N/A';
      document.getElementById('detail-book-edition-year').textContent = `${book.edition || '1st Ed.'} (${book.publishedYear || 'N/A'})`;
      document.getElementById('detail-book-total').textContent = `${book.totalCopies} Copies`;
      document.getElementById('detail-book-available').textContent = `${book.availableCopies} Available`;
      document.getElementById('detail-book-desc').textContent = book.description || 'No detailed description provided for this title.';

      const badge = document.getElementById('detail-book-badge');
      badge.textContent = isAvailable ? '🟢 Available' : '🔴 Currently Unavailable';
      badge.className = `status-badge ${isAvailable ? 'available' : 'unavailable'}`;

      const coverImg = document.getElementById('detail-book-cover');
      coverImg.src = book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400';

      const btnIssue = elements.btnDetailIssueBook;
      if (btnIssue) {
        btnIssue.style.display = (currentUser && (currentUser.role === 'admin' || currentUser.role === 'librarian')) ? '' : 'none';
        btnIssue.onclick = () => {
          closeModal(elements.modalBookDetails);
          startIssueForBook(book.id);
        };
      }

      openModal(elements.modalBookDetails);
    } catch (err) {
      showToast(err.message, 'error', 'Error Loading Book Details');
    }
  }

  // --- REQUIREMENT 8: ISSUE BOOK WORKFLOW ---
  function startIssueForBook(bookId) {
    switchView('issue-book');
    selectBookForIssue(bookId);
  }

  async function searchStudentForIssue() {
    const q = elements.issueStudentSearch.value.trim();
    if (!q) {
      elements.issueStudentPreview.style.display = 'none';
      elements.issueSelectedStudentId.value = '';
      return;
    }

    try {
      const res = await API.getStudents(q);
      if (!res.success) return;

      const students = res.students || [];
      if (students.length === 0) {
        elements.issueStudentPreview.style.display = 'block';
        elements.issueStudentPreview.innerHTML = `
          <div class="alert-banner alert-warning">
            ⚠️ No student found matching "${escapeHtml(q)}".
          </div>
        `;
        elements.issueSelectedStudentId.value = '';
        return;
      }

      // Pick top matches or first match
      elements.issueStudentPreview.style.display = 'block';
      elements.issueStudentPreview.innerHTML = students.slice(0, 3).map(s => {
        const isInactive = s.status !== 'Active';
        const limitReached = s.activeLoans >= 3;
        const disabled = isInactive || limitReached;

        return `
          <div class="preview-item">
            <div>
              <strong>${escapeHtml(s.name)}</strong> (${escapeHtml(s.regNo)}) — ${escapeHtml(s.department)}
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                Active Loans: ${s.activeLoans}/3 | Account: <span class="status-badge ${s.status === 'Active' ? 'available' : 'unavailable'}">${s.status}</span>
              </div>
            </div>
            <div>
              ${disabled
                ? `<span style="font-size: 0.75rem; color: var(--danger); font-weight: 600;">${isInactive ? 'Account Inactive' : 'Quota Full (3/3)'}</span>`
                : `<button type="button" class="btn btn-secondary btn-sm" onclick="ScholarLib.selectStudentForIssue('${s.id}', '${escapeHtml(s.name)}', '${escapeHtml(s.regNo)}')">Select Student</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
    }
  }

  function selectStudentForIssue(id, name, regNo) {
    elements.issueSelectedStudentId.value = id;
    elements.issueStudentSearch.value = `${name} (${regNo})`;
    elements.issueStudentPreview.style.display = 'block';
    elements.issueStudentPreview.innerHTML = `
      <div class="alert-banner alert-success">
        ✅ Selected Student: <strong>${escapeHtml(name)}</strong> (${escapeHtml(regNo)})
      </div>
    `;
  }

  async function searchBookForIssue() {
    const q = elements.issueBookSearch.value.trim();
    if (!q) {
      elements.issueBookPreview.style.display = 'none';
      elements.issueSelectedBookId.value = '';
      return;
    }

    try {
      const res = await API.getBooks({ search: q });
      if (!res.success) return;

      const books = res.books || [];
      if (books.length === 0) {
        elements.issueBookPreview.style.display = 'block';
        elements.issueBookPreview.innerHTML = `
          <div class="alert-banner alert-warning">
            ⚠️ No books found matching "${escapeHtml(q)}".
          </div>
        `;
        elements.issueSelectedBookId.value = '';
        return;
      }

      elements.issueBookPreview.style.display = 'block';
      elements.issueBookPreview.innerHTML = books.slice(0, 3).map(b => {
        const isAvailable = b.availableCopies > 0;
        return `
          <div class="preview-item">
            <div>
              <strong>${escapeHtml(b.title)}</strong> by ${escapeHtml(b.author)}
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                Shelf: ${escapeHtml(b.rackNumber)} | Available: <strong>${b.availableCopies}</strong> of ${b.totalCopies}
              </div>
            </div>
            <div>
              ${!isAvailable
                ? `<span style="font-size: 0.75rem; color: var(--danger); font-weight: 700;">Zero Copies Available</span>`
                : `<button type="button" class="btn btn-secondary btn-sm" onclick="ScholarLib.selectBookForIssue('${b.id}', '${escapeHtml(b.title)}', ${b.availableCopies})">Select Book</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
    }
  }

  async function selectBookForIssue(id, title = null, availableCopies = null) {
    if (!title) {
      const res = await API.getBookById(id);
      if (res.success) {
        title = res.book.title;
        availableCopies = res.book.availableCopies;
      }
    }

    elements.issueSelectedBookId.value = id;
    elements.issueBookSearch.value = title;
    elements.issueBookPreview.style.display = 'block';
    elements.issueBookPreview.innerHTML = `
      <div class="alert-banner alert-success">
        ✅ Selected Book: <strong>${escapeHtml(title)}</strong> (${availableCopies} copies in stock)
      </div>
    `;
  }

  async function handleIssueBookSubmit(e) {
    e.preventDefault();

    const studentId = elements.issueSelectedStudentId.value;
    const bookId = elements.issueSelectedBookId.value;
    const issueDate = elements.issueDate.value;
    const dueDate = elements.issueDueDate.value;
    const notes = elements.issueNotes.value.trim();

    if (!studentId) {
      showToast('Please select a student from Step 1.', 'error', 'Missing Student');
      return;
    }
    if (!bookId) {
      showToast('Please select an available book from Step 2.', 'error', 'Missing Book');
      return;
    }

    try {
      const res = await API.issueBook({
        studentId,
        bookId,
        issueDate,
        dueDate,
        notes
      });

      if (!res.success) return;

      // 1. Success notification
      showToast(res.message, 'success', 'Book Issued Successfully!');

      // Reset Form
      elements.formIssueBook.reset();
      setupDateDefaults();
      elements.issueStudentPreview.style.display = 'none';
      elements.issueBookPreview.style.display = 'none';
      elements.issueSelectedStudentId.value = '';
      elements.issueSelectedBookId.value = '';

      // 2. Immediately update book availability and dashboard counts
      await refreshData();

      // Switch to Available Books view to show the decremented status or to Return Desk
      switchView('available-books');
    } catch (err) {
      showToast(err.message, 'error', 'Cannot Issue Book');
    }
  }

  // --- REQUIREMENT 9: RETURN BOOK WORKFLOW ---
  async function loadReturnTransactions() {
    try {
      const search = elements.returnSearchInput ? elements.returnSearchInput.value.trim() : '';
      const res = await API.getTransactions({ status: 'ISSUED', search });
      if (!res.success) return;

      cachedTransactions = res.transactions || [];
      renderReturnTransactions(cachedTransactions);
    } catch (err) {
      console.error('Failed to load active transactions:', err);
    }
  }

  function renderReturnTransactions(transactions) {
    if (!elements.returnTbody) return;

    if (transactions.length === 0) {
      elements.returnTbody.innerHTML = '';
      if (elements.returnEmptyState) elements.returnEmptyState.style.display = 'block';
      return;
    }

    if (elements.returnEmptyState) elements.returnEmptyState.style.display = 'none';

    elements.returnTbody.innerHTML = transactions.map(txn => {
      const isOverdue = txn.overdueDays > 0;
      return `
        <tr>
          <td><code>${escapeHtml(txn.id)}</code></td>
          <td><strong>${escapeHtml(txn.studentName)}</strong></td>
          <td><span style="font-family: monospace;">${escapeHtml(txn.studentRegNo)}</span></td>
          <td>${escapeHtml(txn.bookTitle)}</td>
          <td>${escapeHtml(txn.issueDate)}</td>
          <td>${escapeHtml(txn.dueDate)}</td>
          <td>
            ${isOverdue
              ? `<span class="status-badge unavailable">⚠️ ${txn.overdueDays} Days Overdue</span>`
              : `<span class="status-badge available">On Time</span>`
            }
          </td>
          <td>
            <strong style="color: ${isOverdue ? 'var(--danger)' : 'var(--text-main)'};">
              ₹${txn.fineAmount || 0}
            </strong>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-success btn-sm" onclick="ScholarLib.processReturn('${txn.id}', '${escapeHtml(txn.bookTitle)}')">
              Return Book
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function processReturn(txnId, bookTitle) {
    if (!confirm(`Confirm book return for "${bookTitle}"? Available copies will be incremented and restored to the Available Books catalog.`)) {
      return;
    }

    try {
      const res = await API.returnBook(txnId);
      if (!res.success) return;

      // 1. Success toast
      showToast(res.message, 'success', 'Book Returned Successfully!');

      // 2. Immediately update availability & dashboard counts
      await refreshData();
      await loadReturnTransactions();
    } catch (err) {
      showToast(err.message, 'error', 'Return Failed');
    }
  }

  // --- REQUIREMENT 10: STUDENTS & LIBRARIANS MANAGEMENT ---
  async function loadStudents() {
    try {
      const q = elements.studentSearchInput ? elements.studentSearchInput.value.trim() : '';
      const res = await API.getStudents(q);
      if (!res.success) return;

      cachedStudents = res.students || [];
      renderStudents(cachedStudents);
    } catch (err) {
      console.error(err);
    }
  }

  function renderStudents(students) {
    if (!elements.studentsTbody) return;

    if (students.length === 0) {
      elements.studentsTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">No students found.</td></tr>`;
      return;
    }

    const isAdmin = currentUser && currentUser.role === 'admin';

    elements.studentsTbody.innerHTML = students.map(s => `
      <tr>
        <td><code>${escapeHtml(s.regNo)}</code></td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>${escapeHtml(s.department)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.phone || '—')}</td>
        <td><strong>${s.activeLoans || 0}</strong> / 3</td>
        <td>
          <span class="status-badge ${s.status === 'Active' ? 'available' : 'unavailable'}">
            ${s.status}
          </span>
        </td>
        <td style="text-align: right; display: flex; justify-content: flex-end; gap: 0.4rem;">
          <button class="btn btn-secondary btn-sm" onclick="ScholarLib.toggleStudentStatus('${s.id}')">
            ${s.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          ${isAdmin ? `
            <button class="btn btn-danger btn-sm" onclick="ScholarLib.deleteStudent('${s.id}', '${escapeHtml(s.name)}')" title="Admin Only: Remove Student">
              🗑️ Remove
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  async function deleteStudent(id, name) {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Permission denied: Only administrators can remove students.', 'error', 'Admin Required');
      return;
    }

    if (!confirm(`Are you sure you want to permanently remove student "${name}"?\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const res = await API.deleteStudent(id);
      if (!res.success) return;

      showToast(res.message, 'success', 'Student Removed');
      await loadStudents();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error', 'Failed to Remove Student');
    }
  }

  async function handleRegisterStudentSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('reg-student-name').value.trim();
    const regNo = document.getElementById('reg-student-regno').value.trim();
    const department = document.getElementById('reg-student-dept').value.trim();
    const email = document.getElementById('reg-student-email').value.trim();
    const phone = document.getElementById('reg-student-phone').value.trim();

    try {
      const res = await API.addStudent({
        name,
        regNo,
        department,
        email,
        phone
      });

      if (!res.success) return;

      closeModal(elements.modalRegisterStudent);
      elements.formRegisterStudent.reset();
      showToast(res.message, 'success', 'Student Registered');
      await loadStudents();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error', 'Registration Failed');
    }
  }

  async function toggleStudentStatus(id) {
    try {
      const res = await API.toggleStudentStatus(id);
      if (!res.success) return;

      showToast(res.message, 'info', 'Status Updated');
      await loadStudents();
    } catch (err) {
      showToast(err.message, 'error', 'Error Updating Status');
    }
  }

  // Librarians Management
  async function loadLibrarians() {
    try {
      const res = await API.getLibrarians();
      if (!res.success) return;

      renderLibrarians(res.librarians || []);
    } catch (err) {
      console.error(err);
    }
  }

  function renderLibrarians(librarians) {
    if (!elements.librariansTbody) return;

    const isAdmin = currentUser && currentUser.role === 'admin';

    elements.librariansTbody.innerHTML = librarians.map(l => `
      <tr>
        <td><code>${escapeHtml(l.id)}</code></td>
        <td><strong>${escapeHtml(l.name)}</strong></td>
        <td>${escapeHtml(l.email)}</td>
        <td>${escapeHtml(l.phone || '—')}</td>
        <td><span class="user-role-badge">LIBRARIAN</span></td>
        <td>
          <span class="status-badge ${l.status === 'Active' ? 'available' : 'unavailable'}">
            ${l.status}
          </span>
        </td>
        <td style="text-align: right; display: flex; justify-content: flex-end; gap: 0.4rem;">
          <button class="btn btn-secondary btn-sm" onclick="ScholarLib.toggleLibrarianStatus('${l.id}')">
            ${l.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          ${isAdmin ? `
            <button class="btn btn-danger btn-sm" onclick="ScholarLib.deleteLibrarian('${l.id}', '${escapeHtml(l.name)}')" title="Admin Only: Remove Librarian">
              🗑️ Remove
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  async function deleteLibrarian(id, name) {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Permission denied: Only administrators can remove librarians.', 'error', 'Admin Required');
      return;
    }

    if (!confirm(`Are you sure you want to permanently remove librarian "${name}"?\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const res = await API.deleteLibrarian(id);
      if (!res.success) return;

      showToast(res.message, 'success', 'Librarian Removed');
      await loadLibrarians();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error', 'Failed to Remove Librarian');
    }
  }

  async function handleAddLibrarianSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('add-lib-name').value.trim();
    const email = document.getElementById('add-lib-email').value.trim();
    const phone = document.getElementById('add-lib-phone').value.trim();

    try {
      const res = await API.addLibrarian({ name, email, phone });
      if (!res.success) return;

      closeModal(elements.modalAddLibrarian);
      elements.formAddLibrarian.reset();
      showToast(res.message, 'success', 'Librarian Added');
      await loadLibrarians();
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error', 'Failed to Add Librarian');
    }
  }

  async function toggleLibrarianStatus(id) {
    try {
      const res = await API.toggleLibrarianStatus(id);
      if (!res.success) return;

      showToast(res.message, 'info', 'Status Updated');
      await loadLibrarians();
    } catch (err) {
      showToast(err.message, 'error', 'Error Updating Status');
    }
  }

  // --- STUDENT PORTAL: MY BORROWINGS ---
  async function loadMyLoans() {
    try {
      const res = await API.getTransactions({ status: 'ISSUED' });
      if (!res.success) return;

      if (!elements.myLoansTbody) return;

      const loans = res.transactions || [];
      if (loans.length === 0) {
        elements.myLoansTbody.innerHTML = `
          <tr><td colspan="7" style="text-align:center; padding: 2rem;">You do not currently have any active borrowed books.</td></tr>
        `;
        return;
      }

      elements.myLoansTbody.innerHTML = loans.map(t => {
        const isOverdue = t.overdueDays > 0;
        return `
          <tr>
            <td><code>${escapeHtml(t.id)}</code></td>
            <td><strong>${escapeHtml(t.bookTitle)}</strong></td>
            <td>${escapeHtml(t.issueDate)}</td>
            <td>${escapeHtml(t.dueDate)}</td>
            <td>
              ${isOverdue
                ? `<span class="status-badge unavailable">${t.overdueDays} Days Overdue</span>`
                : `<span class="status-badge available">Due Soon</span>`
              }
            </td>
            <td><strong>₹${t.fineAmount}</strong></td>
            <td><span class="status-badge ${isOverdue ? 'unavailable' : 'available'}">${t.status}</span></td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error(err);
    }
  }

  // Reserve Book (Student Action)
  function reserveBook(bookId) {
    showToast(`Book reservation request placed! Our librarians will hold this copy for you at the circulation counter for 24 hours.`, 'success', 'Reservation Confirmed');
  }

  // --- SETTINGS ---
  async function loadSettings() {
    try {
      const res = await API.getSettings();
      if (!res.success) return;

      const s = res.settings;
      if (elements.settingCollegeName) elements.settingCollegeName.value = s.collegeName || '';
      if (elements.settingLoanDays) elements.settingLoanDays.value = s.defaultLoanDays || 14;
      if (elements.settingFineRate) elements.settingFineRate.value = s.finePerDay || 5.0;
      if (elements.settingMaxLimit) elements.settingMaxLimit.value = s.maxBorrowLimit || 3;
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();

    const payload = {
      collegeName: elements.settingCollegeName.value.trim(),
      defaultLoanDays: parseInt(elements.settingLoanDays.value, 10),
      finePerDay: parseFloat(elements.settingFineRate.value),
      maxBorrowLimit: parseInt(elements.settingMaxLimit.value, 10)
    };

    try {
      const res = await API.updateSettings(payload);
      if (!res.success) return;

      showToast(res.message, 'success', 'Settings Saved');
    } catch (err) {
      showToast(err.message, 'error', 'Failed to Save Settings');
    }
  }

  // --- MODAL UTILITIES ---
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  // --- TOAST SYSTEM ---
  function showToast(message, type = 'info', title = null, duration = 4000) {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    let defaultTitle = 'Notification';
    if (type === 'success') { icon = '✅'; defaultTitle = 'Success'; }
    else if (type === 'error') { icon = '❌'; defaultTitle = 'Error'; }
    else if (type === 'warning') { icon = '⚠️'; defaultTitle = 'Warning'; }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title || defaultTitle)}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
      </div>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // --- HELPERS ---
  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose global controller for inline onclick handlers
  window.ScholarLib = {
    openBookDetails,
    openEditBook,
    deleteBook,
    startIssueForBook,
    selectStudentForIssue,
    selectBookForIssue,
    processReturn,
    toggleStudentStatus,
    deleteStudent,
    toggleLibrarianStatus,
    deleteLibrarian,
    reserveBook,
    showToast
  };

  // Run on page load
  document.addEventListener('DOMContentLoaded', init);

})();
