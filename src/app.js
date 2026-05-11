const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express'); // Import Swagger UI
const swaggerDocs = require('./config/swagger'); // Import Konfigurasi Swagger

const app = express();

app.use(helmet()); 
app.use(cors());   

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "AwasLink API Server is ready to scan!"
    });
});

// Menambahkan rute antarmuka dokumentasi Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ROUTES

module.exports = app;