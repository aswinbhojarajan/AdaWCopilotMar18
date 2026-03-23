import pool from '../db/pool';
import type { User, RiskProfile } from '../../shared/types';

export async function findUserById(id: string): Promise<User | undefined> {
  const { rows } = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.advisor_id,
            rp.level, rp.score, rp.last_assessed
     FROM users u
     LEFT JOIN risk_profiles rp ON rp.user_id = u.id
     WHERE u.id = $1`,
    [id],
  );
  if (rows.length === 0) return undefined;
  return mapRowToUser(rows[0]);
}

export async function getDefaultUser(): Promise<User> {
  const user = await findUserById('user-aisha');
  if (!user) throw new Error('Default user not found');
  return user;
}

export interface DemoPersona {
  id: string;
  firstName: string;
  lastName: string;
  riskLevel: string;
  portfolioValue: number;
}

export async function getAllDemoUsers(): Promise<DemoPersona[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.first_name, u.last_name,
            COALESCE(rp.level, 'moderate') as risk_level,
            COALESCE(ps.total_value, 0) as portfolio_value
     FROM users u
     LEFT JOIN risk_profiles rp ON rp.user_id = u.id
     LEFT JOIN LATERAL (
       SELECT total_value FROM portfolio_snapshots
       WHERE user_id = u.id ORDER BY recorded_at DESC LIMIT 1
     ) ps ON true
     WHERE u.id LIKE 'user-%'
     ORDER BY u.first_name ASC`,
  );
  return rows.map((r) => ({
    id: String(r.id),
    firstName: String(r.first_name),
    lastName: String(r.last_name),
    riskLevel: String(r.risk_level),
    portfolioValue: Number(r.portfolio_value),
  }));
}

function mapRowToUser(row: Record<string, unknown>): User {
  const riskProfile: RiskProfile = {
    level: (row.level as RiskProfile['level']) ?? 'moderate',
    score: Number(row.score ?? 50),
    lastAssessed: row.last_assessed ? String(row.last_assessed) : new Date().toISOString(),
  };

  return {
    id: String(row.id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    email: String(row.email),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    riskProfile,
    advisorId: row.advisor_id ? String(row.advisor_id) : undefined,
  };
}
