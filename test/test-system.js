const assert = require('assert');
const demoDataStore = require('../services/demoDataStore');

async function runTests() {
  console.log('🧪 Starting ScholarLib System Tests...\n');

  // Reset/re-init demo store
  demoDataStore.init();

  // --- TEST 1: Initial Dashboard & Book Counts ---
  console.log('Test 1: Verify Initial Dynamic Calculations');
  const initialStats = await demoDataStore.getDashboardStats();
  console.log(`  Titles: ${initialStats.totalTitles}, Physical Copies: ${initialStats.totalPhysicalCopies}, Available: ${initialStats.availableCopies}, Issued: ${initialStats.issuedCopies}`);
  assert.strictEqual(initialStats.totalTitles, 12, 'Expected 12 unique demo books');
  assert.strictEqual(initialStats.totalPhysicalCopies, 70, 'Expected 70 total physical copies');
  assert.strictEqual(initialStats.issuedCopies, 8, 'Expected 8 active loans');
  assert.strictEqual(initialStats.availableCopies, 62, 'Available should equal 70 - 8 = 62');
  console.log('  ✅ Test 1 Passed: Initial statistics dynamically matched.');

  // --- TEST 2: Available Books vs All Books Filter ---
  console.log('\nTest 2: Available Books vs Complete Catalog Filtering');
  const allBooks = await demoDataStore.getBooks();
  const availableBooks = await demoDataStore.getBooks({ availableOnly: true });

  console.log(`  All Books: ${allBooks.length}, Available Books: ${availableBooks.length}`);
  assert.strictEqual(allBooks.length, 12);
  // Books with 0 copies: BK-1002 (Data Structures, 5/5 issued), BK-1008 (Operating Systems, 6/6 issued)
  const unavailableBook = allBooks.find(b => b.availableCopies === 0);
  assert.ok(unavailableBook, 'Should find at least one unavailable book in complete catalog');
  assert.strictEqual(unavailableBook.status, 'Currently Unavailable');

  const inAvailable = availableBooks.some(b => b.id === unavailableBook.id);
  assert.strictEqual(inAvailable, false, 'Unavailable book MUST NOT appear in Available Books list');

  const allAvailableHaveCopies = availableBooks.every(b => b.availableCopies > 0);
  assert.strictEqual(allAvailableHaveCopies, true, 'Every book in Available Books must have > 0 copies');
  console.log('  ✅ Test 2 Passed: Dedicated Available Books page excludes 0-copy books.');

  // --- TEST 3: Add Book with Validation ---
  console.log('\nTest 3: Add Book & Duplicate ISBN Prevention');
  const newBookData = {
    isbn: '978-0131103627',
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    publisher: 'Prentice Hall',
    category: 'Programming',
    edition: '2nd Edition',
    publishedYear: 1988,
    totalCopies: 4,
    rackNumber: 'Rack A-04',
    coverUrl: '',
    description: 'The definitive classic on ANSI C standard.'
  };

  const addedBook = await demoDataStore.addBook(newBookData);
  assert.strictEqual(addedBook.title, 'The C Programming Language');
  assert.strictEqual(addedBook.availableCopies, 4);
  assert.strictEqual(addedBook.status, 'Available');

  // Verify duplicate ISBN rejected
  let duplicateRejected = false;
  try {
    await demoDataStore.addBook({
      ...newBookData,
      title: 'Duplicate ISBN Attempt'
    });
  } catch (err) {
    duplicateRejected = true;
    console.log(`  Expected error caught: ${err.message}`);
  }
  assert.strictEqual(duplicateRejected, true, 'Duplicate ISBN must be rejected');

  // Verify dashboard stats updated
  const statsAfterAdd = await demoDataStore.getDashboardStats();
  assert.strictEqual(statsAfterAdd.totalTitles, 13);
  assert.strictEqual(statsAfterAdd.totalPhysicalCopies, 74);
  assert.strictEqual(statsAfterAdd.availableCopies, 66);
  console.log('  ✅ Test 3 Passed: Book addition and validation successful.');

  // --- TEST 4: Issue Book & Availability Decrement ---
  console.log('\nTest 4: Issue Book & Automatic Decrement Logic');
  // Issue "The C Programming Language" (has 4 available copies) to Priya Patel (STU-102)
  const initialAvailable = addedBook.availableCopies;
  const issueResult = await demoDataStore.issueBook({
    studentId: 'STU-102',
    bookId: addedBook.id,
    notes: 'Testing issue operation'
  });

  assert.ok(issueResult.transaction.id.startsWith('TXN-'));
  assert.strictEqual(issueResult.book.availableCopies, initialAvailable - 1);
  console.log(`  Issued book. Available copies decreased from ${initialAvailable} to ${issueResult.book.availableCopies}`);

  // Test issuing a book with 0 available copies (BK-1002)
  let zeroCopyRejected = false;
  try {
    await demoDataStore.issueBook({
      studentId: 'STU-103',
      bookId: 'BK-1002'
    });
  } catch (err) {
    zeroCopyRejected = true;
    console.log(`  Expected error caught on 0-copy issue: ${err.message}`);
  }
  assert.strictEqual(zeroCopyRejected, true, 'Issuing book with 0 available copies must be rejected');

  // Test borrowing limit prevention (Max 3 books)
  let quotaRejected = false;
  try {
    // STU-101 (Aarav Sharma) already has 3 active loans (TXN-2026-001, TXN-2026-004, TXN-2026-008)
    await demoDataStore.issueBook({
      studentId: 'STU-101',
      bookId: addedBook.id
    });
  } catch (err) {
    quotaRejected = true;
    console.log(`  Expected error caught on limit exceeded: ${err.message}`);
  }
  assert.strictEqual(quotaRejected, true, 'Borrowing above maximum limit must be rejected');
  console.log('  ✅ Test 4 Passed: Issue validations and decrements work correctly.');

  // --- TEST 5: Return Book, Availability Increment & Fine Calculation ---
  console.log('\nTest 5: Return Book, Increment & Overdue Fine Calculation');
  // Return the book issued in Test 4
  const returnResult = await demoDataStore.returnBook(issueResult.transaction.id);
  assert.strictEqual(returnResult.transaction.status, 'RETURNED');
  assert.strictEqual(returnResult.book.availableCopies, initialAvailable, 'Available copies restored to initial');
  console.log(`  Returned book. Available copies restored to ${returnResult.book.availableCopies}`);

  // Test returning an overdue loan (TXN-2026-004: dueDate was 2026-10-24, today is >= 2026-10-28)
  const overdueTxnId = 'TXN-2026-004';
  const overdueReturnResult = await demoDataStore.returnBook(overdueTxnId, '2026-10-28');
  assert.strictEqual(overdueReturnResult.transaction.status, 'RETURNED');
  assert.ok(overdueReturnResult.overdueDays >= 4, 'Overdue days should be at least 4');
  assert.ok(overdueReturnResult.fineAmount >= 20, 'Fine should be calculated (>= ₹20)');
  console.log(`  Returned overdue loan: ${overdueReturnResult.overdueDays} days overdue, Fine: ₹${overdueReturnResult.fineAmount}`);

  // Test double return prevention
  let doubleReturnRejected = false;
  try {
    await demoDataStore.returnBook(overdueTxnId);
  } catch (err) {
    doubleReturnRejected = true;
    console.log(`  Expected error caught on double return: ${err.message}`);
  }
  assert.strictEqual(doubleReturnRejected, true, 'Cannot return already returned transaction');
  console.log('  ✅ Test 5 Passed: Return, increments, fine calculation, and double return guard verified.');

  console.log('\n🎉 ALL 5 SYSTEM TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('❌ Test Failure:', err);
  process.exit(1);
});
