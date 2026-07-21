import express from 'express';
import fs from 'fs/promises';
import { ProjectRequest } from '../middleware/resolveProject.js';
import { updateProjectMeta } from '../services/projectService.js';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: ProjectRequest, res, next) => {
  try {
    const paths = req.projectPaths;
    if (!paths) {
      return res.status(400).json({ error: 'Project paths not resolved' });
    }
    const data = await fs.readFile(paths.graph, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return res.json({ nodes: [], edges: [] });
    }
    next(err);
  }
});

router.post('/', async (req: ProjectRequest, res, next) => {
  try {
    const paths = req.projectPaths;
    if (!paths) {
      return res.status(400).json({ error: 'Project paths not resolved' });
    }
    const { nodes, edges } = req.body;
    if (!nodes || !edges) {
      return res.status(400).json({ error: 'nodes and edges are required' });
    }

    const graph = { nodes, edges };
    await fs.writeFile(paths.graph, JSON.stringify(graph, null, 2), 'utf-8');

    const { projectId } = req.params;
    await updateProjectMeta(projectId, { nodeCount: nodes.length });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
