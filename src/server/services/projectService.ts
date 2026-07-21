import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectMeta {
  id: string;
  name: string;
  genre: string;
  logline?: string;
  coverColor?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  status: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_JSON = path.join(DATA_DIR, 'projects.json');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // Already exists
  }
}

export async function initStorage() {
  await ensureDirectoryExists(DATA_DIR);
  await ensureDirectoryExists(PROJECTS_DIR);
  try {
    await fs.access(PROJECTS_JSON);
  } catch {
    await fs.writeFile(PROJECTS_JSON, JSON.stringify([], null, 2), 'utf-8');
  }

  // Ensure sandbox project is initialized
  try {
    let data = await fs.readFile(PROJECTS_JSON, 'utf-8');
    if (!data || !data.trim()) {
      data = '[]';
      await fs.writeFile(PROJECTS_JSON, '[]', 'utf-8');
    }
    const projects: ProjectMeta[] = JSON.parse(data);
    if (!projects.some(p => p.id === 'proj-sandbox')) {
      const sandboxMeta: ProjectMeta = {
        id: 'proj-sandbox',
        name: 'Testing Sandbox Canvas',
        genre: 'Developer Sandbox',
        logline: 'Isolated sandbox environment to design and test story elements individually.',
        coverColor: '#059669', // Emerald
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodeCount: 2,
        status: 'sandbox'
      };

      const projectFolder = path.join(PROJECTS_DIR, 'proj-sandbox');
      await ensureDirectoryExists(projectFolder);
      await ensureDirectoryExists(path.join(projectFolder, 'skills'));
      await ensureDirectoryExists(path.join(projectFolder, 'drafts'));

      const bibleNode = {
        id: 'bible-001',
        type: 'bible',
        position: { x: 250, y: 150 },
        data: {
          title: 'Sandbox Story',
          premise: 'A developer tries to test individual story nodes on a local sandbox canvas.',
          theme: 'Isolation and integration',
          toneContract: {
            pacing: 'Fast-paced testing cycles',
            darkness: 'Balanced light',
            adventure: 'Software development coding journey'
          },
          worldRules: {
            setting: 'Vite & Express server on localhost:3000'
          },
          twistMechanics: 'Sudden compilation errors',
          status: 'sandbox-bible'
        }
      };

      const charNode = {
        id: 'char-test',
        type: 'character',
        position: { x: 600, y: 150 },
        data: {
          name: 'Protagonist Dev',
          role: 'Protagonist',
          want: 'To see system prompts directly in the UI.',
          need: 'To test node context formatting quickly.',
          wound: 'Had to click 10 buttons to generate one scene draft.',
          flaw: 'Writes code without testing on localhost first.'
        }
      };

      const graph = {
        nodes: [bibleNode, charNode],
        edges: [
          { id: 'edge-sandbox-1', source: 'bible-001', target: 'char-test', label: 'defines' }
        ]
      };

      await fs.writeFile(path.join(projectFolder, 'graph.json'), JSON.stringify(graph, null, 2), 'utf-8');
      await fs.writeFile(path.join(projectFolder, 'bible.json'), JSON.stringify(bibleNode, null, 2), 'utf-8');

      projects.unshift(sandboxMeta);
      await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize sandbox project:', err);
  }
}

export async function listProjects(): Promise<ProjectMeta[]> {
  await initStorage();
  try {
    const data = await fs.readFile(PROJECTS_JSON, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export async function createProject(params: { name: string; genre: string }): Promise<ProjectMeta> {
  await initStorage();
  const projects = await listProjects();
  const id = `proj-${uuidv4().substring(0, 8)}`;

  const newProject: ProjectMeta = {
    id,
    name: params.name,
    genre: params.genre || 'Unspecified',
    logline: '',
    coverColor: getRandomColor(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodeCount: 1,
    status: 'in-development'
  };

  // Create isolated directories
  const projectFolder = path.join(PROJECTS_DIR, id);
  await ensureDirectoryExists(projectFolder);
  await ensureDirectoryExists(path.join(projectFolder, 'skills'));
  await ensureDirectoryExists(path.join(projectFolder, 'drafts'));

  // Create empty initial Bible Node
  const bibleNode = {
    id: 'bible-001',
    type: 'bible',
    position: { x: 400, y: 100 },
    data: {
      title: params.name,
      premise: '',
      theme: '',
      toneContract: {
        pacing: 'Moderate pacing',
        darkness: 'Balanced darkness/light',
        adventure: 'Standard hero journey style'
      },
      worldRules: {
        setting: 'Urban contemporary or custom setting'
      },
      twistMechanics: 'Standard plot twists',
      status: 'draft'
    }
  };

  // Create initial Graph structure containing only the Bible Node
  const graph = {
    nodes: [bibleNode],
    edges: []
  };

  await fs.writeFile(path.join(projectFolder, 'graph.json'), JSON.stringify(graph, null, 2), 'utf-8');
  await fs.writeFile(path.join(projectFolder, 'bible.json'), JSON.stringify(bibleNode, null, 2), 'utf-8');

  projects.push(newProject);
  await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2), 'utf-8');

  return newProject;
}

export async function updateProjectMeta(projectId: string, updates: Partial<ProjectMeta>): Promise<ProjectMeta> {
  const projects = await listProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index === -1) {
    throw new Error(`Project ${projectId} not found`);
  }

  const updated = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  projects[index] = updated;
  await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2), 'utf-8');
  return updated;
}

export async function deleteProject(projectId: string): Promise<void> {
  const projects = await listProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  await fs.writeFile(PROJECTS_JSON, JSON.stringify(filtered, null, 2), 'utf-8');

  const projectFolder = path.join(PROJECTS_DIR, projectId);
  try {
    await fs.rm(projectFolder, { recursive: true, force: true });
  } catch (err) {
    // Folder might not exist
  }
}

export async function duplicateProject(projectId: string): Promise<ProjectMeta> {
  const projects = await listProjects();
  const source = projects.find(p => p.id === projectId);
  if (!source) {
    throw new Error(`Source project ${projectId} not found`);
  }

  const newId = `proj-${uuidv4().substring(0, 8)}`;
  const duplicate: ProjectMeta = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const srcFolder = path.join(PROJECTS_DIR, projectId);
  const destFolder = path.join(PROJECTS_DIR, newId);

  await ensureDirectoryExists(destFolder);
  
  // Recursively copy project files
  await copyDirectory(srcFolder, destFolder);

  projects.push(duplicate);
  await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2), 'utf-8');
  return duplicate;
}

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

function getRandomColor(): string {
  const colors = [
    '#7c3aed', // Purple
    '#2563eb', // Blue
    '#059669', // Emerald
    '#db2777', // Pink
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#4f46e5'  // Indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
