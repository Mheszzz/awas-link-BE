const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Inisialisasi Prisma khusus untuk seeding (tidak menggunakan singleton global)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'adminpassword123';
  const SALT_ROUNDS = 10;

  console.log('🌱 Memulai proses seeding database...');

  // Hash password sebelum disimpan
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  // Upsert: buat jika belum ada, update jika sudah ada (idempotent)
  const admin = await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: { passwordHash },
    create: {
      username: ADMIN_USERNAME,
      passwordHash
    }
  });

  console.log(`✅ Admin berhasil dibuat/diperbarui:`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   ID       : ${admin.id}`);
  console.log('');
  console.log('🎉 Seeding selesai!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
