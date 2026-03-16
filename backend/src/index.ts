import express from 'express';
import cors from 'cors';
import { devopsRouter } from './routes/devops.routes.js';
import { agentsRouter } from './routes/agents.routes.js';
import { exportRouter } from './routes/export.routes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/devops', devopsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/export', exportRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
