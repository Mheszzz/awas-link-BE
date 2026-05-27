const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Anda belum login sebagai admin.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // Attach data admin ke request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa.'
    });
  }
};

module.exports = { authenticateAdmin };
