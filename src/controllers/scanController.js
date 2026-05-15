const axios = require('axios');
const prisma = require('../config/database');

const scanMessage = async (req, res) => {
  try {
    const { message_content } = req.body;

    if (!message_content || typeof message_content !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Teks pesan tidak valid atau kosong."
      });
    }

    const aiUrl = `${process.env.AI_SERVICE_URL}/predict`;

    // Koneksi ke Endpoint AI
    let aiResult;
    try {
      const aiResponse = await axios.post(
        aiUrl,
        { message: message_content },
        { timeout: 15000 }
      );

      aiResult = aiResponse.data;

    } catch (aiError) {
      console.error("Gagal menghubungi API AI:", aiError.message);
      return res.status(503).json({
        success: false,
        message: "Layanan pendeteksi AI sedang sibuk. Silakan coba lagi nanti."
      });
    }

    // Menyimpan Log Hasil Scan ke Database
    const savedLog = await prisma.scanLog.create({
      data: {
        messageContent: message_content,
        messageRiskScore: aiResult.confidence,
        finalStatus: aiResult.verdict
      }
    });

    // Mengembalikan Hasil Scan ke Front-End
    return res.status(200).json({
      success: true,
      message: "Pesan berhasil dianalisis oleh AI.",
      data: savedLog
    });

  } catch (error) {
    console.error("Internal Server Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server."
    });
  }
};

module.exports = {
  scanMessage
};