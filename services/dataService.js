const config = require('../config/config');
const demoDataStore = require('./demoDataStore');
const googleSheetsService = require('./googleSheetsService');

class DataService {
  getStorage() {
    if (config.storageType === 'sheets') {
      if (googleSheetsService.isConfigured()) {
        return googleSheetsService;
      }
      console.warn('[DataService] Storage set to "sheets" but GOOGLE_SHEETS_SCRIPT_URL is not configured. Falling back to Demo In-Memory Store.');
      return demoDataStore;
    }
    return demoDataStore;
  }

  getStorageMode() {
    if (config.storageType === 'sheets' && googleSheetsService.isConfigured()) {
      return 'sheets';
    }
    return 'demo';
  }

  // --- Books ---
  async getBooks(filter) {
    return this.getStorage().getBooks(filter);
  }

  async getBookById(id) {
    return this.getStorage().getBookById(id);
  }

  async getBookByIsbn(isbn) {
    return this.getStorage().getBookByIsbn(isbn);
  }

  async addBook(bookData) {
    return this.getStorage().addBook(bookData);
  }

  async updateBook(id, bookData) {
    return this.getStorage().updateBook(id, bookData);
  }

  async deleteBook(id) {
    return this.getStorage().deleteBook(id);
  }

  async getCategories() {
    return this.getStorage().getCategories();
  }

  // --- Transactions ---
  async getTransactions(filter) {
    return this.getStorage().getTransactions(filter);
  }

  async issueBook(issueData) {
    return this.getStorage().issueBook(issueData);
  }

  async returnBook(transactionId, returnDate, notes) {
    return this.getStorage().returnBook(transactionId, returnDate, notes);
  }

  // --- Users / Students / Librarians ---
  async findUserByEmail(email) {
    const user = await this.getStorage().findUserByEmail(email);
    if (user && user.email && user.email.toLowerCase() === 'admin@college.edu') {
      user.name = 'Prof. ARCHANA .R';
      user.role = 'admin';
    }
    return user;
  }

  async findStudentByRegNo(regNo) {
    return this.getStorage().findStudentByRegNo(regNo);
  }

  async registerStudent(studentData) {
    return this.getStorage().registerStudent(studentData);
  }

  async getStudents(search) {
    return this.getStorage().getStudents(search);
  }

  async toggleStudentStatus(id) {
    return this.getStorage().toggleStudentStatus(id);
  }

  async deleteStudent(id) {
    return this.getStorage().deleteStudent(id);
  }

  async getLibrarians() {
    return this.getStorage().getLibrarians();
  }

  async addLibrarian(librarianData) {
    return this.getStorage().addLibrarian(librarianData);
  }

  async toggleLibrarianStatus(id) {
    return this.getStorage().toggleLibrarianStatus(id);
  }

  async deleteLibrarian(id) {
    return this.getStorage().deleteLibrarian(id);
  }

  // --- Settings ---
  async getSettings() {
    return this.getStorage().getSettings();
  }

  async updateSettings(settings) {
    return this.getStorage().updateSettings(settings);
  }

  // --- Dashboard Stats ---
  async getDashboardStats() {
    return this.getStorage().getDashboardStats();
  }
}

module.exports = new DataService();
