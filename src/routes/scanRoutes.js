const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

/**
 * @swagger
 * /api/v1/scans:
 *   post:
 *     summary: Pindai Pesan (Deteksi Scam / Phishing / Aman)
 *     description: |
 *       Menerima isi pesan teks, mengirimkannya ke layanan AI untuk dianalisis,
 *       lalu menyimpan dan mengembalikan hasil ringkasnya.
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
 *                 description: Konten pesan yang akan dipindai (minimal 1 karakter)
 *                 example: "Selamat Anda menang hadiah utama! Klik link ini untuk mengklaim."
 *     responses:
 *       200:
 *         description: Pesan berhasil dianalisis
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
 *                   $ref: '#/components/schemas/ScanLog'
 *       400:
 *         description: Input tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: Layanan AI tidak dapat diakses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', scanController.scanMessage);

/**
 * @swagger
 * /api/v1/scans/history:
 *   get:
 *     summary: Riwayat Pemindaian Publik
 *     description: |
 *       Mengambil riwayat pemindaian publik dengan fitur pagination dan filtering.
 *       Dapat diakses publik **tanpa autentikasi**.
 *     tags:
 *       - Scans
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman untuk paginasi
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Jumlah data per halaman (maksimal 100)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Phishing/Scam, Aman]
 *         description: Filter berdasarkan status final
 *     responses:
 *       200:
 *         description: Berhasil mengambil riwayat pemindaian
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
 *                   example: "Berhasil mengambil riwayat pemindaian publik."
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_scanned:
 *                       type: integer
 *                       example: 1420
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1420
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         totalPages:
 *                           type: integer
 *                           example: 71
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ScanLog'
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/history', scanController.getPublicHistory);

/**
 * @swagger
 * /api/v1/scans/history/{id}:
 *   get:
 *     summary: Detail Riwayat Pemindaian Publik
 *     description: |
 *       Mengambil detail riwayat pemindaian publik berdasarkan ID.
 *       Dapat diakses publik **tanpa autentikasi**.
 *     tags:
 *       - Scans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID log pemindaian
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail riwayat pemindaian
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
 *                   example: "Berhasil mengambil detail log pemindaian."
 *                 data:
 *                   $ref: '#/components/schemas/ScanLog'
 *       400:
 *         description: Format ID tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Log tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Terjadi kesalahan pada server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/history/:id', scanController.getScanLogDetail);

module.exports = router;
