const swaggerJsDoc = require('swagger-jsdoc');

const servers = [
  {
    url: `http://localhost:${process.env.PORT || 3000}`,
    description: 'Development Server (Local)',
  },
];

// Tambahkan server production jika env tersedia
if (process.env.PRODUCTION_URL) {
  servers.push({
    url: process.env.PRODUCTION_URL,
    description: 'Production Server',
  });
}

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AwasLink API Documentation',
      version: '1.0.0',
      description:
        'Dokumentasi RESTful API untuk **AwasLink** — aplikasi pendeteksi pesan Scam & Phishing berbasis AI.\n\n' +
        '## Autentikasi\n' +
        'Endpoint admin menggunakan **Bearer JWT Token**. ' +
        'Dapatkan token melalui `POST /api/v1/auth/login`, lalu klik tombol **Authorize** di atas dan masukkan tokennya.',
      contact: {
        name: 'AwasLink Back-End Team',
      },
    },
    servers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT yang didapat dari POST /api/v1/auth/login',
        },
      },
      schemas: {
        // Schema reusable untuk response error
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Terjadi kesalahan pada server.',
            },
          },
        },
        // Schema reusable untuk objek ScanLog
        ScanLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'e4ba39d5-4560-449a-bd9b-cba068018df5',
            },
            messageContent: {
              type: 'string',
              example: 'Selamat! Nomor Anda terpilih mendapatkan hadiah...',
            },
            finalStatus: {
              type: 'string',
              example: 'Phishing/Scam',
            },
            messageRiskScore: {
              type: 'number',
              format: 'float',
              example: 0.985,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-22T07:15:30.123Z',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;