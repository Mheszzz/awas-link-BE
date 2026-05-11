require('dotenv').config(); 

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// 1. Setup koneksi pool dari library 'pg'
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Setup adapter Prisma untuk PostgreSQL
const adapter = new PrismaPg(pool);

// 3. Inisialisasi Prisma Client dengan Adapter
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;