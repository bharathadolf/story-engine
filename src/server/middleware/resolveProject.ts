import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const DATA_DIR = path.join(process.cwd(), 'data', 'projects');

export interface ProjectRequest extends Request {
  projectPaths?: {
    root: string;
    graph: string;
    bible: string;
    skillsDir: string;
    draftsDir: string;
  };
}

export function resolveProject(req: ProjectRequest, res: Response, next: NextFunction) {
  const { projectId } = req.params;
  const projectDir = path.join(DATA_DIR, projectId);

  if (!fs.existsSync(projectDir)) {
    return res.status(404).json({ error: `Project ${projectId} not found` });
  }

  req.projectPaths = {
    root: projectDir,
    graph: path.join(projectDir, 'graph.json'),
    bible: path.join(projectDir, 'bible.json'),
    skillsDir: path.join(projectDir, 'skills'),
    draftsDir: path.join(projectDir, 'drafts')
  };
  
  next();
}
