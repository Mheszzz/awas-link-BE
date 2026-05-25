const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login Admin
 *     description: Memverifikasi kredensial admin dan mengembalikan JWT token untuk mengakses endpoint privat.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username akun admin
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 description: Password akun admin
 *                 example: "adminpassword123"
 *     responses:
 *       200:
 *         description: Login berhasil, token JWT dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login berhasil."
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Input tidak lengkap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Username dan password wajib diisi."
 *       401:
 *         description: Kredensial salah
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Username atau password salah."
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Terjadi kesalahan pada server."
 */
router.post('/login', authController.loginAdmin);

module.exports = router;
