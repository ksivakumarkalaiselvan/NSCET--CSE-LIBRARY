# 📊 Google Sheets Database Manual Setup Guide

This guide describes how to manually create and configure your Google Sheets database for the **ScholarLib** Library Management System.

---

## 1. Why Google Sheets is Used
Google Sheets serves as a cloud-hosted, collaborative database:
- Zero hosting cost.
- Direct spreadsheet inspection for college library staff.
- Backed by Google Cloud infrastructure with Google Apps Script Web App providing REST API access.
- Concurrency locks (`LockService`) to protect book copy counts.

---

## 2. Spreadsheet Name
Create a new Google Spreadsheet and name it:
```text
ScholarLib College Library Database
```

---

## 3. Worksheets (Tabs) & Exact Column Headers

Create the following **5 tabs** in your spreadsheet. The column headers must be in row 1, matching the exact order and casing below:

### Tab 1: `Books`
**Column Headers (Row 1):**
`id` | `isbn` | `title` | `author` | `publisher` | `category` | `edition` | `publishedYear` | `totalCopies` | `availableCopies` | `rackNumber` | `coverUrl` | `description` | `status` | `createdAt`

**Sample Row (Row 2):**
- `id`: `BK-1001`
- `isbn`: `978-0134685991`
- `title`: `Java: The Complete Reference`
- `author`: `Herbert Schildt`
- `publisher`: `McGraw-Hill Education`
- `category`: `Programming`
- `edition`: `11th Edition`
- `publishedYear`: `2019`
- `totalCopies`: `10`
- `availableCopies`: `7`
- `rackNumber`: `Rack A-01`
- `coverUrl`: `https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400`
- `description`: `Comprehensive guide to Java SE programming.`
- `status`: `Available`
- `createdAt`: `2026-01-20`

---

### Tab 2: `Transactions`
**Column Headers (Row 1):**
`id` | `studentId` | `studentRegNo` | `studentName` | `bookId` | `bookTitle` | `issueDate` | `dueDate` | `returnDate` | `status` | `fineAmount` | `finePaid` | `issuedBy` | `notes`

**Sample Row (Row 2):**
- `id`: `TXN-2026-001`
- `studentId`: `STU-101`
- `studentRegNo`: `CS2023001`
- `studentName`: `Aarav Sharma`
- `bookId`: `BK-1001`
- `bookTitle`: `Java: The Complete Reference`
- `issueDate`: `2026-10-15`
- `dueDate`: `2026-10-29`
- `returnDate`: `` (empty while on loan)
- `status`: `ISSUED`
- `fineAmount`: `0`
- `finePaid`: `FALSE`
- `issuedBy`: `Ms. Geetha Ramanathan`
- `notes`: `Semester reference`

---

### Tab 3: `Students`
**Column Headers (Row 1):**
`id` | `regNo` | `name` | `department` | `email` | `phone` | `status` | `passwordHash` | `createdAt`

**Sample Row (Row 2):**
- `id`: `STU-101`
- `regNo`: `CS2023001`
- `name`: `Aarav Sharma`
- `department`: `Computer Science & Engineering`
- `email`: `student@college.edu`
- `phone`: `+91 98765 43210`
- `status`: `Active`
- `passwordHash`: `$2b$10$hJU/eLvBJEwbUrCC1IznGev.E8L7.aXMeQApv8/vkiekmyN2jfI82`
- `createdAt`: `2026-02-01`

---

### Tab 4: `Users` (Staff & Librarians)
**Column Headers (Row 1):**
`id` | `name` | `email` | `phone` | `role` | `status` | `passwordHash` | `createdAt`

**Sample Row 1 (Admin - Row 2):**
- `id`: `USR-001`
- `name`: `Prof. ARCHANA .R`
- `email`: `admin@college.edu`
- `phone`: `+91 94441 23456`
- `role`: `admin`
- `status`: `Active`
- `passwordHash`: `$2b$10$ewJAzLz7n6GNoJBZ4xzVbOOill6KVDio/O4jBkJgQw5BEiTF.HE/6`
- `createdAt`: `2026-01-10`

**Sample Row 2 (Librarian - Row 3):**
- `id`: `USR-002`
- `name`: `Ms. Geetha Ramanathan`
- `email`: `librarian@college.edu`
- `phone`: `+91 98842 67890`
- `role`: `librarian`
- `status`: `Active`
- `passwordHash`: `$2b$10$nVDPJ2fsStvBoNOxuryBWuhzbdJ3oOALC9Ij.l9hdo4G17TSwBWD6`
- `createdAt`: `2026-01-15`

---

### Tab 5: `Settings`
**Column Headers (Row 1):**
`key` | `value`

**Sample Rows:**
- Row 2: `defaultLoanDays` | `14`
- Row 3: `finePerDay` | `5`
- Row 4: `maxBorrowLimit` | `3`
- Row 5: `collegeName` | `Central College Library`

---

## 4. Google Apps Script Setup (Automated Alternative)
Instead of creating all tabs and columns by hand, you can let Apps Script create them automatically:

1. In your newly created spreadsheet, click **Extensions > Apps Script**.
2. Replace any code in `Code.gs` with the complete script from `google-sheets-integration/Code.gs`.
3. Select the function `initializeSpreadsheet` from the dropdown at the top and click **Run**.
4. Grant the one-time Google authorization. It will automatically build all 5 tabs and headers!

---

## 5. Deploy as Web App
1. In the Apps Script editor, click **Deploy > New deployment** (top right).
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `ScholarLib Production API`
   - **Execute as**: `Me (<your_email@gmail.com>)`
   - **Who has access**: `Anyone`
4. Click **Deploy**.
5. Copy the **Web App URL** (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 6. Connect to ScholarLib Backend
In your project `.env` file, update:
```env
STORAGE_TYPE=sheets
GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```
Restart the server, and ScholarLib will now persist all data directly to your live Google Sheets!
