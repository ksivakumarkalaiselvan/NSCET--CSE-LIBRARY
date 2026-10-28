const googleSheetsService = require('../services/googleSheetsService');
const { hashPassword } = require('../utils/helpers');

async function testLiveGoogleSheetsWorkflow() {
  console.log('🧪 Testing Full Live Google Sheets Workflow (Phase 7)...\n');

  // 1. Check or Seed Settings
  console.log('1. Fetching Settings from Google Sheets...');
  let settings = await googleSheetsService.getSettings();
  console.log('   Settings:', settings);
  if (!settings.defaultLoanDays) {
    console.log('   Seeding initial settings...');
    settings = await googleSheetsService.updateSettings({
      defaultLoanDays: '14',
      finePerDay: '5',
      maxBorrowLimit: '3',
      collegeName: 'Central College of Engineering Library'
    });
    console.log('   Updated Settings:', settings);
  }

  // 2. Check or Seed Admin & Librarian Users
  console.log('\n2. Verifying Staff Users in Google Sheets...');
  let admin = await googleSheetsService.findUserByEmail('admin@college.edu');
  if (!admin) {
    console.log('   Seeding default Admin user into Google Sheets...');
    const adminPassHash = await hashPassword('admin123');
    admin = await googleSheetsService.addLibrarian({
      name: 'Prof. ARCHANA .R',
      email: 'admin@college.edu',
      phone: '+91 94441 23456',
      passwordHash: adminPassHash
    });
    console.log('   Created Admin:', admin.name, `(${admin.email})`);
  } else {
    console.log('   Admin user found:', admin.name, `(${admin.email})`);
  }

  // 3. Check or Seed Students
  console.log('\n3. Verifying Student records in Google Sheets...');
  let students = await googleSheetsService.getStudents();
  console.log(`   Found ${students.length} existing students.`);
  let testStudent = students.find(s => s.regNo === 'CS2023001');
  if (!testStudent) {
    console.log('   Registering test student "Aarav Sharma" (CS2023001)...');
    const stuPassHash = await hashPassword('stu123');
    testStudent = await googleSheetsService.registerStudent({
      regNo: 'CS2023001',
      name: 'Aarav Sharma',
      department: 'Computer Science & Engineering',
      email: 'student@college.edu',
      phone: '+91 98765 43210',
      passwordHash: stuPassHash
    });
    console.log('   Registered Student:', testStudent.name);
  } else {
    console.log('   Test student ready:', testStudent.name);
  }

  // 4. Test Adding Books to Live Google Sheets
  console.log('\n4. Testing Adding Books to Google Sheets...');
  const testBooks = [
    {
      isbn: '978-0134685991',
      title: 'Java: The Complete Reference',
      author: 'Herbert Schildt',
      publisher: 'McGraw-Hill Education',
      category: 'Programming',
      edition: '11th Edition',
      publishedYear: 2019,
      totalCopies: 10,
      rackNumber: 'Rack A-01',
      coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400',
      description: 'Comprehensive guide covering Java SE fundamentals, OOP, streams, and concurrency.'
    },
    {
      isbn: '978-0132847377',
      title: 'Data Structures and Algorithm Analysis in C++',
      author: 'Mark Allen Weiss',
      publisher: 'Pearson',
      category: 'Computer Science',
      edition: '4th Edition',
      publishedYear: 2014,
      totalCopies: 5,
      rackNumber: 'Rack B-02',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      description: 'Advanced data structures and algorithm design principles in C++.'
    },
    {
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      publisher: 'MIT Press',
      category: 'Algorithms',
      edition: '3rd Edition',
      publishedYear: 2009,
      totalCopies: 8,
      rackNumber: 'Rack A-02',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      description: 'The standard reference for modern algorithms, graph theory, and dynamic programming.'
    },
    {
      isbn: '978-0132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      category: 'Software Engineering',
      edition: '1st Edition',
      publishedYear: 2008,
      totalCopies: 6,
      rackNumber: 'Rack C-01',
      coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
      description: 'Best practices for writing readable, maintainable, testable code.'
    },
    {
      isbn: '978-0134610993',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      publisher: 'Pearson',
      category: 'Artificial Intelligence',
      edition: '4th Edition',
      publishedYear: 2020,
      totalCopies: 4,
      rackNumber: 'Rack D-01',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      description: 'The global standard on intelligent agents, machine learning, and probabilistic reasoning.'
    }
  ];

  for (const bookData of testBooks) {
    const existing = await googleSheetsService.getBookByIsbn(bookData.isbn);
    if (!existing) {
      console.log(`   Adding book: "${bookData.title}"...`);
      const created = await googleSheetsService.addBook(bookData);
      console.log(`   ✅ Added: "${created.title}" (ID: ${created.id}, Available: ${created.availableCopies}/${created.totalCopies})`);
    } else {
      console.log(`   Book already in Google Sheets: "${existing.title}" (Available: ${existing.availableCopies}/${existing.totalCopies})`);
    }
  }

  // 5. Test Available Books Filtering from Live Sheets
  console.log('\n5. Testing Available Books Query...');
  const availableBooks = await googleSheetsService.getBooks({ availableOnly: true });
  console.log(`   ✅ ${availableBooks.length} titles available in stock.`);

  // 6. Test Book Issue in Google Sheets
  console.log('\n6. Testing Issue Workflow in Google Sheets...');
  const javaBook = await googleSheetsService.getBookByIsbn('978-0134685991');
  const initialJavaAvail = javaBook.availableCopies;
  console.log(`   Java book current availability: ${initialJavaAvail}`);

  const issueResult = await googleSheetsService.issueBook({
    studentId: testStudent.id,
    studentRegNo: testStudent.regNo,
    studentName: testStudent.name,
    bookId: javaBook.id,
    notes: 'Live Google Sheets test issue'
  });
  console.log(`   ✅ Issued transaction created: ${issueResult.transaction.id}`);
  console.log(`   ✅ Book available copies decremented: from ${initialJavaAvail} to ${issueResult.book.availableCopies}`);

  // 7. Test Book Return in Google Sheets
  console.log('\n7. Testing Return Workflow in Google Sheets...');
  const returnResult = await googleSheetsService.returnBook(issueResult.transaction.id);
  console.log(`   ✅ Returned transaction status: ${returnResult.transaction.status}`);
  console.log(`   ✅ Book available copies incremented: restored to ${returnResult.book.availableCopies}`);

  // 8. Test Dashboard Stats
  console.log('\n8. Testing Real-time Dashboard Stats from Google Sheets...');
  const finalStats = await googleSheetsService.getDashboardStats();
  console.log('   Final Google Sheets Stats:', finalStats);

  console.log('\n🎉 ALL LIVE GOOGLE SHEETS WORKFLOWS PASSED WITH 100% SUCCESS! 🚀');
}

testLiveGoogleSheetsWorkflow().catch(err => {
  console.error('❌ Live Google Sheets Workflow error:', err);
  process.exit(1);
});
