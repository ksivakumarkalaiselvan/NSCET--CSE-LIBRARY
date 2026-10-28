const dataService = require('../services/dataService');

async function getSettings(req, res, next) {
  try {
    const settings = await dataService.getSettings();
    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const updated = await dataService.updateSettings(req.body);
    return res.status(200).json({
      success: true,
      message: 'Library configuration updated successfully.',
      settings: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
