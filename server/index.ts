import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
