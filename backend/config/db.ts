import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 5,
});

export const query = (text: string, params: any[] = []) => pool.query(text, params);

let initialized = false;
let initPromise: Promise<void> | null = null;

const runInitialization = async () => {
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS movies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      language TEXT,
      genre TEXT,
      duration INTEGER,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      seats_available INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      seats INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const adminUsername = process.env.ADMIN_USERNAME || 'atharv1441';
  const adminEmail = process.env.ADMIN_EMAIL || 'atharv1441@admin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  await query(
    `
      INSERT INTO users (name, email, password, role, status)
      VALUES ($1, $2, $3, 'admin', 'approved')
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = 'admin', status = 'approved';
    `,
    [adminUsername, adminEmail.toLowerCase(), hashedAdminPassword],
  );
};

export const initDb = async () => {
  if (initialized) return;

  if (!initPromise) {
    initPromise = runInitialization()
      .then(() => {
        initialized = true;
      })
      .finally(() => {
        if (!initialized) {
          initPromise = null;
        }
      });
  }

  await initPromise;
};

export default pool;
