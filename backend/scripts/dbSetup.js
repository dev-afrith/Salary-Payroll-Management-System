const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Starting AstraX Technologies database setup...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true
  });

  const isReset = process.argv.includes('--reset');

  if (isReset) {
    console.log('⚠️  Resetting database...');
    // Drop logic is inside schema.sql or we can do it here
    await connection.query('DROP DATABASE IF EXISTS payroll_db;');
    console.log('🗑️  Old database dropped');
  }

  console.log('📦 Creating tables (3NF Normalized)...');
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, '../database/schema.sql'), 'utf8'
  );
  await connection.query(schemaSQL);
  console.log('✅ Tables created');

  console.log('🌱 Seeding demo data...');
  const seedSQL = fs.readFileSync(
    path.join(__dirname, '../database/seed.sql'), 'utf8'
  );
  await connection.query(seedSQL);
  console.log('✅ Demo data inserted');

  await connection.end();

  console.log('\n🎉 Database setup complete!');
  console.log('─────────────────────────────────');
  console.log('👤 Admin    : admin@astrax.com / Admin@123');
  console.log('👥 Employee : EMP001 / Emp@123');
  console.log('👥 Employee : EMP002 / Emp@123');
  console.log('👥 Employee : EMP003 / Emp@123');
  console.log('─────────────────────────────────');
  console.log('▶️  Now run: npm run dev');
}

setupDatabase().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
