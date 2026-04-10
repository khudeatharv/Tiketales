import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  const { initDb } = await import('../backend/config/db');
  await initDb();
  console.log('Database initialized successfully.');
};

run().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});
