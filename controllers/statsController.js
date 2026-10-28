const dataService = require('../services/dataService');

async function getDashboardStats(req, res, next) {
  try {
    const stats = await dataService.getDashboardStats();
    return res.status(200).json({
      success: true,
      stats,
      mode: dataService.getStorageMode()
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
