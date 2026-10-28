const config = require('../config/config');

class GoogleSheetsService {
  constructor() {
    this.scriptUrl = config.googleSheets.scriptUrl;
  }

  isConfigured() {
    return Boolean(config.googleSheets.scriptUrl && config.googleSheets.scriptUrl.startsWith('https://script.google.com'));
  }

  async sendRequest(action, payload = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Google Sheets integration is not yet configured. Please set GOOGLE_SHEETS_SCRIPT_URL in your .env file after deploying the Google Apps Script Web App.'
      );
    }

    try {
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          payload
        }),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script returned HTTP status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Google Sheets operation failed.');
      }

      return result.data;
    } catch (error) {
      console.error(`[GoogleSheetsService Error] Action: ${action}`, error.message);
      throw new Error(`Google Sheets communication error: ${error.message}`);
    }
  }

  // --- Books ---
  async getBooks(filter = {}) {
    const books = await this.sendRequest('getBooks', { filter });
    return books;
  }

  async getBookById(id) {
    return this.sendRequest('getBookById', { id });
  }

  async getBookByIsbn(isbn) {
    return this.sendRequest('getBookByIsbn', { isbn });
  }

  async addBook(bookData) {
    return this.sendRequest('addBook', { book: bookData });
  }

  async updateBook(id, bookData) {
    return this.sendRequest('updateBook', { id, book: bookData });
  }

  async deleteBook(id) {
    return this.sendRequest('deleteBook', { id });
  }

  async getCategories() {
    return this.sendRequest('getCategories', {});
  }

  // --- Transactions ---
  async getTransactions(filter = {}) {
    return this.sendRequest('getTransactions', { filter });
  }

  async issueBook(issueData) {
    return this.sendRequest('issueBook', issueData);
  }

  async returnBook(transactionId, returnDate = null, notes = '') {
    return this.sendRequest('returnBook', { transactionId, returnDate, notes });
  }

  // --- Users / Students / Librarians ---
  async findUserByEmail(email) {
    const user = await this.sendRequest('findUserByEmail', { email });
    if (user && user.email && user.email.toLowerCase() === 'admin@college.edu') {
      user.role = 'admin';
    }
    return user;
  }

  async findStudentByRegNo(regNo) {
    return this.sendRequest('findStudentByRegNo', { regNo });
  }

  async registerStudent(studentData) {
    return this.sendRequest('registerStudent', { student: studentData });
  }

  async getStudents(search = '') {
    return this.sendRequest('getStudents', { search });
  }

  async toggleStudentStatus(id) {
    return this.sendRequest('toggleStudentStatus', { id });
  }

  async deleteStudent(id) {
    return this.sendRequest('deleteStudent', { id });
  }

  async getLibrarians() {
    return this.sendRequest('getLibrarians', {});
  }

  async addLibrarian(librarianData) {
    return this.sendRequest('addLibrarian', { librarian: librarianData });
  }

  async toggleLibrarianStatus(id) {
    return this.sendRequest('toggleLibrarianStatus', { id });
  }

  async deleteLibrarian(id) {
    return this.sendRequest('deleteLibrarian', { id });
  }

  // --- Settings ---
  async getSettings() {
    return this.sendRequest('getSettings', {});
  }

  async updateSettings(settings) {
    return this.sendRequest('updateSettings', { settings });
  }

  // --- Dashboard Stats ---
  async getDashboardStats() {
    return this.sendRequest('getDashboardStats', {});
  }
}

module.exports = new GoogleSheetsService();
