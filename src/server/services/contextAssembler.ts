import { loadSkill } from './skillLoader.js';

interface GraphNode {
  id: string;
  type: string;
  data: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function assembleContext(
  targetNodeId: string,
  callType: 'question' | 'generate' | 'department',
  department: string | null,
  graph: Graph,
  projectId: string
): Promise<{ systemPrompt: string; userPrompt: string }> {
  const { nodes, edges } = graph;

  const bibleNode = nodes.find(n => n.type === 'bible') || {
    id: 'bible-001',
    type: 'bible',
    data: { title: 'Untitled Project', premise: '', theme: '', toneContract: {}, worldRules: {} }
  };
  const targetNode = nodes.find(n => n.id === targetNodeId);
  if (!targetNode) {
    throw new Error(`Target node ${targetNodeId} not found in the graph`);
  }

  const ancestors = getAncestors(targetNodeId, nodes, edges);
  const characterNodes = getConnectedCharacters(targetNodeId, nodes, edges);

  const lockedQuestions = nodes.filter(n =>
    n.type === 'question' &&
    n.data.locked === true &&
    n.data.affectsNodeRef === targetNodeId
  );

  const skills = await loadSkillsForCall(callType, department, targetNode.type, projectId);

  const systemPrompt = buildSystemPrompt(skills, bibleNode, callType);
  const userPrompt = buildUserPrompt(
    targetNode, ancestors, characterNodes, lockedQuestions, callType, department
  );

  return { systemPrompt, userPrompt };
}

function getAncestors(nodeId: string, nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const ancestors: GraphNode[] = [];
  let currentId = nodeId;
  const visited = new Set<string>(); // Prevent infinite loops just in case

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const parentEdge = edges.find(e => e.target === currentId);
    if (!parentEdge) break;

    const parentNode = nodes.find(n => n.id === parentEdge.source);
    if (!parentNode) break;

    ancestors.unshift(parentNode);
    currentId = parentNode.id;
  }
  return ancestors;
}

function getConnectedCharacters(nodeId: string, nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node || node.type !== 'scene') return [];
  const characterIds = node.data.characters || [];
  return nodes.filter(n => n.type === 'character' && characterIds.includes(n.id));
}

async function loadSkillsForCall(
  callType: string,
  department: string | null,
  nodeType: string,
  projectId: string
): Promise<string> {
  const skillsToLoad: string[] = ['format'];

  if (callType === 'generate') {
    skillsToLoad.push('structure');
    if (['scene', 'beat', 'draft'].includes(nodeType)) {
      skillsToLoad.push('character', 'dialogue', 'tone', 'action-visual');
    }
  }

  if (callType === 'department' && department) {
    skillsToLoad.push(department);
  }

  const loaded = await Promise.all(
    skillsToLoad.map(s => loadSkill(s, projectId))
  );
  return loaded.join('\n\n---\n\n');
}

function buildSystemPrompt(skills: string, bibleNode: GraphNode, callType: string): string {
  const b = bibleNode.data || {};
  const toneLines = Object.entries(b.toneContract || {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  const worldLines = Object.entries(b.worldRules || {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  return `You are a professional screenplay writer and story developer working on "${b.title || 'Untitled Project'}".

PREMISE: ${b.premise || '(not yet defined)'}
THEME: ${b.theme || '(not yet defined)'}
TONE CONTRACT:
${toneLines || '(not yet defined)'}

WORLD / SETTING RULES:
${worldLines || '(not yet defined)'}

${callType === 'question'
  ? 'Your job is to ask the user ONE focused question to gather a missing story decision. Ask as options where possible. Never generate content — only ask. Format your output as a clean question and 3-4 options in JSON, or as text.'
  : callType === 'department'
  ? 'Your job is to run a specific department quality pass on an existing draft. Return annotated feedback and a revised version. Your response must be clean and clearly separated.'
  : 'Your job is to generate screenplay content. Follow the skills framework below exactly.'
}

--- SKILLS ---
${skills}`;
}

function buildUserPrompt(
  targetNode: GraphNode,
  ancestors: GraphNode[],
  characters: GraphNode[],
  questions: GraphNode[],
  callType: string,
  department: string | null
): string {
  const sections: string[] = [];

  if (ancestors.length > 0) {
    sections.push('## HIERARCHY CONTEXT (parent nodes, in order)');
    ancestors.forEach(node => {
      sections.push(`### ${node.type.toUpperCase()}: ${node.data.name || node.data.slugline || node.id}`);
      sections.push(JSON.stringify(node.data, null, 2));
    });
  }

  if (characters.length > 0) {
    sections.push('## CHARACTERS IN THIS SCENE');
    characters.forEach(char => {
      sections.push(`### ${char.data.name || 'Unnamed Character'}`);
      sections.push(`Want: ${char.data.want || 'Unknown'}`);
      sections.push(`Need: ${char.data.need || 'Unknown'}`);
      sections.push(`Wound: ${char.data.wound || 'Unknown'}`);
      sections.push(`Flaw: ${char.data.flaw || 'Unknown'}`);
    });
  }

  if (questions.length > 0) {
    sections.push('## DECISIONS ALREADY MADE (locked question answers)');
    questions.forEach(q => {
      sections.push(`Q: ${q.data.promptText}`);
      sections.push(`A: ${q.data.answer}`);
    });
  }

  sections.push(`## TARGET NODE (${targetNode.type.toUpperCase()}) — generate content for this`);
  sections.push(JSON.stringify(targetNode.data, null, 2));

  if (callType === 'question') {
    sections.push(`## YOUR TASK
Identify the most important missing decision for this ${targetNode.type} node and ask the user ONE focused question about it. Give 3-4 options as multiple choice where possible. Do not generate any screenplay content.
Format your output as a JSON object:
{
  "promptText": "What is the focused question?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "affectsField": "the name of the field this decision affects, e.g. slugline, turn, dramaticJob"
}`);
  } else if (callType === 'generate') {
    sections.push(`## YOUR TASK
Generate the appropriate content for this ${targetNode.type} node based on all context above. Follow all skills frameworks.
If this is a DraftNode or SceneNode, generate standard screenplay format (Sluglines, Action paragraphs, Dialogue blocks, parentheticals). Make it complete, full, and detailed (typically 1 to 2 pages of screenplay style). Do not summarize.`);
  } else if (callType === 'department' && department) {
    sections.push(`## YOUR TASK — ${department.toUpperCase()} DEPARTMENT PASS
Review the current draft against the "${department}" skill framework. 
Provide:
1. Specific feedback (strengths, issues, suggestions).
2. A revised version of the screenplay text addressing those issues.

Format your output clearly with markers:
[ANNOTATIONS]
(Your feedback and review)
[/ANNOTATIONS]

[REVISED_DRAFT]
(The revised screenplay text only)
[/REVISED_DRAFT]`);
  }

  return sections.join('\n\n');
}
