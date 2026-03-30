import { Router, type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool';
import { requireAuth, requireRole, logAuthEvent } from '../middleware/auth';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.use(requireAuth, requireRole('ops_admin'));

router.get('/users', asyncHandler(async (_req, res) => {
  const result = await pool.query(
    `SELECT id, email, display_name, role, status, persona, avatar_url, mock_tier, mock_config, created_at, updated_at
     FROM auth.users ORDER BY created_at`
  );
  res.json(result.rows);
}));

router.post('/users', asyncHandler(async (req, res) => {
  const { email, password, displayName, role, persona, mockTier, mockConfig } = req.body as {
    email?: string;
    password?: string;
    displayName?: string;
    role?: string;
    persona?: string;
    mockTier?: string;
    mockConfig?: Record<string, unknown>;
  };

  if (!email || !password || !displayName) {
    res.status(400).json({ error: 'email, password, and displayName are required' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userRole = role === 'ops_admin' ? 'ops_admin' : 'preview_user';

  const result = await pool.query(
    `INSERT INTO auth.users (email, password_hash, display_name, role, persona, mock_tier, mock_config)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, display_name, role, status, persona, avatar_url, mock_tier, mock_config, created_at`,
    [email.toLowerCase().trim(), passwordHash, displayName, userRole, persona || null, mockTier || null, JSON.stringify(mockConfig || {})]
  );

  logAuthEvent(req.user!.id, 'admin_create_user', req, { createdEmail: email });

  res.status(201).json(result.rows[0]);
}));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !['active', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'status must be "active" or "suspended"' });
    return;
  }

  const result = await pool.query(
    `UPDATE auth.users SET status = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, email, display_name, role, status`,
    [status, id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  logAuthEvent(req.user!.id, 'admin_update_status', req, { targetId: id, newStatus: status });

  res.json(result.rows[0]);
}));

router.patch('/users/:id/password', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body as { password?: string };

  if (!password || password.length < 8) {
    res.status(400).json({ error: 'password must be at least 8 characters' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `UPDATE auth.users SET password_hash = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, email, display_name`,
    [passwordHash, id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  logAuthEvent(req.user!.id, 'admin_reset_password', req, { targetId: id });

  res.json({ success: true, user: result.rows[0] });
}));

export default router;
