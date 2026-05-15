const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');

const scanRoute = require('./routes/scanRoute');

const app = express();

app.use(helmet()); 
app.use(cors());   

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1/scans', scanRoute);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "AwasLink API Server is ready to scan!"
    });
});

module.exports = app;