const dataService = require('../services/dataService');

async function getTransactions(req, res, next) {
  try {
    const { status, studentId, bookId, search } = req.query;

    let filterStudentId = studentId;
    // If logged in as student, restrict to their own transactions
    if (req.user && req.user.role === 'student') {
      filterStudentId = req.user.id;
    }

    const transactions = await dataService.getTransactions({
      status,
      studentId: filterStudentId,
      bookId,
      search
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
}

async function issueBook(req, res, next) {
  try {
    const { studentId, bookId, issueDate, dueDate, notes } = req.body;
    const issuedBy = req.user ? `${req.user.name} (${req.user.role})` : 'System Administrator';

    const result = await dataService.issueBook({
      studentId,
      bookId,
      issueDate,
      dueDate,
      notes,
      issuedBy
    });

    const stats = await dataService.getDashboardStats();

    return res.status(201).json({
      success: true,
      message: `Book "${result.book.title}" successfully issued to ${result.transaction.studentName}!`,
      transaction: result.transaction,
      book: result.book,
      summary: {
        totalUniqueTitles: stats.totalTitles,
        totalPhysicalCopies: stats.totalPhysicalCopies,
        availableCopies: stats.availableCopies,
        issuedCopies: stats.issuedCopies
      }
    });
  } catch (error) {
    next(error);
  }
}

async function returnBook(req, res, next) {
  try {
    const { id } = req.params;
    const { returnDate, notes } = req.body;

    const result = await dataService.returnBook(id, returnDate, notes);

    const stats = await dataService.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: `Book "${result.book.title}" successfully returned! (Overdue days: ${result.overdueDays}, Fine: ₹${result.fineAmount})`,
      transaction: result.transaction,
      book: result.book,
      overdueDays: result.overdueDays,
      fineAmount: result.fineAmount,
      summary: {
        totalUniqueTitles: stats.totalTitles,
        totalPhysicalCopies: stats.totalPhysicalCopies,
        availableCopies: stats.availableCopies,
        issuedCopies: stats.issuedCopies
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  issueBook,
  returnBook
};
