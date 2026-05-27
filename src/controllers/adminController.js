const { sendSuccess, sendError } = require('../utils/response');
const adminService = require('../services/adminService');

// Regex untuk validasi format UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// get Admin Logs
const getAdminLogs = async (req, res) => {
  try {
    const data = await adminService.getAdminLogs(req.query);
    return sendSuccess(res, 200, 'Berhasil mengambil seluruh log pemindaian.', data);
  } catch (error) {
    console.error('getAdminLogs Error:', error.message);
    return sendError(res, 500, 'Terjadi kesalahan pada server.');
  }
};

// delete Admin Log by Id
const deleteScanLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return sendError(res, 400, 'Format ID tidak valid. Harap gunakan UUID yang benar.');
    }

    await adminService.deleteScanLog(id);

    return sendSuccess(res, 200, 'Log scan berhasil dihapus.');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
    console.error('deleteScanLog Error:', error.message);
    return sendError(res, statusCode, message);
  }
};

// delete all Admin Log
const deleteAllScanLogs = async (req, res) => {
  try {
    const data = await adminService.deleteAllScanLogs();
    return sendSuccess(res, 200, `Seluruh log scan berhasil dihapus. Total: ${data.deleted_count} data.`, data);
  } catch (error) {
    console.error('deleteAllScanLogs Error:', error.message);
    return sendError(res, 500, 'Terjadi kesalahan pada server.');
  }
};

module.exports = {
  getAdminLogs,
  deleteScanLog,
  deleteAllScanLogs
};
