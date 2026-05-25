const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/dashboard/public/history:
 *   get:
 *     summary: Riwayat Pemindaian Publik
 *     description: Mengambil total keseluruhan scan dan 20 riwayat pemindaian terbaru. Dapat diakses publik tanpa autentikasi.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Berhasil mengambil riwayat pemindaian publik
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
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "e4ba39d5-4560-449a-bd9b-cba068018df5"
 *                           messageContent:
 *                             type: string
 *                             example: "Selamat! Nomor Anda terpilih mendapatkan hadiah..."
 *                           finalStatus:
 *                             type: string
 *                             example: "Phishing/Scam"
 *                           messageRiskScore:
 *                             type: number
 *                             format: float
 *                             example: 98.5
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-05-22T07:15:30.123Z"
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get('/public/history', dashboardController.getPublicHistory);

/**
 * @swagger
 * /api/v1/dashboard/admin/logs:
 *   get:
 *     summary: Log Dasbor Lengkap Admin (Privat)
 *     description: Mengembalikan seluruh riwayat log pemindaian beserta ringkasan statistik. Wajib menyertakan JWT token yang valid pada header Authorization.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil seluruh log pemindaian
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
 *                   example: "Berhasil mengambil seluruh log pemindaian."
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_scanned:
 *                           type: integer
 *                           example: 1420
 *                         total_phishing:
 *                           type: integer
 *                           example: 980
 *                         total_aman:
 *                           type: integer
 *                           example: 440
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
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
 *                   example: "Akses ditolak. Token autentikasi tidak ditemukan."
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get('/admin/logs', authenticateAdmin, dashboardController.getAdminLogs);

/**
 * @swagger
 * /api/v1/dashboard/admin/logs/{id}:
 *   delete:
 *     summary: Hapus Log Pemindaian
 *     description: Menghapus log pemindaian berdasarkan ID. Wajib menyertakan JWT token admin.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID log pemindaian yang akan dihapus
 *     responses:
 *       200:
 *         description: Berhasil menghapus log scan
 *       404:
 *         description: Log scan tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.delete('/admin/logs/:id', authenticateAdmin, dashboardController.deleteScanLog);

/**
 * @swagger
 * /api/v1/dashboard/admin/logs:
 *   delete:
 *     summary: Hapus Seluruh Log Pemindaian
 *     description: Menghapus seluruh log pemindaian. Wajib menyertakan JWT token admin.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil menghapus seluruh log scan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.delete('/admin/logs', authenticateAdmin, dashboardController.deleteAllScanLogs);

module.exports = router;
