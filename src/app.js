const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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

module.exports = app;