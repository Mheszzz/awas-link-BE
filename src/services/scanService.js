const axios = require('axios');
const prisma = require('../config/database');

const analyzeAndSaveMessage = async (messageContent) => {
  const aiUrl = `${process.env.AI_SERVICE_URL}/predict`;

  // Koneksi ke Endpoint AI
  let aiResult;
  try {
    const aiResponse = await axios.post(
      aiUrl,
      { message: messageContent },
      { timeout: 15000 }
    );
    aiResult = aiResponse.data;
  } catch (aiError) {
    console.error('Gagal menghubungi API AI:', aiError.message);
    const err = new Error('Layanan pendeteksi AI sedang sibuk. Silakan coba lagi nanti.');
    err.statusCode = 503;
    throw err;
  }

  // Simpan log hasil scan ke database
  const savedLog = await prisma.scanLog.create({
    data: {
      messageContent,
      messageRiskScore: aiResult.confidence,
      finalStatus: aiResult.verdict,
    },
  });

  return savedLog;
};

const getPublicHistory = async (query = {}) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const status = query.status || null;

  const skip = (page - 1) * limit;
  const where = {
    deletedAt: null,
    ...(status ? { finalStatus: status } : {})
  };

  const [total_scanned, total_filtered, history] = await Promise.all([
    prisma.scanLog.count(),
    prisma.scanLog.count({ where }),
    prisma.scanLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        messageContent: true,
        finalStatus: true,
        messageRiskScore: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    total_scanned,
    pagination: {
      total: total_filtered,
      page,
      limit,
      totalPages: Math.ceil(total_filtered / limit) || 1,
    },
    history,
  };
};

const getScanLogDetail = async (id) => {
  const log = await prisma.scanLog.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      messageContent: true,
      finalStatus: true,
      messageRiskScore: true,
      createdAt: true,
    }
  });

  if (!log) {
    const err = new Error('Log scan tidak ditemukan.');
    err.statusCode = 404;
    throw err;
  }

  return log;
};

module.exports = {
  analyzeAndSaveMessage,
  getPublicHistory,
  getScanLogDetail
};
