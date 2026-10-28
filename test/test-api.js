process.env.STORAGE_TYPE = 'demo';
const request = require('supertest');
const assert = require('assert');
const { app } = require('../server');
const demoDataStore = require('../services/demoDataStore');

async function runApiTests() {
  console.log('🚀 Running ScholarLib REST API End-to-End Test Suite...\n');

  demoDataStore.init();

  // 1. Health check
  console.log('1. Testing GET /api/health');
  const resHealth = await request(app).get('/api/health');
  assert.strictEqual(resHealth.status, 200);
  assert.strictEqual(resHealth.body.status, 'healthy');
  console.log('   ✅ Health check passed.');

  // 2. Authentication
  console.log('2. Testing Authentication & JWT tokens');
  // Admin Login
  const resAdminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@college.edu', password: 'admin123' });
  assert.strictEqual(resAdminLogin.status, 200);
  assert.ok(resAdminLogin.body.token, 'Token should be returned');
  assert.strictEqual(resAdminLogin.body.user.role, 'admin');
  const adminToken = resAdminLogin.body.token;

  // Student Login
  const resStuLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@college.edu', password: 'stu123' });
  assert.strictEqual(resStuLogin.status, 200);
  assert.strictEqual(resStuLogin.body.user.role, 'student');
  const studentToken = resStuLogin.body.token;

  // Invalid Login
  const resBadLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@college.edu', password: 'wrongpassword' });
  assert.strictEqual(resBadLogin.status, 401);
  console.log('   ✅ Auth endpoints & roles verified.');

  // 3. Dashboard Statistics
  console.log('3. Testing GET /api/stats/dashboard');
  const resStats = await request(app).get('/api/stats/dashboard');
  assert.strictEqual(resStats.status, 200);
  assert.ok(resStats.body.stats.totalTitles > 0);
  assert.ok(resStats.body.stats.availableCopies > 0);
  assert.ok(Array.isArray(resStats.body.stats.currentlyAvailableBooks));
  console.log('   ✅ Dashboard stats returned dynamically calculated metrics.');

  // 4. Available Books Dedicated Endpoint
  console.log('4. Testing GET /api/books?availableOnly=true (Available Books Page)');
  const resAvail = await request(app).get('/api/books?availableOnly=true');
  assert.strictEqual(resAvail.status, 200);
  const booksAvail = resAvail.body.books;
  assert.ok(booksAvail.length > 0);
  assert.strictEqual(booksAvail.every(b => b.availableCopies > 0), true, 'All returned books must have availableCopies > 0');
  console.log(`   ✅ Available Books endpoint returned ${booksAvail.length} titles, all with available copies > 0.`);

  // 5. Complete Catalog (All Books including unavailable)
  console.log('5. Testing GET /api/books (Complete Catalog)');
  const resAll = await request(app).get('/api/books');
  assert.strictEqual(resAll.status, 200);
  const allBooks = resAll.body.books;
  const unavailableBook = allBooks.find(b => b.availableCopies === 0);
  assert.ok(unavailableBook, 'Must include unavailable books in complete catalog');
  assert.strictEqual(unavailableBook.status, 'Currently Unavailable');
  console.log(`   ✅ Complete Catalog returned ${allBooks.length} titles (including unavailable: "${unavailableBook.title}").`);

  // 6. Add Book Workflow (Admin & Librarian only)
  console.log('6. Testing POST /api/books (Add Book Workflow)');
  const newBook = {
    isbn: '978-0201633610',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    publisher: 'Addison-Wesley Professional',
    category: 'Software Engineering',
    edition: '1st Edition',
    publishedYear: 1994,
    totalCopies: 5,
    rackNumber: 'Rack C-03',
    coverUrl: '',
    description: 'The classic Gang of Four book on OOP design patterns.'
  };

  const resAddBook = await request(app)
    .post('/api/books')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newBook);

  assert.strictEqual(resAddBook.status, 201);
  assert.strictEqual(resAddBook.body.book.title, newBook.title);
  assert.strictEqual(resAddBook.body.book.availableCopies, 5);
  assert.strictEqual(resAddBook.body.book.status, 'Available');
  const createdBookId = resAddBook.body.book.id;
  console.log(`   ✅ Book "${newBook.title}" added with ID ${createdBookId}.`);

  // Duplicate ISBN Rejection
  const resDup = await request(app)
    .post('/api/books')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newBook);
  assert.strictEqual(resDup.status, 500); // or 400
  console.log('   ✅ Duplicate ISBN properly blocked.');

  // Student Role Authorization Check (Forbidden)
  console.log('7. Testing Role Authorization Safeguards');
  const resStudentAddBook = await request(app)
    .post('/api/books')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ ...newBook, isbn: '978-9999999999' });
  assert.strictEqual(resStudentAddBook.status, 403, 'Students MUST NOT be allowed to add books');
  console.log('   ✅ Student access strictly restricted by backend middleware (403 Forbidden).');

  // 8. Book Issue & Return Workflow
  console.log('8. Testing Issue Book -> Decrement -> Return Book -> Increment');
  // Issue the newly added book to student STU-102 (Priya Patel)
  const resIssue = await request(app)
    .post('/api/transactions/issue')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      studentId: 'STU-102',
      bookId: createdBookId,
      notes: 'API integration test loan'
    });

  assert.strictEqual(resIssue.status, 201);
  assert.strictEqual(resIssue.body.book.availableCopies, 4, 'Copies should decrease from 5 to 4');
  const txnId = resIssue.body.transaction.id;
  console.log(`   ✅ Book issued (Txn: ${txnId}). Available copies decreased to 4.`);

  // Return the book
  const resReturn = await request(app)
    .post(`/api/transactions/return/${txnId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ notes: 'API test return' });

  assert.strictEqual(resReturn.status, 200);
  assert.strictEqual(resReturn.body.book.availableCopies, 5, 'Copies should restore to 5');
  assert.strictEqual(resReturn.body.transaction.status, 'RETURNED');
  console.log(`   ✅ Book returned. Available copies restored to 5.`);

  // 9. Categories
  console.log('9. Testing GET /api/books/categories');
  const resCat = await request(app).get('/api/books/categories');
  assert.strictEqual(resCat.status, 200);
  assert.ok(resCat.body.categories.includes('Programming'));
  assert.ok(resCat.body.categories.includes('Software Engineering'));
  console.log('   ✅ Categories API returns all active categories.');

  console.log('\n🎉 ALL API END-TO-END TESTS PASSED WITH 100% SUCCESS! 🌟');
}

runApiTests().catch(err => {
  console.error('❌ API Test failed:', err);
  process.exit(1);
});
