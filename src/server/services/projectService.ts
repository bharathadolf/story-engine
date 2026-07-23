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

    // Ensure template project is initialized
    try {
      const data = await fs.readFile(PROJECTS_JSON, 'utf-8');
      const projects: ProjectMeta[] = JSON.parse(data);
      if (!projects.some(p => p.id === 'proj-template')) {
        const templateMeta: ProjectMeta = {
          id: 'proj-template',
          name: 'Procedural Narrative Blueprint',
          genre: 'Procedural Guide',
          logline: 'Complete connected template detailing Houdini-style procedural context flow and output data generation.',
          coverColor: '#8b5cf6', // Violet
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodeCount: 9,
          status: 'template'
        };

        const projectFolder = path.join(PROJECTS_DIR, 'proj-template');
        await ensureDirectoryExists(projectFolder);
        await ensureDirectoryExists(path.join(projectFolder, 'skills'));
        await ensureDirectoryExists(path.join(projectFolder, 'drafts'));

        const nodes = [
          {
            id: 'bible-1',
            type: 'bible',
            position: { x: 400, y: 50 },
            data: {
              title: 'Procedural Screenplay Template',
              premise: 'A blueprint mapping how storyboard nodes connect dynamically to feed parameters downstream.',
              theme: 'Procedural logic and context-guided text generation.',
              status: 'template-bible'
            }
          },
          {
            id: 'act-1',
            type: 'act',
            position: { x: 100, y: 250 },
            data: {
              actNumber: 1,
              dramaticJob: 'Establish template rules and configure compatibility boundaries.',
              status: 'draft'
            }
          },
          {
            id: 'char-1',
            type: 'character',
            position: { x: 400, y: 250 },
            data: {
              name: 'Hero Writer',
              role: 'protagonist',
              want: 'To construct narratives as a clean dependency tree.',
              need: 'To learn how nodes influence downstream screenplay parameters.',
              status: 'draft'
            }
          },
          {
            id: 'strand-1',
            type: 'strand',
            position: { x: 700, y: 250 },
            data: {
              name: 'Parallel Subplot: Graph Optimization',
              premiseSentence: 'A secondary storyline focusing on performance and layout alignment.',
              status: 'draft'
            }
          },
          {
            id: 'seq-1',
            type: 'sequence',
            position: { x: 100, y: 500 },
            data: {
              name: 'Sequence I: Designing the Flow',
              dramaticJob: 'Build a solid foundation of connected story elements.',
              status: 'draft'
            }
          },
          {
            id: 'beat-1',
            type: 'beat',
            position: { x: 400, y: 650 },
            data: {
              order: 1,
              action: 'Writer drags a line from Sequence to Draft Node.',
              reaction: 'The port turns green, demonstrating compatible data flow.',
              status: 'draft'
            }
          },
          {
            id: 'scene-1',
            type: 'scene',
            position: { x: 400, y: 850 },
            data: {
              slugline: 'INT. WRITER\'S LAB - NIGHT',
              turn: 'The compilation succeeds. The writer sees the generated screenplay appear.',
              status: 'draft'
            }
          },
          {
            id: 'question-1',
            type: 'question',
            position: { x: 200, y: 1100 },
            data: {
              promptText: 'Should the draft be generated dynamically?',
              options: ['Yes, run AI draft generation', 'No, use pre-written template text'],
              answer: 'Yes, run AI draft generation',
              affectsField: 'draft'
            }
          },
          {
            id: 'draft-1',
            type: 'draft',
            position: { x: 600, y: 1100 },
            data: {
              currentVersion: 1,
              versions: [
                {
                  versionNumber: 1,
                  text: 'FADE IN:\n\nINT. WRITER\'S LAB - NIGHT\n\nHero Writer taps the compile button. Around him, the storyboard node graph lights up in perfect emerald-green synchrony.\n\nHERO WRITER\nIt works. The connection logic propagates variables downstream, exactly like Houdini.'
                }
              ],
              locked: false
            }
          }
        ];

        const edges = [
          { id: 'e-bible-act', source: 'bible-1', target: 'act-1' },
          { id: 'e-bible-char', source: 'bible-1', target: 'char-1' },
          { id: 'e-bible-strand', source: 'bible-1', target: 'strand-1' },
          { id: 'e-act-seq', source: 'act-1', target: 'seq-1' },
          { id: 'e-strand-seq', source: 'strand-1', target: 'seq-1' },
          { id: 'e-char-beat', source: 'char-1', target: 'beat-1' },
          { id: 'e-seq-beat', source: 'seq-1', target: 'beat-1' },
          { id: 'e-beat-scene', source: 'beat-1', target: 'scene-1' },
          { id: 'e-strand-scene', source: 'strand-1', target: 'scene-1' },
          { id: 'e-char-scene', source: 'char-1', target: 'scene-1' },
          { id: 'e-seq-draft', source: 'seq-1', target: 'draft-1' },
          { id: 'e-scene-draft', source: 'scene-1', target: 'draft-1' },
          { id: 'e-scene-question', source: 'scene-1', target: 'question-1' }
        ];

        const graph = { nodes, edges };
        await fs.writeFile(path.join(projectFolder, 'graph.json'), JSON.stringify(graph, null, 2), 'utf-8');
        await fs.writeFile(path.join(projectFolder, 'bible.json'), JSON.stringify(nodes[0], null, 2), 'utf-8');

        projects.push(templateMeta);
        await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Failed to initialize template project:', err);
    }

    // Ensure test-sandbox project is initialized
    try {
      const data = await fs.readFile(PROJECTS_JSON, 'utf-8');
      const projects: ProjectMeta[] = JSON.parse(data);
      if (!projects.some(p => p.id === 'proj-test-sandbox')) {
        const testSandboxMeta: ProjectMeta = {
          id: 'proj-test-sandbox',
          name: 'Developer Testing Canvas',
          genre: 'Node Interface Development',
          logline: 'Dedicated test canvas to build, preview, and review node interfaces and properties separately.',
          coverColor: '#ef4444', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          nodeCount: 2,
          status: 'test-sandbox'
        };

        const projectFolder = path.join(PROJECTS_DIR, 'proj-test-sandbox');
        await ensureDirectoryExists(projectFolder);
        await ensureDirectoryExists(path.join(projectFolder, 'skills'));
        await ensureDirectoryExists(path.join(projectFolder, 'drafts'));

        const bibleNode = {
          id: 'bible-test-001',
          type: 'bible',
          position: { x: 250, y: 150 },
          data: {
            title: 'Test Scenario: Alpha Build',
            premise: 'Testing new character arcs and sequence nodes in isolation.',
            theme: 'Trial and error',
            toneContract: {
              pacing: 'Rapid prototyping',
              darkness: 'Muted grey values',
              adventure: 'Developer QA testing canvas'
            },
            worldRules: {
              setting: 'Port 3002 Node Testbed Server'
            },
            twistMechanics: 'Simulated prompt generation overrides',
            status: 'draft'
          }
        };

        const charNode = {
          id: 'char-test-001',
          type: 'character',
          position: { x: 600, y: 150 },
          data: {
            name: 'Test Character QA',
            role: 'Protagonist',
            want: 'To trigger test outputs cleanly.',
            need: 'To pass node validations.',
            wound: 'Corrupted JSON schema fields.',
            flaw: 'Bypasses standard verification flow.'
          }
        };

        const graph = {
          nodes: [bibleNode, charNode],
          edges: [
            { id: 'edge-test-1', source: 'bible-test-001', target: 'char-test-001', label: 'defines' }
          ]
        };

        await fs.writeFile(path.join(projectFolder, 'graph.json'), JSON.stringify(graph, null, 2), 'utf-8');
        await fs.writeFile(path.join(projectFolder, 'bible.json'), JSON.stringify(bibleNode, null, 2), 'utf-8');

        projects.push(testSandboxMeta);
        await fs.writeFile(PROJECTS_JSON, JSON.stringify(projects, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Failed to initialize developer testing canvas:', err);
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
