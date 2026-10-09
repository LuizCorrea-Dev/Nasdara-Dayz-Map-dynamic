import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool (Object Method)
export const createPool = () => {
  if (!global._postgresPool) {
    const connectionUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL;
    const isConnectionString = Boolean(connectionUrl);

    const poolConfig = isConnectionString
      ? {
          connectionString: connectionUrl,
          ssl:
            process.env.DATABASE_SSL === 'false'
              ? false
              : process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
        }
      : {
          host: process.env.SQL_HOST,
          port: Number(process.env.SQL_PORT) || 5432,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          max: 10,
          connectionTimeoutMillis: 15000,
        };

    global._postgresPool = new Pool(poolConfig);

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance lazily
const pool = createPool();

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

// Auto-bootstrap schema tables if they do not exist (ideal for Vercel Postgres / Neon)
export const initSchema = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS groups (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          invite_code TEXT NOT NULL UNIQUE,
          owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS group_members (
          id SERIAL PRIMARY KEY,
          group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          role TEXT DEFAULT 'member' NOT NULL,
          joined_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS group_locations (
          id SERIAL PRIMARY KEY,
          group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
          created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          category TEXT DEFAULT 'base' NOT NULL,
          military_grid TEXT NOT NULL,
          in_game_x DOUBLE PRECISION NOT NULL,
          in_game_z DOUBLE PRECISION NOT NULL,
          lat DOUBLE PRECISION NOT NULL,
          lng DOUBLE PRECISION NOT NULL,
          code_lock TEXT,
          loot_notes TEXT,
          additional_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      console.log('Database tables verified / created successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Notice: Database schema auto-check:', error);
  }
};
