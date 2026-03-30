import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './db/pool';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import { initDatabase } from './db/init';
import { validateRegistry } from './services/toolRegistry';
import { initDiscoverPipeline, getDiscoverPipelineHealth } from './services/discoverPipeline/index';
import { resolveSession } from './middleware/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd ? 5000 : 3001;

app.set('trust proxy', 1);

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool: pool,
    schemaName: 'auth',
    tableName: 'sessions',
    createTableIfMissing: false,
  }),
  name: 'ada.sid',
  secret: (() => {
    const secret = process.env.SESSION_SECRET;
    if (!secret) throw new Error('SESSION_SECRET environment variable is required');
    return secret;
  })(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProd || !!process.env.REPLIT_DOMAINS,
    sameSite: 'strict',
    maxAge: 12 * 60 * 60 * 1000,
  },
}));

app.use(resolveSession);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/pipeline/health', (_req, res) => {
  res.json(getDiscoverPipelineHealth());
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', apiRouter);

if (isProd) {
  const buildDir = path.resolve(__dirname, '..', 'build');
  app.use(express.static(buildDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('API error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  },
);

async function start() {
  const registryCheck = validateRegistry();
  if (!registryCheck.valid) {
    console.error('[ToolRegistry] Validation FAILED:');
    for (const err of registryCheck.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
  console.log('[ToolRegistry] All tool manifests validated successfully');

  await initDatabase();
  await initDiscoverPipeline();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
