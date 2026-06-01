const { sendSuccess, sendError } = require('../utils/response');
const authService = require('../services/authService');

/**
 * POST /api/v1/auth/login
 * Login admin dan mendapatkan JWT token.
 */
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 400, 'Username dan password wajib diisi.');
    }

    const result = await authService.loginAdmin(username, password);

    return sendSuccess(res, 200, 'Login berhasil.', result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
    console.error('loginAdmin Error:', error.message);
    return sendError(res, statusCode, message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return sendError(res, 400, 'Refresh token wajib disertakan.');
    }

    const result = await authService.refreshAccessToken(refresh_token);
    return sendSuccess(res, 200, 'Access token berhasil diperbarui.', result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
    console.error('refreshToken Error:', error.message);
    return sendError(res, statusCode, message);
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const adminId = req.admin.id;
    await authService.logoutAdmin(adminId);
    return sendSuccess(res, 200, 'Logout berhasil.');
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Terjadi kesalahan pada server.' : error.message;
    console.error('logoutAdmin Error:', error.message);
    return sendError(res, statusCode, message);
  }
};

module.exports = { loginAdmin, refreshToken, logoutAdmin };
