const prisma = require('../config/database');

// Mengambil seluruh log_scan berdasarkan status dan pagination
const getAdminLogs = async (query = {}) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const status = query.status || null;

  const skip = (page - 1) * limit;
  const where = {
    deletedAt: null,
    ...(status ? { finalStatus: status } : {})
  };

  const [total_scanned, total_phishing, total_aman, total_filtered, logs] = await Promise.all([
    prisma.scanLog.count(),
    prisma.scanLog.count({ where: { finalStatus: 'Phishing/Scam' } }),
    prisma.scanLog.count({ where: { finalStatus: 'Aman' } }),
    prisma.scanLog.count({ where }),
    prisma.scanLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    summary: { total_scanned, total_phishing, total_aman },
    pagination: {
      total: total_filtered,
      page,
      limit,
      totalPages: Math.ceil(total_filtered / limit) || 1,
    },
    logs,
  };
};

// menghapus salah satu log_scan
const deleteScanLog = async (id) => {
  const log = await prisma.scanLog.findUnique({ where: { id } });

  if (!log) {
    const err = new Error('Log scan tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  await prisma.scanLog.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

// MEnghapus seluruh log_scan (Soft Delete)
const deleteAllScanLogs = async () => {
  const result = await prisma.scanLog.updateMany({
    where: { deletedAt: null },
    data: { deletedAt: new Date() }
  });
  return { deleted_count: result.count };
};

module.exports = { getAdminLogs, deleteScanLog, deleteAllScanLogs };
