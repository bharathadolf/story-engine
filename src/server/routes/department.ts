import express from 'express';
import { ProjectRequest } from '../middleware/resolveProject.js';
import { departmentCall } from '../services/geminiService.js';

const router = express.Router({ mergeParams: true });

router.post('/', async (req: ProjectRequest, res, next) => {
  try {
    const { targetNodeId, department, graph } = req.body;
    const { projectId } = req.params;
    if (!targetNodeId || !department || !graph) {
      return res.status(400).json({ error: 'targetNodeId, department, and graph are required' });
    }
    const text = await departmentCall(targetNodeId, department, graph, projectId);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

export default router;
