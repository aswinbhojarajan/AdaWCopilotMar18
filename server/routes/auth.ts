import { Router, type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import pool from '../db/pool';
import { requireAuth, logAuthEvent } from '../middleware/auth';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const result = await pool.query(
    `SELECT id, email, password_hash, display_name, role, status, persona, avatar_url, mock_tier, mock_config
     FROM auth.users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );

  if (result.rows.length === 0) {
    logAuthEvent(null, 'login_failure', req, { email, reason: 'user_not_found' });
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const user = result.rows[0];

  if (user.status === 'suspended') {
    logAuthEvent(user.id, 'login_failure', req, { reason: 'account_suspended' });
    res.status(401).json({ error: 'Account has been suspended' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    logAuthEvent(user.id, 'login_failure', req, { reason: 'invalid_password' });
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  req.session.authUserId = user.id;

  logAuthEvent(user.id, 'login_success', req);

  res.json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    persona: user.persona,
    avatarUrl: user.avatar_url,
    mockTier: user.mock_tier,
    mockConfig: user.mock_config,
  });
}));

router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  logAuthEvent(userId, 'logout', req);

  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Session destroy error:', err);
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.clearCookie('ada.sid');
    res.json({ success: true });
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    persona: user.persona,
    avatarUrl: user.avatar_url,
    mockTier: user.mock_tier,
    mockConfig: user.mock_config,
  });
}));

export default router;
