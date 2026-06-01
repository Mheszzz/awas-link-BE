const { sendSuccess, sendError } = require('../utils/response');
const scanService = require('../services/scanService');

// get Public History
const getPublicHistory = async (req, res) => {
  try {
    const data = await scanService.getPublicHistory(req.query);
    return sendSuccess(res, 200, 'Berhasil mengambil riwayat pemindaian publik.', data);
  } catch (error) {
    console.error('getPublicHistory Error:', error.message);
    return sendError(res, 500, 'Terjadi kesalahan pada server.');
  }
};

// post Scan Message
const scanMessage = async (req, res) => {
  try {
    const { message_content } = req.body;

    if (!message_content || typeof message_content !== 'string' || message_content.trim() === '') {
      return sendError(res, 400, 'Teks pesan tidak valid atau kosong.');
    }

    const savedLog = await scanService.analyzeAndSaveMessage(message_content.trim());

    return sendSuccess(res, 200, 'Pesan berhasil dianalisis oleh AI.', savedLog);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
    console.error('scanMessage Error:', error.message);
    return sendError(res, statusCode, message);
  }
};

const getScanLogDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(id)) {
      return sendError(res, 400, 'Format ID tidak valid. Harap gunakan UUID yang benar.');
    }

    const data = await scanService.getScanLogDetail(id);
    return sendSuccess(res, 200, 'Berhasil mengambil detail log pemindaian.', data);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
    console.error('getScanLogDetail Error:', error.message);
    return sendError(res, statusCode, message);
  }
};

module.exports = {
  scanMessage,
  getPublicHistory,
  getScanLogDetail
};