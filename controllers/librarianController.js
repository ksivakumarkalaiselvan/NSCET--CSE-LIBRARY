const dataService = require('../services/dataService');
const { hashPassword } = require('../utils/helpers');

async function getLibrarians(req, res, next) {
  try {
    const librarians = await dataService.getLibrarians();
    return res.status(200).json({
      success: true,
      count: librarians.length,
      librarians: librarians.map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        status: l.status,
        createdAt: l.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

async function addLibrarian(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Librarian Name and Email are required.'
      });
    }

    const initialPassword = password || 'lib12345';
    const passwordHash = await hashPassword(initialPassword);

    const librarian = await dataService.addLibrarian({
      name,
      email,
      phone,
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: `Librarian "${librarian.name}" registered successfully.`,
      librarian: {
        id: librarian.id,
        name: librarian.name,
        email: librarian.email,
        phone: librarian.phone,
        status: librarian.status,
        createdAt: librarian.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

async function toggleLibrarianStatus(req, res, next) {
  try {
    const { id } = req.params;
    const librarian = await dataService.toggleLibrarianStatus(id);
    return res.status(200).json({
      success: true,
      message: `Librarian status updated to ${librarian.status}.`,
      librarian: {
        id: librarian.id,
        name: librarian.name,
        email: librarian.email,
        status: librarian.status
      }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteLibrarian(req, res, next) {
  try {
    const { id } = req.params;
    const librarian = await dataService.deleteLibrarian(id);
    return res.status(200).json({
      success: true,
      message: `Librarian "${librarian.name}" removed successfully.`,
      librarian: {
        id: librarian.id,
        name: librarian.name,
        email: librarian.email
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLibrarians,
  addLibrarian,
  toggleLibrarianStatus,
  deleteLibrarian
};
