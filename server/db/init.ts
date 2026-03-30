import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');
    const authSchemaPath = path.join(__dirname, 'auth-schema.sql');
    const authSeedPath = path.join(__dirname, 'auth-seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);
    console.log('Database schema applied successfully');

    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    await client.query(seedSql);
    console.log('Database seed data applied successfully');

    const authSchemaSql = fs.readFileSync(authSchemaPath, 'utf-8');
    await client.query(authSchemaSql);
    console.log('Auth schema applied successfully');

    const authSeedSql = fs.readFileSync(authSeedPath, 'utf-8');
    await client.query(authSeedSql);
    console.log('Auth seed data applied successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}
