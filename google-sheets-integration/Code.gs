/**
 * =========================================================================
 * ScholarLib — College Library Management System
 * Google Apps Script Web App Backend Connector (Code.gs)
 * =========================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.google.com).
 * 2. Create a new Spreadsheet named: "ScholarLib College Library Database".
 * 3. Open Extensions > Apps Script.
 * 4. Paste this complete code into Code.gs (replacing any existing code).
 * 5. Run the function `initializeSpreadsheet()` once to create all tabs with headers & sample rows automatically.
 * 6. Click "Deploy" > "New deployment".
 *    - Type: Web app
 *    - Description: ScholarLib API v1
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone (allows your Node.js backend to connect securely)
 * 7. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 *    and provide it to your application (.env -> GOOGLE_SHEETS_SCRIPT_URL).
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  const lock = LockService.getScriptLock();
  try {
    // Acquire a 15-second lock to ensure concurrency safety on issue/return transactions
    lock.waitLock(15000);

    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    const action = body.action || (e && e.parameter ? e.parameter.action : '');
    const payload = body.payload || {};

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let result = null;

    switch (action) {
      case 'ping':
        result = { status: 'healthy', timestamp: new Date().toISOString() };
        break;

      case 'getBooks':
        result = getBooks(ss, payload.filter);
        break;

      case 'getBookById':
        result = getBookById(ss, payload.id);
        break;

      case 'getBookByIsbn':
        result = getBookByIsbn(ss, payload.isbn);
        break;

      case 'addBook':
        result = addBook(ss, payload.book);
        break;

      case 'updateBook':
        result = updateBook(ss, payload.id, payload.book);
        break;

      case 'deleteBook':
        result = deleteBook(ss, payload.id);
        break;

      case 'getCategories':
        result = getCategories(ss);
        break;

      case 'getTransactions':
        result = getTransactions(ss, payload.filter);
        break;

      case 'issueBook':
        result = issueBook(ss, payload);
        break;

      case 'returnBook':
        result = returnBook(ss, payload.transactionId, payload.returnDate, payload.notes);
        break;

      case 'getStudents':
        result = getStudents(ss, payload.search);
        break;

      case 'registerStudent':
        result = registerStudent(ss, payload.student);
        break;

      case 'toggleStudentStatus':
        result = toggleStudentStatus(ss, payload.id);
        break;

      case 'deleteStudent':
        result = deleteStudent(ss, payload.id);
        break;

      case 'getLibrarians':
        result = getLibrarians(ss);
        break;

      case 'addLibrarian':
        result = addLibrarian(ss, payload.librarian);
        break;

      case 'toggleLibrarianStatus':
        result = toggleLibrarianStatus(ss, payload.id);
        break;

      case 'deleteLibrarian':
        result = deleteLibrarian(ss, payload.id);
        break;

      case 'getSettings':
        result = getSettings(ss);
        break;

      case 'updateSettings':
        result = updateSettings(ss, payload.settings);
        break;

      case 'getDashboardStats':
        result = getDashboardStats(ss);
        break;

      case 'findUserByEmail':
        result = findUserByEmail(ss, payload.email);
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// --- INITIALIZE SPREADSHEET STRUCTURE ---
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheetsConfig = {
    'Books': [
      'id', 'isbn', 'title', 'author', 'publisher', 'category', 'edition',
      'publishedYear', 'totalCopies', 'availableCopies', 'rackNumber',
      'coverUrl', 'description', 'status', 'createdAt'
    ],
    'Transactions': [
      'id', 'studentId', 'studentRegNo', 'studentName', 'bookId', 'bookTitle',
      'issueDate', 'dueDate', 'returnDate', 'status', 'fineAmount', 'finePaid',
      'issuedBy', 'notes'
    ],
    'Students': [
      'id', 'regNo', 'name', 'department', 'email', 'phone', 'status', 'passwordHash', 'createdAt'
    ],
    'Users': [
      'id', 'name', 'email', 'phone', 'role', 'status', 'passwordHash', 'createdAt'
    ],
    'Settings': [
      'key', 'value'
    ]
  };

  for (let sheetName in sheetsConfig) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const headers = sheetsConfig[sheetName];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f1f5f9');
    }
  }

  // Seed default settings if empty
  const settingsSheet = ss.getSheetByName('Settings');
  if (settingsSheet.getLastRow() <= 1) {
    settingsSheet.appendRow(['defaultLoanDays', '14']);
    settingsSheet.appendRow(['finePerDay', '5']);
    settingsSheet.appendRow(['maxBorrowLimit', '3']);
    settingsSheet.appendRow(['collegeName', 'Central College Library']);
  }

  Logger.log('Spreadsheet successfully initialized with all required tabs and headers!');
}

// --- HELPER: SHEET TO OBJECTS ---
function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    obj._rowIndex = i + 1; // 1-based index in Sheet
    data.push(obj);
  }
  return data;
}

// --- BOOKS OPERATIONS ---
function getBooks(ss, filter) {
  const books = getSheetData(ss, 'Books');
  filter = filter || {};

  let result = books.map(b => ({
    ...b,
    totalCopies: parseInt(b.totalCopies, 10) || 0,
    availableCopies: parseInt(b.availableCopies, 10) || 0,
    publishedYear: parseInt(b.publishedYear, 10) || 2020
  }));

  if (filter.availableOnly === true || filter.availableOnly === 'true') {
    result = result.filter(b => b.availableCopies > 0);
  }

  if (filter.category && filter.category !== 'All') {
    result = result.filter(b => (b.category || '').toLowerCase() === filter.category.toLowerCase());
  }

  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(b =>
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.isbn || '').toLowerCase().includes(q) ||
      (b.rackNumber || '').toLowerCase().includes(q)
    );
  }

  return result;
}

function getBookById(ss, id) {
  const books = getBooks(ss, {});
  return books.find(b => b.id === id) || null;
}

function getBookByIsbn(ss, isbn) {
  const books = getBooks(ss, {});
  return books.find(b => (b.isbn || '').trim().toLowerCase() === (isbn || '').trim().toLowerCase()) || null;
}

function addBook(ss, bookData) {
  const existing = getBookByIsbn(ss, bookData.isbn);
  if (existing) {
    throw new Error('A book with ISBN ' + bookData.isbn + ' already exists.');
  }

  const sheet = ss.getSheetByName('Books');
  const id = 'BK-' + new Date().getTime().toString().slice(-6);
  const total = parseInt(bookData.totalCopies, 10);
  const createdAt = Utilities.formatDate(new Date(), 'GMT+05:30', 'yyyy-MM-dd');

  const row = [
    id,
    bookData.isbn,
    bookData.title,
    bookData.author,
    bookData.publisher || '',
    bookData.category,
    bookData.edition || '1st Edition',
    bookData.publishedYear || new Date().getFullYear(),
    total,
    total, // availableCopies initialized to totalCopies
    bookData.rackNumber,
    bookData.coverUrl || '',
    bookData.description || '',
    'Available',
    createdAt
  ];

  sheet.appendRow(row);
  return getBookById(ss, id);
}

function updateBook(ss, id, bookData) {
  const sheet = ss.getSheetByName('Books');
  const books = getSheetData(ss, 'Books');
  const target = books.find(b => b.id === id);
  if (!target) throw new Error('Book not found: ' + id);

  const rowIndex = target._rowIndex;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  for (let key in bookData) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1 && bookData[key] !== undefined) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(bookData[key]);
    }
  }

  return getBookById(ss, id);
}

function deleteBook(ss, id) {
  const sheet = ss.getSheetByName('Books');
  const books = getSheetData(ss, 'Books');
  const target = books.find(b => b.id === id);
  if (!target) throw new Error('Book not found: ' + id);

  // Check active transactions
  const txns = getTransactions(ss, { status: 'ISSUED', bookId: id });
  if (txns.length > 0) {
    throw new Error('Cannot delete book with active loans.');
  }

  sheet.deleteRow(target._rowIndex);
  return target;
}

function getCategories(ss) {
  const books = getBooks(ss, {});
  const cats = {};
  books.forEach(b => { if (b.category) cats[b.category] = true; });
  return Object.keys(cats).sort();
}

// --- TRANSACTIONS ---
function getTransactions(ss, filter) {
  const txns = getSheetData(ss, 'Transactions');
  filter = filter || {};

  let result = txns.map(t => ({
    ...t,
    fineAmount: parseFloat(t.fineAmount) || 0,
    finePaid: t.finePaid === true || t.finePaid === 'TRUE' || t.finePaid === 'true'
  }));

  if (filter.status) {
    result = result.filter(t => t.status === filter.status);
  }
  if (filter.studentId) {
    result = result.filter(t => t.studentId === filter.studentId);
  }
  if (filter.bookId) {
    result = result.filter(t => t.bookId === filter.bookId);
  }

  return result;
}

function issueBook(ss, payload) {
  const book = getBookById(ss, payload.bookId);
  if (!book) throw new Error('Book not found.');
  if (book.availableCopies <= 0) throw new Error('No available copies for ' + book.title);

  const txnSheet = ss.getSheetByName('Transactions');
  const txnId = 'TXN-' + new Date().getTime().toString().slice(-6);
  const issueDate = payload.issueDate || Utilities.formatDate(new Date(), 'GMT+05:30', 'yyyy-MM-dd');
  
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const dueDate = payload.dueDate || Utilities.formatDate(due, 'GMT+05:30', 'yyyy-MM-dd');

  // Append transaction
  txnSheet.appendRow([
    txnId,
    payload.studentId,
    payload.studentRegNo || '',
    payload.studentName || '',
    book.id,
    book.title,
    issueDate,
    dueDate,
    '',
    'ISSUED',
    0,
    false,
    payload.issuedBy || 'Admin',
    payload.notes || ''
  ]);

  // Decrement book availability in Books sheet
  const newAvail = book.availableCopies - 1;
  const newStatus = newAvail > 0 ? 'Available' : 'Currently Unavailable';
  updateBook(ss, book.id, { availableCopies: newAvail, status: newStatus });

  return {
    transaction: { id: txnId, bookTitle: book.title, status: 'ISSUED', issueDate, dueDate },
    book: getBookById(ss, book.id)
  };
}

function returnBook(ss, txnId, returnDate, notes) {
  const txnSheet = ss.getSheetByName('Transactions');
  const txns = getSheetData(ss, 'Transactions');
  const txn = txns.find(t => t.id === txnId);
  if (!txn) throw new Error('Transaction not found.');
  if (txn.status === 'RETURNED') throw new Error('Already returned.');

  const actualReturnDate = returnDate || Utilities.formatDate(new Date(), 'GMT+05:30', 'yyyy-MM-dd');
  const headers = txnSheet.getRange(1, 1, 1, txnSheet.getLastColumn()).getValues()[0];
  const rowIdx = txn._rowIndex;

  // Mark status RETURNED
  txnSheet.getRange(rowIdx, headers.indexOf('status') + 1).setValue('RETURNED');
  txnSheet.getRange(rowIdx, headers.indexOf('returnDate') + 1).setValue(actualReturnDate);

  // Increment book availability in Books sheet
  const book = getBookById(ss, txn.bookId);
  if (book) {
    const newAvail = book.availableCopies + 1;
    updateBook(ss, book.id, { availableCopies: newAvail, status: 'Available' });
  }

  return {
    transaction: { id: txnId, status: 'RETURNED', returnDate: actualReturnDate },
    book: getBookById(ss, txn.bookId),
    overdueDays: 0,
    fineAmount: 0
  };
}

// --- DASHBOARD STATS ---
function getDashboardStats(ss) {
  const books = getBooks(ss, {});
  const txns = getTransactions(ss, { status: 'ISSUED' });
  const students = getSheetData(ss, 'Students');
  const users = getSheetData(ss, 'Users');

  let totalPhysicalCopies = 0;
  let availableCopies = 0;

  books.forEach(b => {
    totalPhysicalCopies += (b.totalCopies || 0);
    availableCopies += (b.availableCopies || 0);
  });

  return {
    totalTitles: books.length,
    totalPhysicalCopies,
    availableCopies,
    issuedCopies: txns.length,
    registeredStudents: students.length,
    registeredLibrarians: users.filter(u => u.role === 'librarian').length,
    overdueTransactions: 0,
    outstandingFines: 0,
    currentlyAvailableBooks: books.filter(b => b.availableCopies > 0).slice(0, 6),
    recentlyAddedBooks: books.slice(0, 5)
  };
}

// --- USERS & AUTH ---
function findUserByEmail(ss, email) {
  const users = getSheetData(ss, 'Users');
  const staff = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
  if (staff) return staff;

  const students = getSheetData(ss, 'Students');
  const stu = students.find(s => (s.email || '').toLowerCase() === (email || '').toLowerCase());
  if (stu) return { ...stu, role: 'student' };

  return null;
}

function getStudents(ss, search) {
  return getSheetData(ss, 'Students');
}

function registerStudent(ss, student) {
  const sheet = ss.getSheetByName('Students');
  const id = 'STU-' + new Date().getTime().toString().slice(-4);
  const row = [
    id,
    student.regNo,
    student.name,
    student.department,
    student.email,
    student.phone || '',
    'Active',
    student.passwordHash || '',
    Utilities.formatDate(new Date(), 'GMT+05:30', 'yyyy-MM-dd')
  ];
  sheet.appendRow(row);
  return { id, ...student, status: 'Active' };
}

function toggleStudentStatus(ss, id) {
  const sheet = ss.getSheetByName('Students');
  const students = getSheetData(ss, 'Students');
  const target = students.find(s => s.id === id);
  if (!target) throw new Error('Student not found');
  const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(target._rowIndex, headers.indexOf('status') + 1).setValue(newStatus);
  return { ...target, status: newStatus };
}

function deleteStudent(ss, id) {
  const sheet = ss.getSheetByName('Students');
  const students = getSheetData(ss, 'Students');
  const target = students.find(s => s.id === id);
  if (!target) throw new Error('Student not found');

  const txns = getSheetData(ss, 'Transactions');
  const hasActive = txns.some(t => (t.studentId === id || t.studentRegNo === target.regNo) && (t.status === 'ISSUED' || t.status === 'Issued'));
  if (hasActive) {
    throw new Error('Cannot remove student: student currently has active unreturned book(s).');
  }

  sheet.deleteRow(target._rowIndex);
  return target;
}

function getLibrarians(ss) {
  const users = getSheetData(ss, 'Users');
  return users.filter(u => u.role === 'librarian');
}

function addLibrarian(ss, lib) {
  const sheet = ss.getSheetByName('Users');
  const id = 'LIB-' + new Date().getTime().toString().slice(-4);
  const row = [
    id,
    lib.name,
    lib.email,
    lib.phone || '',
    'librarian',
    'Active',
    lib.passwordHash || '',
    Utilities.formatDate(new Date(), 'GMT+05:30', 'yyyy-MM-dd')
  ];
  sheet.appendRow(row);
  return { id, ...lib, role: 'librarian', status: 'Active' };
}

function toggleLibrarianStatus(ss, id) {
  const sheet = ss.getSheetByName('Users');
  const users = getSheetData(ss, 'Users');
  const target = users.find(u => u.id === id && u.role === 'librarian');
  if (!target) throw new Error('Librarian not found');
  const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.getRange(target._rowIndex, headers.indexOf('status') + 1).setValue(newStatus);
  return { ...target, status: newStatus };
}

function deleteLibrarian(ss, id) {
  const sheet = ss.getSheetByName('Users');
  const users = getSheetData(ss, 'Users');
  const target = users.find(u => u.id === id && u.role === 'librarian');
  if (!target) throw new Error('Librarian not found');

  sheet.deleteRow(target._rowIndex);
  return target;
}

function getSettings(ss) {
  const rows = getSheetData(ss, 'Settings');
  const settings = {};
  rows.forEach(r => {
    if (r.key) settings[r.key] = r.value;
  });
  return settings;
}

function updateSettings(ss, newSettings) {
  const sheet = ss.getSheetByName('Settings');
  const rows = getSheetData(ss, 'Settings');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  for (let key in newSettings) {
    const existing = rows.find(r => r.key === key);
    if (existing) {
      sheet.getRange(existing._rowIndex, headers.indexOf('value') + 1).setValue(newSettings[key]);
    } else {
      sheet.appendRow([key, newSettings[key]]);
    }
  }
  return getSettings(ss);
}
