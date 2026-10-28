const dataService = require('../services/dataService');
const { hashPassword } = require('../utils/helpers');

async function getStudents(req, res, next) {
  try {
    const { search } = req.query;
    const students = await dataService.getStudents(search);
    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
}

async function addStudent(req, res, next) {
  try {
    const { name, regNo, department, email, phone, password } = req.body;

    if (!name || !regNo || !department || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, Register Number, Department, and Email are mandatory.'
      });
    }

    const initialPassword = password || 'student123';
    const passwordHash = await hashPassword(initialPassword);

    const student = await dataService.registerStudent({
      name,
      regNo,
      department,
      email,
      phone,
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: `Student "${student.name}" registered successfully.`,
      student
    });
  } catch (error) {
    next(error);
  }
}

async function toggleStudentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const student = await dataService.toggleStudentStatus(id);
    return res.status(200).json({
      success: true,
      message: `Student status updated to ${student.status}.`,
      student
    });
  } catch (error) {
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await dataService.deleteStudent(id);
    return res.status(200).json({
      success: true,
      message: `Student "${student.name}" (${student.regNo}) removed successfully.`,
      student
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  addStudent,
  toggleStudentStatus,
  deleteStudent
};
