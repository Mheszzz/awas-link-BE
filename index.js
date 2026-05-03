require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Menyalakan Server
app.listen(PORT, () => {
    console.log(`======================================`);
    console.log(`🚀 Back-End AwasLink berhasil menyala!`);
    console.log(`📡 Server berjalan di http://localhost:${PORT}`);
    console.log(`======================================`);
});