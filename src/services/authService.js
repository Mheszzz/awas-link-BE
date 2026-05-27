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

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token };
};

module.exports = { loginAdmin };
