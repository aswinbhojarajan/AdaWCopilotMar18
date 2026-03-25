import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api';
import { initDatabase } from './db/init';
import { validateRegistry } from './services/toolRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd ? 5000 : 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
