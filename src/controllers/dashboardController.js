const prisma = require('../config/database');

const getPublicHistory = async (req, res) => {
  try {
    const [totalScanned, history] = await Promise.all([
      prisma.scanLog.count(),
      prisma.scanLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          messageContent: true,
          finalStatus: true,
          messageRiskScore: true,
          createdAt: true
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil riwayat pemindaian publik.',
      data: {
        total_scanned: totalScanned,
        history
      }
    });

  } catch (error) {
    console.error('getPublicHistory Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const getAdminLogs = async (req, res) => {
  try {
    const [totalScanned, totalPhishing, totalAman, logs] = await Promise.all([
      prisma.scanLog.count(),
      prisma.scanLog.count({ where: { finalStatus: 'Phishing/Scam' } }),
      prisma.scanLog.count({ where: { finalStatus: 'Aman' } }),
      prisma.scanLog.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil seluruh log pemindaian.',
      data: {
        summary: {
          total_scanned: totalScanned,
          total_phishing: totalPhishing,
          total_aman: totalAman
        },
        logs
      }
    });

  } catch (error) {
    console.error('getAdminLogs Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const deleteScanLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const log = await prisma.scanLog.findUnique({
      where: { id }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log scan tidak ditemukan.'
      });
    }

    await prisma.scanLog.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Log scan berhasil dihapus.'
    });

  } catch (error) {
    console.error('deleteScanLog Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const deleteAllScanLogs = async (req, res) => {
  try {
    await prisma.scanLog.deleteMany({});
    
    return res.status(200).json({
      success: true,
      message: 'Seluruh log scan berhasil dihapus.'
    });
  } catch (error) {
    console.error('deleteAllScanLogs Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

module.exports = { getPublicHistory, getAdminLogs, deleteScanLog, deleteAllScanLogs };
