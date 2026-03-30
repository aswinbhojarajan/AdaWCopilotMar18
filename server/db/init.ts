import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from './pool';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEMO_PASSWORD = 'Ada2026!';
const ADMIN_FALLBACK_PASSWORD = 'AdaAdmin!Secure2026';

async function seedAuthUsers(client: import('pg').PoolClient): Promise<void> {
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || ADMIN_FALLBACK_PASSWORD;
  if (!process.env.ADMIN_DEFAULT_PASSWORD) {
    console.log('[auth-seed] No ADMIN_DEFAULT_PASSWORD set; using built-in fallback.');
  }
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const upsertSql = `
    INSERT INTO auth.users (email, password_hash, display_name, role, status, persona, mock_tier, mock_config)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      display_name = EXCLUDED.display_name,
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      persona = EXCLUDED.persona,
      mock_tier = EXCLUDED.mock_tier,
      mock_config = EXCLUDED.mock_config,
      updated_at = NOW()
  `;

  const users: Array<[string, string, string, string, string, string | null, string | null, string]> = [
    ['aisha@demo.ada', demoHash, 'Aisha Al-Rashid', 'preview_user', 'active', 'user-aisha', 'platinum', '{"risk_level":"moderate","portfolio_value":93105.94}'],
    ['khalid@demo.ada', demoHash, 'Khalid Al-Mansoori', 'preview_user', 'active', 'user-khalid', 'gold', '{"risk_level":"conservative","portfolio_value":45200.00}'],
    ['raj@demo.ada', demoHash, 'Raj Patel', 'preview_user', 'active', 'user-raj', 'standard', '{"risk_level":"aggressive","portfolio_value":28750.00}'],
    ['admin@ada.app', adminHash, 'Admin', 'ops_admin', 'active', null, null, '{}'],
  ];

  for (const u of users) {
    await client.query(upsertSql, u);
  }
}

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');
    const authSchemaPath = path.join(__dirname, 'auth-schema.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);
    console.log('Database schema applied successfully');

    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    await client.query(seedSql);
    console.log('Database seed data applied successfully');

    const authSchemaSql = fs.readFileSync(authSchemaPath, 'utf-8');
    await client.query(authSchemaSql);
    console.log('Auth schema applied successfully');

    await seedAuthUsers(client);
    console.log('Auth seed data applied successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}
