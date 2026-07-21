import express from 'express';
import { ProjectRequest } from '../middleware/resolveProject.js';
import { exportScreenplay } from '../services/exportService.js';

const router = express.Router({ mergeParams: true });

router.post('/', async (req: ProjectRequest, res, next) => {
  try {
    const { graph } = req.body;
    const paths = req.projectPaths;
    if (!graph || !paths) {
      return res.status(400).json({ error: 'graph and project paths are required' });
    }

    const outputPath = await exportScreenplay(graph, paths);

    res.download(outputPath, 'screenplay.docx', (err) => {
      if (err) {
        console.error('Error downloading screenplay document:', err);
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
