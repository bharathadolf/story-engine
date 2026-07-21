import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { ProjectRequest } from '../middleware/resolveProject.js';

const router = express.Router({ mergeParams: true });

const GLOBAL_SKILLS_DIR = path.join(process.cwd(), 'skills');

router.get('/:skillName', async (req: ProjectRequest, res, next) => {
  try {
    const { skillName } = req.params;
    const paths = req.projectPaths;
    if (!paths) {
      return res.status(400).json({ error: 'Project paths not resolved' });
    }

    const overridePath = path.join(paths.skillsDir, `${skillName}.md`);
    try {
      const content = await fs.readFile(overridePath, 'utf-8');
      return res.json({ content, isOverride: true });
    } catch (_) {
      // No override, get global default
    }

    const globalPath = path.join(GLOBAL_SKILLS_DIR, `${skillName}.md`);
    try {
      const content = await fs.readFile(globalPath, 'utf-8');
      return res.json({ content, isOverride: false });
    } catch (_) {
      return res.status(404).json({ error: `Skill ${skillName} not found` });
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:skillName', async (req: ProjectRequest, res, next) => {
  try {
    const { skillName } = req.params;
    const { content } = req.body;
    if (content === undefined) {
      return res.status(400).json({ error: 'content is required' });
    }
    const paths = req.projectPaths;
    if (!paths) {
      return res.status(400).json({ error: 'Project paths not resolved' });
    }

    await fs.mkdir(paths.skillsDir, { recursive: true });

    const overridePath = path.join(paths.skillsDir, `${skillName}.md`);
    await fs.writeFile(overridePath, content, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
