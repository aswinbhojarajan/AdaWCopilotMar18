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
  const user = await findUserById('user-abdullah');
  if (!user) throw new Error('Default user not found');
  return user;
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
