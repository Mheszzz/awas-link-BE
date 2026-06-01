const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const loginAdmin = async (username, password) => {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) {
    const err = new Error('Username atau password salah.');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    const err = new Error('Username atau password salah.');
    err.statusCode = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: admin.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  await prisma.admin.update({
    where: { id: admin.id },
    data: { refreshToken },
  });

  return { access_token: accessToken, refresh_token: refreshToken };
};

const refreshAccessToken = async (token) => {
  if (!token) {
    const err = new Error('Refresh token diperlukan.');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || admin.refreshToken !== token) {
      const err = new Error('Refresh token tidak valid atau sudah kadaluarsa.');
      err.statusCode = 403;
      throw err;
    }

    const accessToken = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return { access_token: accessToken };
  } catch (error) {
    const err = new Error('Refresh token tidak valid atau sudah kadaluarsa.');
    err.statusCode = 403;
    throw err;
  }
};

const logoutAdmin = async (adminId) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: { refreshToken: null },
  });
  return true;
};

module.exports = { loginAdmin, refreshAccessToken, logoutAdmin };
