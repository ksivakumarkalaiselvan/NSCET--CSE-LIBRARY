# 📚 ScholarLib — College Library Management System

A complete, professional, responsive, and functional Library Management System designed for college and university libraries.

Built with **HTML5, CSS3, Vanilla JavaScript, Node.js, and Express.js**, featuring seamless integration with **Google Sheets** via Google Apps Script Web App API as well as an in-memory **Demo Data Mode**.

---

## 🌟 Key Highlights & Requirements Fulfilled

1. **Add Books with Real-time Validation**:
   - Fields: Book ID, ISBN, Title, Author, Publisher, Category, Edition, Published Year, Total Copies, Shelf/Rack Number, Cover URL, Description.
   - Prevents duplicate ISBNs and invalid or negative quantities.
   - Automatically initializes available copies to total copies.
   - Immediately adds the new book to the catalog, updates dashboard counters, and displays availability without refreshing the page.

2. **Dedicated Available Books Page**:
   - Displays **only books that currently have at least one copy in stock** (`availableCopies > 0`).
   - Books with 0 copies (all copies issued) are strictly excluded from Available Books, while remaining visible in the complete catalog.
   - Displays actual book names, authors, rack numbers, available vs total copies, and category badges.
   - Real-time search, category filters, sorting (title, author, recently added, most copies), and friendly empty states.

3. **Automatic Availability Calculation**:
   - `Available Copies = Total Copies - Currently Issued Copies`.
   - When a book is issued: Decreases available copies by 1. If copies reach 0, status transitions to "Currently Unavailable" and disappears from Available Books.
   - When a book is returned: Increases available copies by 1. Status transitions to "Available" and reappears on Available Books.
   - Backend validation blocks issuing books when 0 copies are available or if a student exceeds borrowing quota.

4. **Complete Book Catalog (All Books)**:
   - Displays every registered book, including unavailable titles.
   - Admin and Librarian actions to Add, Edit, and Delete books (safely prevented if active loans exist).

5. **Admin Dashboard with 8 Dynamic Statistics**:
   - Total Unique Book Titles
   - Total Physical Copies
   - Available Copies
   - Issued Copies
   - Registered Students
   - Registered Librarians
   - Overdue Transactions
   - Outstanding Fines
   - "Currently Available Books" section with actual book names, authors, copy counts, and "View All" button.
   - "Recently Added Books" section.

6. **Role-based Access & Security**:
   - **Admin**: Full access to catalog, students, staff librarians, loans, returns, and settings.
   - **Librarian**: Catalog management, issuing, returning, registering students.
   - **Student**: View available and catalog books, search, view personal borrowed books and overdue notices.
   - Passwords hashed with `bcryptjs`, sessions authenticated via JWT tokens.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Modern Glassmorphism UI, Responsive CSS Grid & Flexbox, Toast notifications, Modal dialogs).
- **Backend**: Node.js (v25+), Express.js.
- **Database**: 
  - **Phase 1–4**: In-Memory Demo Data Store (pre-seeded with college CSE textbooks, students, transactions).
  - **Phase 5–6**: Google Sheets (Google Apps Script Web App API connector).

---

## 📂 Project Structure

```text
E:\CSE LIB\
├── config/
│   └── config.js              # Environment & library business rules configuration
├── controllers/
│   ├── authController.js       # Login, registration, profile
│   ├── bookController.js       # Add, update, delete, get available books
│   ├── librarianController.js  # Librarian staff management
│   ├── settingsController.js   # Loan periods, fine rates, college info
│   ├── statsController.js      # Real-time dashboard statistics
│   ├── studentController.js    # Student directory & activation
│   └── transactionController.js# Issue & return circulation workflows
├── middleware/
│   ├── authMiddleware.js       # JWT extraction and validation
│   ├── errorHandler.js         # Centralized API error handling
│   ├── roleMiddleware.js       # Role-based access control (Admin, Librarian, Student)
│   └── validationMiddleware.js # Input sanitization & field validation
├── public/
│   ├── css/
│   │   └── style.css           # Modern, responsive library design
│   ├── js/
│   │   ├── api.js              # Frontend REST API client
│   │   └── app.js              # Single-page UI routing & interactivity
│   ├── assets/                 # Icons & images
│   └── index.html              # Main single-page application interface
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── librarianRoutes.js
│   ├── settingsRoutes.js
│   ├── statsRoutes.js
│   ├── studentRoutes.js
│   └── transactionRoutes.js
├── services/
│   ├── dataService.js          # Unified storage adapter (Demo vs Google Sheets)
│   ├── demoDataStore.js        # College library demo dataset with dynamic calculations
│   └── googleSheetsService.js  # Google Apps Script Web App integration client
├── google-sheets-integration/
│   ├── Code.gs                 # Complete Google Apps Script connector with LockService
│   └── SHEETS_SETUP_GUIDE.md   # Step-by-step manual setup instructions
├── test/
│   ├── test-system.js          # Core business logic unit tests
│   └── test-api.js             # End-to-end REST API integration tests
├── utils/
│   └── helpers.js              # Date calculations, fine calculations, ID generator
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already created by default):
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=scholarlib_super_secret_jwt_key_2026
STORAGE_TYPE=demo
```

### 3. Run Automated Tests
```bash
# Run business logic unit tests (availability calculations, issue/return)
node test/test-system.js

# Run REST API integration tests
node test/test-api.js
```

### 4. Start the Application Server
```bash
npm start
# or: node server.js
```
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 👥 Demo Accounts (Instant Role Switching)

The application features a 1-click **Role Switcher** in the top navigation bar to test all three roles effortlessly:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` | Full administrative control, manage librarians, circulation, books, and settings |
| **Librarian** | `librarian@college.edu` | `lib123` | Add/edit books, issue & return books, register students |
| **Student** | `student@college.edu` | `stu123` | Browse catalog, view available books, view borrowed books & due dates |

---

## 📊 Google Sheets Manual Integration (Phase 5 & 6)

When ready to connect your live Google Sheets spreadsheet:
1. Refer to [google-sheets-integration/SHEETS_SETUP_GUIDE.md](file:///e:/CSE%20LIB/google-sheets-integration/SHEETS_SETUP_GUIDE.md).
2. Create your spreadsheet named `ScholarLib College Library Database`.
3. Open `Extensions > Apps Script` and paste the contents of `google-sheets-integration/Code.gs`.
4. Run `initializeSpreadsheet` once to automatically build all 5 tabs (`Books`, `Transactions`, `Students`, `Users`, `Settings`).
5. Deploy as Web App (Execute as: `Me`, Who has access: `Anyone`).
6. Paste your Web App URL into `.env`:
   ```env
   STORAGE_TYPE=sheets
   GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```
7. Restart the server!

---

## 📄 License
ISC License — College of Engineering & Technology.
