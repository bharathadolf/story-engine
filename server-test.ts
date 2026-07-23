import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import projectsRouter from './src/server/routes/projects.js';
import graphRouter from './src/server/routes/graph.js';
import questionRouter from './src/server/routes/question.js';
import generateRouter from './src/server/routes/generate.js';
import departmentRouter from './src/server/routes/department.js';
import skillsRouter from './src/server/routes/skills.js';
import exportRouter from './src/server/routes/export.js';
import testNodeRouter from './tests/testNode.js';

import { resolveProject } from './src/server/middleware/resolveProject.js';
import { initStorage } from './src/server/services/projectService.js';

async function startServer() {
  const app = express();
  const PORT = 3002;

  // Initialize storage
  await initStorage();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', scope: 'node-testbed', time: new Date().toISOString() });
  });

  app.use('/api/projects', projectsRouter);
  
  // Scoped project routes using resolveProject middleware
  app.use('/api/projects/:projectId/graph', resolveProject as any, graphRouter);
  app.use('/api/projects/:projectId/question', resolveProject as any, questionRouter);
  app.use('/api/projects/:projectId/generate', resolveProject as any, generateRouter);
  app.use('/api/projects/:projectId/department', resolveProject as any, departmentRouter);
  app.use('/api/projects/:projectId/skills', resolveProject as any, skillsRouter);
  app.use('/api/projects/:projectId/export', resolveProject as any, exportRouter);
  app.use('/api/projects/:projectId/test-node', resolveProject as any, testNodeRouter);

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  });

  // Vite Integration for Asset Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Intercept root requests to serve the standalone test.html entry point
    app.get('/', async (req, res, next) => {
      try {
        const fs = await import('fs/promises');
        const template = await fs.readFile(path.join(process.cwd(), 'test.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'test.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Story Engine Node Testbed running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start test server:', err);
});
