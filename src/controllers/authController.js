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

module.exports = { loginAdmin };
