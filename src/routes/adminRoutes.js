const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/v1/admin/logs:
 *   get:
 *     summary: Ambil Semua Log + Statistik (Admin)
 *     description: |
 *       Mengembalikan seluruh riwayat log pemindaian beserta ringkasan statistik.
 *       **Wajib menyertakan JWT token** yang valid pada header Authorization.
 *     tags:
 *       - Admin
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
 *                         $ref: '#/components/schemas/ScanLog'
 *       401:
 *         description: Token tidak valid atau tidak ditemukan
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
router.get('/logs', authenticateAdmin, adminController.getAdminLogs);

/**
 * @swagger
 * /api/v1/admin/logs/{id}:
 *   delete:
 *     summary: Hapus Satu Log Pemindaian (Admin)
 *     description: |
 *       Menghapus satu log pemindaian berdasarkan ID.
 *       **Wajib menyertakan JWT token** yang valid pada header Authorization.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID log pemindaian yang akan dihapus
 *         example: "e4ba39d5-4560-449a-bd9b-cba068018df5"
 *     responses:
 *       200:
 *         description: Log berhasil dihapus
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
 *                   example: "Log scan berhasil dihapus."
 *       400:
 *         description: Format ID tidak valid (bukan UUID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token tidak valid
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
router.delete('/logs/:id', authenticateAdmin, adminController.deleteScanLog);

/**
 * @swagger
 * /api/v1/admin/logs:
 *   delete:
 *     summary: Hapus Semua Log Pemindaian (Admin)
 *     description: |
 *       Menghapus **seluruh** log pemindaian dari database. Aksi ini tidak dapat dibatalkan.
 *       **Wajib menyertakan JWT token** yang valid pada header Authorization.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Semua log berhasil dihapus
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
 *                   example: "Seluruh log scan berhasil dihapus. Total: 42 data."
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: integer
 *                       example: 42
 *       401:
 *         description: Token tidak valid
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
router.delete('/logs', authenticateAdmin, adminController.deleteAllScanLogs);

module.exports = router;
