/**
 * ScholarLib - Backend API Client
 * Handles communication with Node/Express REST endpoints with JWT authorization
 */
const API = (function() {
  const BASE_URL = '/api';

  function getToken() {
    return localStorage.getItem('scholarlib_token') || '';
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem('scholarlib_token', token);
    } else {
      localStorage.removeItem('scholarlib_token');
    }
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem('scholarlib_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem('scholarlib_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('scholarlib_user');
    }
  }

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(', ') : `HTTP Error ${response.status}`));
      }

      return data;
    } catch (error) {
      console.error(`API Request failed [${endpoint}]:`, error);
      throw error;
    }
  }

  return {
    getToken,
    setToken,
    getCurrentUser,
    setCurrentUser,

    // Auth
    async login(email, password) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token) {
        setToken(res.token);
        setCurrentUser(res.user);
      }
      return res;
    },

    async register(studentData) {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(studentData)
      });
      if (res.token) {
        setToken(res.token);
        setCurrentUser(res.user);
      }
      return res;
    },

    async getMe() {
      return request('/auth/me');
    },

    logout() {
      setToken(null);
      setCurrentUser(null);
    },

    // Books
    async getBooks(params = {}) {
      const query = new URLSearchParams(params).toString();
      return request(`/books?${query}`);
    },

    async getBookById(id) {
      return request(`/books/${id}`);
    },

    async addBook(bookData) {
      return request('/books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      });
    },

    async updateBook(id, bookData) {
      return request(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      });
    },

    async deleteBook(id) {
      return request(`/books/${id}`, {
        method: 'DELETE'
      });
    },

    async getCategories() {
      return request('/books/categories');
    },

    // Transactions
    async getTransactions(params = {}) {
      const query = new URLSearchParams(params).toString();
      return request(`/transactions?${query}`);
    },

    async issueBook(issueData) {
      return request('/transactions/issue', {
        method: 'POST',
        body: JSON.stringify(issueData)
      });
    },

    async returnBook(id, returnData = {}) {
      return request(`/transactions/return/${id}`, {
        method: 'POST',
        body: JSON.stringify(returnData)
      });
    },

    // Students
    async getStudents(search = '') {
      return request(`/students?search=${encodeURIComponent(search)}`);
    },

    async addStudent(studentData) {
      return request('/students', {
        method: 'POST',
        body: JSON.stringify(studentData)
      });
    },

    async toggleStudentStatus(id) {
      return request(`/students/${id}/toggle-status`, {
        method: 'PUT'
      });
    },

    async deleteStudent(id) {
      return request(`/students/${id}`, {
        method: 'DELETE'
      });
    },

    // Librarians
    async getLibrarians() {
      return request('/librarians');
    },

    async addLibrarian(librarianData) {
      return request('/librarians', {
        method: 'POST',
        body: JSON.stringify(librarianData)
      });
    },

    async toggleLibrarianStatus(id) {
      return request(`/librarians/${id}/toggle-status`, {
        method: 'PUT'
      });
    },

    async deleteLibrarian(id) {
      return request(`/librarians/${id}`, {
        method: 'DELETE'
      });
    },

    // Dashboard Stats
    async getDashboardStats() {
      return request('/stats/dashboard');
    },

    // Settings
    async getSettings() {
      return request('/settings');
    },

    async updateSettings(settings) {
      return request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    }
  };
})();
