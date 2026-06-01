const app = require('./src/app');
const port = process.env.PORT || 3000;

// Blok ini hanya akan berjalan saat kamu mengetik 'npm run dev' di lokal
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`🚀 Server lokal berjalan di http://localhost:${port}`);
    });
}

// Wajib mengekspor modul 'app' agar Vercel bisa membacanya
module.exports = app;