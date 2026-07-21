import express from 'express';
import { listProjects, createProject, updateProjectMeta, deleteProject, duplicateProject } from '../services/projectService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, genre } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const project = await createProject({ name, genre });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

router.put('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const updated = await updateProjectMeta(projectId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await deleteProject(projectId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/:projectId/duplicate', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const duplicate = await duplicateProject(projectId);
    res.status(201).json(duplicate);
  } catch (err) {
    next(err);
  }
});

export default router;
