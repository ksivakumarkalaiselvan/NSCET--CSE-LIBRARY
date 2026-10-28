const jwt = require('jsonwebtoken');
const config = require('../config/config');
const dataService = require('../services/dataService');
const { comparePassword, hashPassword } = require('../utils/helpers');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await dataService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    if (user.status && user.status.toLowerCase() !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the library administration.'
      });
    }

    if (user.email && user.email.toLowerCase() === 'admin@college.edu') {
      user.role = 'admin';
      user.name = 'Prof. ARCHANA .R';
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      regNo: user.regNo || null,
      department: user.department || null
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: payload
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const { name, regNo, department, email, phone, password } = req.body;

    if (!name || !regNo || !department || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Register No, Department, Email, Password) are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const passwordHash = await hashPassword(password);

    const student = await dataService.registerStudent({
      name,
      regNo,
      department,
      email,
      phone: phone || '',
      passwordHash
    });

    const payload = {
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student',
      regNo: student.regNo,
      department: student.department
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return res.status(201).json({
      success: true,
      message: 'Student registration successful! Welcome to the Library.',
      token,
      user: payload
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await dataService.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    if (user.email && user.email.toLowerCase() === 'admin@college.edu') {
      user.role = 'admin';
      user.name = 'Prof. ARCHANA .R';
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo || null,
        department: user.department || null,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  getMe
};
