const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

/**
 * @swagger
 * /api/v1/scans:
 *   post:
 *     summary: Memindai pesan untuk mendeteksi scam, phishing, atau spam
 *     description: Endpoint ini menerima isi pesan, mengirimkannya ke layanan AI untuk dianalisis, lalu menyimpan hasil ringkasnya ke database sesuai schema Prisma.
 *     tags:
 *       - Scans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_content
 *             properties:
 *               message_content:
 *                 type: string
 *                 description: Konten pesan yang akan dipindai
 *                 example: "Selamat Anda menang hadiah utama! Klik link ini untuk mengklaim hadiah Anda."
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Pesan berhasil dianalisis dan disimpan ke database
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
 *                   example: "Pesan berhasil dianalisis oleh AI."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     messageContent:
 *                       type: string
 *                       example: "Selamat Anda menang hadiah utama! Klik link ini untuk mengklaim hadiah Anda."
 *                     messageRiskScore:
 *                       type: number
 *                       format: float
 *                       example: 0.92
 *                     finalStatus:
 *                       type: string
 *                       example: "Spam/Penipuan"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-05-12T14:30:00.000Z"
 *       400:
 *         description: Validasi input gagal
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
 *             examples:
 *               emptyMessage:
 *                 summary: Pesan kosong
 *                 value:
 *                   success: false
 *                   message: "Teks pesan tidak valid atau kosong."
 *       503:
 *         description: Layanan AI sedang tidak dapat diakses
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
 *                   example: "Layanan pendeteksi AI sedang sibuk. Silakan coba lagi nanti."
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
router.post('/', scanController.scanMessage);

module.exports = router;