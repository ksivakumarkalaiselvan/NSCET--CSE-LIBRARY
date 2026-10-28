const { formatDate, calculateDueDate, calculateOverdueDays, calculateFine, generateId } = require('../utils/helpers');

// In-Memory Data Store with comprehensive College Library Demo Data
class DemoDataStore {
  constructor() {
    this.init();
  }

  init() {
    this.settings = {
      defaultLoanDays: 14,
      finePerDay: 5.0,
      maxBorrowLimit: 3,
      collegeName: 'NSCET - Department of Computer Science & Engineering (CSE)'
    };

    this.users = [
      {
        id: 'USR-001',
        name: 'Prof. ARCHANA .R',
        email: 'admin@college.edu',
        phone: '+91 94441 23456',
        role: 'admin',
        status: 'Active',
        passwordHash: '$2b$10$ewJAzLz7n6GNoJBZ4xzVbOOill6KVDio/O4jBkJgQw5BEiTF.HE/6', // admin123
        createdAt: '2026-01-10'
      },
      {
        id: 'USR-002',
        name: 'Ms. Geetha Ramanathan',
        email: 'librarian@college.edu',
        phone: '+91 98842 67890',
        role: 'librarian',
        status: 'Active',
        passwordHash: '$2b$10$nVDPJ2fsStvBoNOxuryBWuhzbdJ3oOALC9Ij.l9hdo4G17TSwBWD6', // lib123
        createdAt: '2026-01-15'
      }
    ];

    this.students = [
      {
        id: 'STU-101',
        regNo: 'CS2023001',
        name: 'Aarav Sharma',
        department: 'Computer Science & Engineering',
        email: 'student@college.edu',
        phone: '+91 98765 43210',
        status: 'Active',
        passwordHash: '$2b$10$hJU/eLvBJEwbUrCC1IznGev.E8L7.aXMeQApv8/vkiekmyN2jfI82', // stu123
        createdAt: '2026-02-01'
      },
      {
        id: 'STU-102',
        regNo: 'CS2023002',
        name: 'Priya Patel',
        department: 'Information Technology',
        email: 'priya.cs@college.edu',
        phone: '+91 97890 12345',
        status: 'Active',
        passwordHash: '$2b$10$hJU/eLvBJEwbUrCC1IznGev.E8L7.aXMeQApv8/vkiekmyN2jfI82', // stu123
        createdAt: '2026-02-02'
      },
      {
        id: 'STU-103',
        regNo: 'CS2023003',
        name: 'Rohit Verma',
        department: 'Computer Science & Engineering',
        email: 'rohit.cs@college.edu',
        phone: '+91 91234 56789',
        status: 'Active',
        passwordHash: '$2b$10$hJU/eLvBJEwbUrCC1IznGev.E8L7.aXMeQApv8/vkiekmyN2jfI82', // stu123
        createdAt: '2026-02-03'
      },
      {
        id: 'STU-104',
        regNo: 'CS2023004',
        name: 'Ananya Iyer',
        department: 'Artificial Intelligence & Data Science',
        email: 'ananya.ai@college.edu',
        phone: '+91 93456 78901',
        status: 'Active',
        passwordHash: '$2b$10$hJU/eLvBJEwbUrCC1IznGev.E8L7.aXMeQApv8/vkiekmyN2jfI82', // stu123
        createdAt: '2026-02-04'
      },
      {
        id: 'STU-105',
        regNo: 'CS2023005',
        name: 'Karthik Raja',
        department: 'Electronics & Communication',
        email: 'karthik.ece@college.edu',
        phone: '+91 95678 12340',
        status: 'Inactive',
        passwordHash: '$2b$10$hJU/eLvBJEwbUrCC1IznGev.E8L7.aXMeQApv8/vkiekmyN2jfI82', // stu123
        createdAt: '2026-02-05'
      }
    ];

    this.books = [
      {
        id: 'BK-1001',
        isbn: '978-0134685991',
        title: 'Java: The Complete Reference',
        author: 'Herbert Schildt',
        publisher: 'McGraw-Hill Education',
        category: 'Programming',
        edition: '11th Edition',
        publishedYear: 2019,
        totalCopies: 10,
        availableCopies: 7,
        rackNumber: 'A-01',
        coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&auto=format&fit=crop&q=80',
        description: 'Comprehensive guide covering Java SE fundamentals, OOP, streams, concurrency, and modern language features.',
        status: 'Available',
        createdAt: '2026-01-20'
      },
      {
        id: 'BK-1002',
        isbn: '978-0132847377',
        title: 'Data Structures and Algorithm Analysis in C++',
        author: 'Mark Allen Weiss',
        publisher: 'Pearson',
        category: 'Computer Science',
        edition: '4th Edition',
        publishedYear: 2014,
        totalCopies: 5,
        availableCopies: 0,
        rackNumber: 'B-02',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        description: 'Advanced data structures and algorithm design principles with rigorous mathematical analysis in C++.',
        status: 'Currently Unavailable',
        createdAt: '2026-01-22'
      },
      {
        id: 'BK-1003',
        isbn: '978-0262033848',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        publisher: 'MIT Press',
        category: 'Algorithms',
        edition: '3rd Edition',
        publishedYear: 2009,
        totalCopies: 8,
        availableCopies: 5,
        rackNumber: 'A-02',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
        description: 'The premier standard textbook on modern computer algorithms, asymptotic analysis, dynamic programming, and graph theory.',
        status: 'Available',
        createdAt: '2026-01-25'
      },
      {
        id: 'BK-1004',
        isbn: '978-0132350884',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        category: 'Software Engineering',
        edition: '1st Edition',
        publishedYear: 2008,
        totalCopies: 6,
        availableCopies: 4,
        rackNumber: 'C-01',
        coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80',
        description: 'Best practices for writing readable, maintainable, testable code, refactoring code smells, and designing solid architecture.',
        status: 'Available',
        createdAt: '2026-02-01'
      },
      {
        id: 'BK-1005',
        isbn: '978-0134610993',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        publisher: 'Pearson',
        category: 'Artificial Intelligence',
        edition: '4th Edition',
        publishedYear: 2020,
        totalCopies: 4,
        availableCopies: 2,
        rackNumber: 'D-01',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
        description: 'The authoritative global reference on intelligent agents, machine learning, probabilistic reasoning, and robotics.',
        status: 'Available',
        createdAt: '2026-02-05'
      },
      {
        id: 'BK-1006',
        isbn: '978-0078022159',
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
        publisher: 'McGraw-Hill Education',
        category: 'Database Systems',
        edition: '7th Edition',
        publishedYear: 2019,
        totalCopies: 7,
        availableCopies: 6,
        rackNumber: 'B-01',
        coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
        description: 'Fundamental concepts of database management, SQL, relational schema design, query optimization, and transactions.',
        status: 'Available',
        createdAt: '2026-02-10'
      },
      {
        id: 'BK-1007',
        isbn: '978-0133594140',
        title: 'Computer Networking: A Top-Down Approach',
        author: 'James F. Kurose, Keith W. Ross',
        publisher: 'Pearson',
        category: 'Computer Networks',
        edition: '7th Edition',
        publishedYear: 2016,
        totalCopies: 5,
        availableCopies: 3,
        rackNumber: 'E-02',
        coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
        description: 'A top-down approach focusing on the Internet architecture, transport protocols, routing algorithms, and network security.',
        status: 'Available',
        createdAt: '2026-02-12'
      },
      {
        id: 'BK-1008',
        isbn: '978-1118063330',
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
        publisher: 'Wiley',
        category: 'Operating Systems',
        edition: '9th Edition',
        publishedYear: 2012,
        totalCopies: 6,
        availableCopies: 0,
        rackNumber: 'E-01',
        coverUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80',
        description: 'Core concepts in operating system architecture, process scheduling, memory virtualization, synchronization, and storage.',
        status: 'Currently Unavailable',
        createdAt: '2026-02-15'
      },
      {
        id: 'BK-1009',
        isbn: '978-0262035613',
        title: 'Deep Learning',
        author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
        publisher: 'MIT Press',
        category: 'Artificial Intelligence',
        edition: '1st Edition',
        publishedYear: 2016,
        totalCopies: 4,
        availableCopies: 3,
        rackNumber: 'D-02',
        coverUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be7f7b2c?w=400&auto=format&fit=crop&q=80',
        description: 'Deep neural networks, backpropagation, convolutional networks, sequence models, and deep generative models.',
        status: 'Available',
        createdAt: '2026-02-20'
      },
      {
        id: 'BK-1010',
        isbn: '978-1491903070',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        publisher: "O'Reilly Media",
        category: 'Computer Science',
        edition: '1st Edition',
        publishedYear: 2017,
        totalCopies: 5,
        availableCopies: 5,
        rackNumber: 'C-02',
        coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
        description: 'The definitive handbook for reliability, scalability, and maintainability in distributed databases and stream systems.',
        status: 'Available',
        createdAt: '2026-02-22'
      },
      {
        id: 'BK-1011',
        isbn: '978-1593279509',
        title: 'Eloquent JavaScript: A Modern Introduction',
        author: 'Marijn Haverbeke',
        publisher: 'No Starch Press',
        category: 'Web Development',
        edition: '3rd Edition',
        publishedYear: 2018,
        totalCopies: 6,
        availableCopies: 4,
        rackNumber: 'A-03',
        coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
        description: 'A dive into JavaScript, browser runtime, asynchronous programming, DOM manipulation, and Node.js backend development.',
        status: 'Available',
        createdAt: '2026-02-25'
      },
      {
        id: 'BK-1012',
        isbn: '978-1492032649',
        title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
        author: 'Aurélien Géron',
        publisher: "O'Reilly Media",
        category: 'Data Science',
        edition: '2nd Edition',
        publishedYear: 2019,
        totalCopies: 4,
        availableCopies: 1,
        rackNumber: 'D-03',
        coverUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&auto=format&fit=crop&q=80',
        description: 'Practical guide to building intelligent machine learning and deep learning pipelines with modern Python frameworks.',
        status: 'Available',
        createdAt: '2026-02-28'
      }
    ];

    // Historical and Active Transactions
    this.transactions = [
      {
        id: 'TXN-2026-001',
        studentId: 'STU-101',
        studentRegNo: 'CS2023001',
        studentName: 'Aarav Sharma',
        bookId: 'BK-1001',
        bookTitle: 'Java: The Complete Reference',
        issueDate: '2026-10-15',
        dueDate: '2026-10-29',
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        finePaid: false,
        issuedBy: 'Ms. Geetha Ramanathan',
        notes: 'Semester reference'
      },
      {
        id: 'TXN-2026-002',
        studentId: 'STU-102',
        studentRegNo: 'CS2023002',
        studentName: 'Priya Patel',
        bookId: 'BK-1001',
        bookTitle: 'Java: The Complete Reference',
        issueDate: '2026-10-18',
        dueDate: '2026-11-01',
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        finePaid: false,
        issuedBy: 'Prof. ARCHANA .R',
        notes: 'Project work'
      },
      {
        id: 'TXN-2026-003',
        studentId: 'STU-103',
        studentRegNo: 'CS2023003',
        studentName: 'Rohit Verma',
        bookId: 'BK-1001',
        bookTitle: 'Java: The Complete Reference',
        issueDate: '2026-10-20',
        dueDate: '2026-11-03',
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        finePaid: false,
        issuedBy: 'Ms. Geetha Ramanathan',
        notes: ''
      },
      // Data Structures - all 5 copies issued to demonstrate 0 availability
      {
        id: 'TXN-2026-004',
        studentId: 'STU-101',
        studentRegNo: 'CS2023001',
        studentName: 'Aarav Sharma',
        bookId: 'BK-1002',
        bookTitle: 'Data Structures and Algorithm Analysis in C++',
        issueDate: '2026-10-10',
        dueDate: '2026-10-24', // Overdue!
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 20,
        finePaid: false,
        issuedBy: 'Ms. Geetha Ramanathan',
        notes: 'Needs immediate follow-up'
      },
      {
        id: 'TXN-2026-005',
        studentId: 'STU-102',
        studentRegNo: 'CS2023002',
        studentName: 'Priya Patel',
        bookId: 'BK-1002',
        bookTitle: 'Data Structures and Algorithm Analysis in C++',
        issueDate: '2026-10-12',
        dueDate: '2026-10-26', // Overdue!
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 10,
        finePaid: false,
        issuedBy: 'Ms. Geetha Ramanathan',
        notes: ''
      },
      {
        id: 'TXN-2026-006',
        studentId: 'STU-103',
        studentRegNo: 'CS2023003',
        studentName: 'Rohit Verma',
        bookId: 'BK-1002',
        bookTitle: 'Data Structures and Algorithm Analysis in C++',
        issueDate: '2026-10-16',
        dueDate: '2026-10-30',
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        finePaid: false,
        issuedBy: 'Prof. ARCHANA .R',
        notes: ''
      },
      {
        id: 'TXN-2026-007',
        studentId: 'STU-104',
        studentRegNo: 'CS2023004',
        studentName: 'Ananya Iyer',
        bookId: 'BK-1002',
        bookTitle: 'Data Structures and Algorithm Analysis in C++',
        issueDate: '2026-10-22',
        dueDate: '2026-11-05',
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        finePaid: false,
        issuedBy: 'Ms. Geetha Ramanathan',
        notes: ''
      },
      {
        id: 'TXN-2026-008',
        studentId: 'STU-101',
        studentRegNo: 'CS2023001',
        studentName: 'Aarav Sharma',
        bookId: 'BK-1002',
        bookTitle: 'Data Structures and Algorithm Analysis in C++',
        issueDate: '2026-10-25',
        dueDate: '2026-11-08',
        returnDate: null,
        status: 'ISSUED',
        fineAmount: 0,
        finePaid: false,
        issuedBy: 'Prof. ARCHANA .R',
        notes: ''
      },
      // Returned transaction example
      {
        id: 'TXN-2026-000',
        studentId: 'STU-104',
        studentRegNo: 'CS2023004',
        studentName: 'Ananya Iyer',
        bookId: 'BK-1006',
        bookTitle: 'Database System Concepts',
        issueDate: '2026-10-01',
        dueDate: '2026-10-15',
        returnDate: '2026-10-14',
        status: 'RETURNED',
        fineAmount: 0,
        finePaid: true,
        issuedBy: 'Ms. Geetha Ramanathan',
        notes: 'Returned in pristine condition'
      }
    ];

    // Synchronize initial book availability from actual active transactions
    this.recalculateAllBookAvailabilities();
  }

  /**
   * Automatic availability calculation:
   * Available Copies = Total Copies - Currently Issued Copies
   */
  recalculateBookAvailability(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return null;

    const activeIssuedCount = this.transactions.filter(
      t => t.bookId === bookId && t.status === 'ISSUED'
    ).length;

    book.availableCopies = Math.max(0, book.totalCopies - activeIssuedCount);
    book.status = book.availableCopies > 0 ? 'Available' : 'Currently Unavailable';
    return book;
  }

  recalculateAllBookAvailabilities() {
    this.books.forEach(book => {
      this.recalculateBookAvailability(book.id);
    });
  }

  // --- BOOKS METHODS ---

  async getBooks(filter = {}) {
    let result = [...this.books];

    if (filter.availableOnly === true || filter.availableOnly === 'true') {
      result = result.filter(b => b.availableCopies > 0);
    }

    if (filter.category && filter.category !== 'All') {
      result = result.filter(b => b.category.toLowerCase() === filter.category.toLowerCase());
    }

    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.rackNumber && b.rackNumber.toLowerCase().includes(q))
      );
    }

    if (filter.sort) {
      switch (filter.sort) {
        case 'title-asc':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'title-desc':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'author-asc':
          result.sort((a, b) => a.author.localeCompare(b.author));
          break;
        case 'available-desc':
          result.sort((a, b) => b.availableCopies - a.availableCopies);
          break;
        case 'recent':
        default:
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
    }

    return result;
  }

  async getBookById(id) {
    return this.books.find(b => b.id === id) || null;
  }

  async getBookByIsbn(isbn) {
    return this.books.find(b => b.isbn.trim().toLowerCase() === isbn.trim().toLowerCase()) || null;
  }

  async addBook(bookData) {
    const existing = await this.getBookByIsbn(bookData.isbn);
    if (existing) {
      throw new Error(`A book with ISBN ${bookData.isbn} already exists ("${existing.title}"). Duplicate ISBNs are not permitted.`);
    }

    const totalCopies = parseInt(bookData.totalCopies, 10);
    if (isNaN(totalCopies) || totalCopies <= 0) {
      throw new Error('Total Copies must be a positive integer greater than zero.');
    }

    const newBook = {
      id: generateId('BK'),
      isbn: bookData.isbn.trim(),
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      publisher: (bookData.publisher || 'Not Specified').trim(),
      category: bookData.category.trim(),
      edition: (bookData.edition || '1st Edition').trim(),
      publishedYear: parseInt(bookData.publishedYear, 10) || new Date().getFullYear(),
      totalCopies: totalCopies,
      availableCopies: totalCopies, // Initially all copies are available
      rackNumber: bookData.rackNumber.trim(),
      coverUrl: bookData.coverUrl && bookData.coverUrl.trim() 
        ? bookData.coverUrl.trim() 
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      description: (bookData.description || '').trim(),
      status: 'Available',
      createdAt: formatDate(new Date())
    };

    this.books.unshift(newBook);
    return newBook;
  }

  async updateBook(id, bookData) {
    const bookIndex = this.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      throw new Error(`Book with ID "${id}" not found.`);
    }

    const existingBook = this.books[bookIndex];

    // Duplicate ISBN check if ISBN changed
    if (bookData.isbn && bookData.isbn.trim().toLowerCase() !== existingBook.isbn.toLowerCase()) {
      const duplicate = await this.getBookByIsbn(bookData.isbn);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Another book with ISBN ${bookData.isbn} already exists.`);
      }
    }

    const activeIssuedCount = this.transactions.filter(
      t => t.bookId === id && t.status === 'ISSUED'
    ).length;

    let newTotalCopies = existingBook.totalCopies;
    if (bookData.totalCopies !== undefined) {
      newTotalCopies = parseInt(bookData.totalCopies, 10);
      if (isNaN(newTotalCopies) || newTotalCopies <= 0) {
        throw new Error('Total Copies must be greater than zero.');
      }
      if (newTotalCopies < activeIssuedCount) {
        throw new Error(`Cannot reduce total copies to ${newTotalCopies}. There are currently ${activeIssuedCount} copies actively on loan.`);
      }
    }

    const updated = {
      ...existingBook,
      title: bookData.title !== undefined ? bookData.title.trim() : existingBook.title,
      author: bookData.author !== undefined ? bookData.author.trim() : existingBook.author,
      isbn: bookData.isbn !== undefined ? bookData.isbn.trim() : existingBook.isbn,
      publisher: bookData.publisher !== undefined ? bookData.publisher.trim() : existingBook.publisher,
      category: bookData.category !== undefined ? bookData.category.trim() : existingBook.category,
      edition: bookData.edition !== undefined ? bookData.edition.trim() : existingBook.edition,
      publishedYear: bookData.publishedYear !== undefined ? parseInt(bookData.publishedYear, 10) : existingBook.publishedYear,
      totalCopies: newTotalCopies,
      availableCopies: Math.max(0, newTotalCopies - activeIssuedCount),
      rackNumber: bookData.rackNumber !== undefined ? bookData.rackNumber.trim() : existingBook.rackNumber,
      coverUrl: bookData.coverUrl !== undefined ? bookData.coverUrl.trim() : existingBook.coverUrl,
      description: bookData.description !== undefined ? bookData.description.trim() : existingBook.description
    };

    updated.status = updated.availableCopies > 0 ? 'Available' : 'Currently Unavailable';
    this.books[bookIndex] = updated;
    return updated;
  }

  async deleteBook(id) {
    const bookIndex = this.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      throw new Error(`Book with ID "${id}" not found.`);
    }

    // Safety check: Cannot delete a book with active loans
    const activeLoans = this.transactions.filter(
      t => t.bookId === id && t.status === 'ISSUED'
    );
    if (activeLoans.length > 0) {
      throw new Error(`Cannot delete book "${this.books[bookIndex].title}". It has ${activeLoans.length} active borrowing loan(s). Return all copies first.`);
    }

    const deleted = this.books.splice(bookIndex, 1)[0];
    return deleted;
  }

  async getCategories() {
    const set = new Set();
    this.books.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }

  // --- TRANSACTIONS (ISSUE & RETURN) ---

  async getTransactions(filter = {}) {
    let result = this.transactions.map(t => {
      // Calculate dynamic fine on the fly for active loans
      let currentFine = t.fineAmount;
      let overdueDays = 0;
      if (t.status === 'ISSUED') {
        overdueDays = calculateOverdueDays(t.dueDate);
        currentFine = calculateFine(overdueDays, this.settings.finePerDay);
      }
      return {
        ...t,
        overdueDays,
        fineAmount: currentFine
      };
    });

    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter.studentId) {
      result = result.filter(t => t.studentId === filter.studentId);
    }
    if (filter.bookId) {
      result = result.filter(t => t.bookId === filter.bookId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.studentRegNo.toLowerCase().includes(q) ||
        t.bookTitle.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    return result;
  }

  async issueBook({ studentId, bookId, issueDate, dueDate, notes = '', issuedBy = 'Admin' }) {
    // 1. Validate Book
    const book = await this.getBookById(bookId);
    if (!book) {
      throw new Error(`Book with ID "${bookId}" does not exist.`);
    }
    if (book.availableCopies <= 0) {
      throw new Error(`Cannot issue book "${book.title}". There are zero available copies.`);
    }

    // 2. Validate Student
    const student = this.students.find(s => s.id === studentId || s.regNo === studentId);
    if (!student) {
      throw new Error(`Student "${studentId}" not found in system.`);
    }
    if (student.status !== 'Active') {
      throw new Error(`Student account "${student.name}" (${student.regNo}) is Inactive. Books cannot be issued.`);
    }

    // 3. Check Borrowing Limit
    const activeStudentLoans = this.transactions.filter(
      t => (t.studentId === student.id || t.studentRegNo === student.regNo) && t.status === 'ISSUED'
    );
    if (activeStudentLoans.length >= this.settings.maxBorrowLimit) {
      throw new Error(`Borrowing limit exceeded: Student "${student.name}" already has ${activeStudentLoans.length} active book loan(s) (Maximum allowed is ${this.settings.maxBorrowLimit}).`);
    }

    // Check if student already holds a copy of this exact same book
    const duplicateBookLoan = activeStudentLoans.find(t => t.bookId === book.id);
    if (duplicateBookLoan) {
      throw new Error(`Student "${student.name}" already has an active copy of "${book.title}" on loan.`);
    }

    // Dates
    const actualIssueDate = issueDate || formatDate(new Date());
    const actualDueDate = dueDate || calculateDueDate(actualIssueDate, this.settings.defaultLoanDays);

    // 4. Create Transaction
    const transaction = {
      id: generateId('TXN'),
      studentId: student.id,
      studentRegNo: student.regNo,
      studentName: student.name,
      bookId: book.id,
      bookTitle: book.title,
      issueDate: actualIssueDate,
      dueDate: actualDueDate,
      returnDate: null,
      status: 'ISSUED',
      fineAmount: 0,
      finePaid: false,
      issuedBy: issuedBy,
      notes: notes.trim()
    };

    this.transactions.unshift(transaction);

    // 5. Decrement Available Copies & recalculate status
    this.recalculateBookAvailability(book.id);

    return {
      transaction,
      book: await this.getBookById(book.id)
    };
  }

  async returnBook(transactionId, returnDate = null, notes = '') {
    const txn = this.transactions.find(t => t.id === transactionId);
    if (!txn) {
      throw new Error(`Transaction "${transactionId}" was not found.`);
    }
    if (txn.status === 'RETURNED') {
      throw new Error(`This transaction has already been returned on ${txn.returnDate}. It cannot be returned twice.`);
    }

    const actualReturnDate = returnDate || formatDate(new Date());
    const overdueDays = calculateOverdueDays(txn.dueDate, actualReturnDate);
    const fine = calculateFine(overdueDays, this.settings.finePerDay);

    txn.returnDate = actualReturnDate;
    txn.status = 'RETURNED';
    txn.fineAmount = fine;
    txn.finePaid = fine === 0;
    if (notes) {
      txn.notes = txn.notes ? `${txn.notes} | ${notes}` : notes;
    }

    // Increment available copies by recalculating
    this.recalculateBookAvailability(txn.bookId);

    const updatedBook = await this.getBookById(txn.bookId);

    return {
      transaction: txn,
      book: updatedBook,
      overdueDays,
      fineAmount: fine
    };
  }

  // --- USERS & AUTH ---

  async findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    // Search in users (admin/librarian)
    const staff = this.users.find(u => u.email.toLowerCase() === normalized);
    if (staff) return staff;

    // Search in students
    const student = this.students.find(s => s.email.toLowerCase() === normalized);
    if (student) {
      return {
        ...student,
        role: 'student'
      };
    }
    return null;
  }

  async findStudentByRegNo(regNo) {
    const normalized = regNo.toLowerCase().trim();
    return this.students.find(s => s.regNo.toLowerCase() === normalized) || null;
  }

  async registerStudent(studentData) {
    const existingEmail = await this.findUserByEmail(studentData.email);
    if (existingEmail) {
      throw new Error(`Email "${studentData.email}" is already registered.`);
    }

    const existingReg = await this.findStudentByRegNo(studentData.regNo);
    if (existingReg) {
      throw new Error(`Register Number "${studentData.regNo}" is already registered.`);
    }

    const student = {
      id: generateId('STU'),
      regNo: studentData.regNo.trim().toUpperCase(),
      name: studentData.name.trim(),
      department: studentData.department.trim(),
      email: studentData.email.trim().toLowerCase(),
      phone: studentData.phone ? studentData.phone.trim() : '',
      status: 'Active',
      passwordHash: studentData.passwordHash,
      createdAt: formatDate(new Date())
    };

    this.students.push(student);
    return student;
  }

  async getStudents(search = '') {
    let result = [...this.students];
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.regNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }

    // Attach active loans count to each student
    return result.map(s => {
      const activeLoans = this.transactions.filter(
        t => (t.studentId === s.id || t.studentRegNo === s.regNo) && t.status === 'ISSUED'
      ).length;
      return {
        ...s,
        activeLoans
      };
    });
  }

  async toggleStudentStatus(id) {
    const student = this.students.find(s => s.id === id);
    if (!student) throw new Error('Student not found.');
    student.status = student.status === 'Active' ? 'Inactive' : 'Active';
    return student;
  }

  async deleteStudent(id) {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found.');
    const student = this.students[index];

    // Safety guard: cannot remove student with active book loans
    const hasActiveLoans = this.transactions.some(
      t => (t.studentId === id || t.studentRegNo === student.regNo) &&
           (t.status === 'ISSUED' || t.status === 'Issued')
    );
    if (hasActiveLoans) {
      throw new Error(`Cannot remove student "${student.name}": student currently has active unreturned book(s). Please return all borrowed books first.`);
    }

    this.students.splice(index, 1);
    return student;
  }

  async getLibrarians() {
    return this.users.filter(u => u.role === 'librarian');
  }

  async addLibrarian(librarianData) {
    const existing = await this.findUserByEmail(librarianData.email);
    if (existing) {
      throw new Error(`Email "${librarianData.email}" is already registered.`);
    }

    const newLib = {
      id: generateId('LIB'),
      name: librarianData.name.trim(),
      email: librarianData.email.trim().toLowerCase(),
      phone: librarianData.phone ? librarianData.phone.trim() : '',
      role: 'librarian',
      status: 'Active',
      passwordHash: librarianData.passwordHash,
      createdAt: formatDate(new Date())
    };

    this.users.push(newLib);
    return newLib;
  }

  async toggleLibrarianStatus(id) {
    const lib = this.users.find(u => u.id === id && u.role === 'librarian');
    if (!lib) throw new Error('Librarian not found.');
    lib.status = lib.status === 'Active' ? 'Inactive' : 'Active';
    return lib;
  }

  async deleteLibrarian(id) {
    const index = this.users.findIndex(u => u.id === id && u.role === 'librarian');
    if (index === -1) throw new Error('Librarian not found.');
    const librarian = this.users[index];

    this.users.splice(index, 1);
    return librarian;
  }

  // --- SETTINGS ---

  async getSettings() {
    return { ...this.settings };
  }

  async updateSettings(newSettings) {
    if (newSettings.defaultLoanDays !== undefined) {
      this.settings.defaultLoanDays = parseInt(newSettings.defaultLoanDays, 10);
    }
    if (newSettings.finePerDay !== undefined) {
      this.settings.finePerDay = parseFloat(newSettings.finePerDay);
    }
    if (newSettings.maxBorrowLimit !== undefined) {
      this.settings.maxBorrowLimit = parseInt(newSettings.maxBorrowLimit, 10);
    }
    if (newSettings.collegeName !== undefined) {
      this.settings.collegeName = newSettings.collegeName;
    }
    return { ...this.settings };
  }

  // --- DASHBOARD STATISTICS ---

  async getDashboardStats() {
    const totalTitles = this.books.length;
    let totalPhysicalCopies = 0;
    let availableCopies = 0;

    this.books.forEach(b => {
      totalPhysicalCopies += (b.totalCopies || 0);
      availableCopies += (b.availableCopies || 0);
    });

    const activeTransactions = this.transactions.filter(t => t.status === 'ISSUED');
    const issuedCopies = activeTransactions.length;

    const registeredStudents = this.students.length;
    const registeredLibrarians = this.users.filter(u => u.role === 'librarian').length;

    let overdueTransactions = 0;
    let outstandingFines = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    activeTransactions.forEach(t => {
      const overdueDays = calculateOverdueDays(t.dueDate);
      if (overdueDays > 0) {
        overdueTransactions += 1;
        outstandingFines += calculateFine(overdueDays, this.settings.finePerDay);
      }
    });

    // Currently Available Books (preview list of up to 6 books with availableCopies > 0)
    const currentlyAvailableBooks = this.books
      .filter(b => b.availableCopies > 0)
      .slice(0, 6)
      .map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
        rackNumber: b.rackNumber,
        coverUrl: b.coverUrl
      }));

    // Recently Added Books (latest 5 books added)
    const recentlyAddedBooks = [...this.books]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
        status: b.status,
        rackNumber: b.rackNumber,
        createdAt: b.createdAt
      }));

    return {
      totalTitles,
      totalPhysicalCopies,
      availableCopies,
      issuedCopies,
      registeredStudents,
      registeredLibrarians,
      overdueTransactions,
      outstandingFines,
      currentlyAvailableBooks,
      recentlyAddedBooks
    };
  }
}

// Export singleton instance
module.exports = new DemoDataStore();
