import express from 'express';
import { ProjectRequest } from '../middleware/resolveProject.js';
import { generateCall, brainstormCall } from '../services/geminiService.js';

const router = express.Router({ mergeParams: true });

router.post('/', async (req: ProjectRequest, res, next) => {
  try {
    const { targetNodeId, graph } = req.body;
    const { projectId } = req.params;
    if (!targetNodeId || !graph) {
      return res.status(400).json({ error: 'targetNodeId and graph are required' });
    }
    const text = await generateCall(targetNodeId, graph, projectId);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

router.post('/brainstorm', async (req: ProjectRequest, res, next) => {
  try {
    const { targetNodeId, graph } = req.body;
    const { projectId } = req.params;
    if (!targetNodeId || !graph) {
      return res.status(400).json({ error: 'targetNodeId and graph are required' });
    }
    const children = await brainstormCall(targetNodeId, graph, projectId);
    res.json({ children });
  } catch (err) {
    next(err);
  }
});

export default router;
