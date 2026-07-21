import { GoogleGenAI, Type } from '@google/genai';
import { assembleContext } from './contextAssembler.js';

// Lazily initialize to avoid crashing on start if key is temporarily missing
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const MODEL = 'gemini-3.5-flash';

export async function questionCall(targetNodeId: string, graph: any, projectId: string): Promise<string> {
  const ai = getAI();
  const { systemPrompt, userPrompt } = await assembleContext(
    targetNodeId, 'question', null, graph, projectId
  );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.3,
    },
  });

  return response.text || '';
}

export async function generateCall(targetNodeId: string, graph: any, projectId: string): Promise<string> {
  const ai = getAI();
  const { systemPrompt, userPrompt } = await assembleContext(
    targetNodeId, 'generate', null, graph, projectId
  );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  return response.text || '';
}

export async function departmentCall(targetNodeId: string, department: string, graph: any, projectId: string): Promise<string> {
  const ai = getAI();
  const { systemPrompt, userPrompt } = await assembleContext(
    targetNodeId, 'department', department, graph, projectId
  );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.3, // Lower temperature for analytical and quality-assurance department passes
    },
  });

  return response.text || '';
}

export async function brainstormCall(targetNodeId: string, graph: any, projectId: string): Promise<any[]> {
  const ai = getAI();
  const { systemPrompt, userPrompt } = await assembleContext(
    targetNodeId, 'generate', null, graph, projectId
  );

  const targetNode = graph.nodes.find((n: any) => n.id === targetNodeId);
  const targetType = targetNode ? targetNode.type : 'unknown';

  const brainstormSystemPrompt = `${systemPrompt}
  
Your job is to act as a master story-development partner. Brainstorm 2 to 4 creative, specific child nodes to expand the current story element (${targetType.toUpperCase()}).
Depending on the parent node, suggest appropriate child elements:
- If parent is a Story Bible: suggest key Characters, Strands, or Acts.
- If parent is a Character: suggest critical Scenes they appear in, subplots/Strands, or Questions/Decisions they must resolve.
- If parent is a Strand: suggest specific Acts, Characters, or Scenes.
- If parent is an Act: suggest crucial Sequences or Scenes.
- If parent is a Sequence: suggest dramatic Scenes.
- If parent is a Scene: suggest detailed Beats or dramatic Decision/Question nodes.
- If parent is a Beat: suggest sequential dramatic Beats or dramatic Decision/Question nodes.

Return a JSON object containing a list of brainstormed child nodes. For each child node, provide its type, a short relation label (explaining how it connects to the parent), and a rich set of data fields appropriate to that node type. Ensure the data is highly specific and directly expands on the parent node's content.`;

  const brainstormUserPrompt = `${userPrompt}

## BRAINSTORM INSTRUCTION
Brainstorm 2 to 4 children to connect and expand from the target node ${targetNodeId} of type ${targetType}. Return the children in the requested JSON schema structure.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: brainstormUserPrompt,
    config: {
      systemInstruction: brainstormSystemPrompt,
      temperature: 0.8,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["children"],
        properties: {
          children: {
            type: Type.ARRAY,
            description: "List of brainstormed child nodes",
            items: {
              type: Type.OBJECT,
              required: ["type", "relationLabel", "data"],
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Node type: character, strand, act, sequence, scene, beat, question"
                },
                relationLabel: {
                  type: Type.STRING,
                  description: "Relationship label (e.g., 'Antagonist', 'Climax Sequence', 'Decision Dilemma')"
                },
                data: {
                  type: Type.OBJECT,
                  description: "Initial data properties appropriate for the node type (e.g. name, role for character; slugline, dramaticJob for scene; promptText, options, affectsField for question)"
                }
              }
            }
          }
        }
      }
    },
  });

  const text = response.text || '{"children": []}';
  try {
    const parsed = JSON.parse(text);
    return parsed.children || [];
  } catch (e) {
    console.error("Failed to parse Gemini brainstorm response:", text, e);
    return [];
  }
}
