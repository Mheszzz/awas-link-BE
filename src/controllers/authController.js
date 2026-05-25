const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = { loginAdmin };
