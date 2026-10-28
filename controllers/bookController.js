const dataService = require('../services/dataService');

async function getBooks(req, res, next) {
  try {
    const { availableOnly, search, category, sort, page = 1, limit = 12 } = req.query;

    const books = await dataService.getBooks({
      availableOnly: availableOnly === 'true' || availableOnly === true,
      search,
      category,
      sort
    });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const totalCount = books.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedBooks = books.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      limit: limitNum,
      books: paginatedBooks
    });
  } catch (error) {
    next(error);
  }
}

async function getBookById(req, res, next) {
  try {
    const { id } = req.params;
    const book = await dataService.getBookById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID "${id}" was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    next(error);
  }
}

async function addBook(req, res, next) {
  try {
    const bookData = req.body;
    const newBook = await dataService.addBook(bookData);

    // Fetch updated summary counts so the frontend can immediately update cards
    const stats = await dataService.getDashboardStats();

    return res.status(201).json({
      success: true,
      message: `Book "${newBook.title}" has been successfully added to the catalog!`,
      book: newBook,
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

async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const bookData = req.body;
    const updatedBook = await dataService.updateBook(id, bookData);

    const stats = await dataService.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: `Book "${updatedBook.title}" details updated successfully.`,
      book: updatedBook,
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

async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;
    const deletedBook = await dataService.deleteBook(id);

    const stats = await dataService.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: `Book "${deletedBook.title}" was successfully deleted.`,
      deletedBook,
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

async function getCategories(req, res, next) {
  try {
    const categories = await dataService.getCategories();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getCategories
};
