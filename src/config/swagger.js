const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'AwasLink API Documentation',
            version: '1.0.0',
            description: 'Dokumentasi RESTful API untuk AwasLink (Pendeteksi Pesan Scam & Phishing)',
            contact: {
                name: 'AwasLink Back-End Team'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development Server'
            }
        ],
    },
    apis: ['./src/routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;