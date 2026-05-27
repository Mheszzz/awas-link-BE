const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');

const scanRoutes = require('./routes/scanRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ─── Security & Parsing Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger API Documentation ────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ─── API Routes (v1) ──────────────────────────────────────────────────────────
app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AwasLink API Server is ready to scan!',
    docs: '/api-docs',
  });
});

module.exports = app;