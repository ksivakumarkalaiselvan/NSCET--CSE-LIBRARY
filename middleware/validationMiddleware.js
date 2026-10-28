function validateBookInput(req, res, next) {
  const { title, author, isbn, category, totalCopies, rackNumber } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Book Title is required.');
  }
  if (!author || typeof author !== 'string' || !author.trim()) {
    errors.push('Author Name is required.');
  }
  if (!isbn || typeof isbn !== 'string' || !isbn.trim()) {
    errors.push('ISBN is required.');
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Category is required.');
  }
  if (totalCopies === undefined || totalCopies === null || isNaN(parseInt(totalCopies, 10))) {
    errors.push('Total Copies must be a valid number.');
  } else if (parseInt(totalCopies, 10) <= 0) {
    errors.push('Total Copies must be greater than zero.');
  }
  if (!rackNumber || typeof rackNumber !== 'string' || !rackNumber.trim()) {
    errors.push('Shelf / Rack Number is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

function validateIssueInput(req, res, next) {
  const { studentId, bookId } = req.body;
  const errors = [];

  if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
    errors.push('Student identifier is required.');
  }
  if (!bookId || typeof bookId !== 'string' || !bookId.trim()) {
    errors.push('Book identifier is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

module.exports = {
  validateBookInput,
  validateIssueInput
};
