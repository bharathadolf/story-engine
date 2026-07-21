import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local and .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { assembleContext } from '../src/server/services/contextAssembler.js';
import { generateCall, brainstormCall, questionCall, departmentCall } from '../src/server/services/geminiService.js';

async function run() {
  const args = process.argv.slice(2);
  const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'character';
  const opArg = args.find(a => a.startsWith('--op='))?.split('=')[1] || 'generate';
  const deptArg = args.find(a => a.startsWith('--dept='))?.split('=')[1] || '';

  console.log(`\n=== Story Engine CLI Test Node Bench ===`);
  console.log(`Target Node Type : ${typeArg}`);
  console.log(`Operation        : ${opArg}`);
  if (deptArg) {
    console.log(`Department Pass  : ${deptArg}`);
  }

  // 1. Verify API Key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.error(`\n[ERROR] GEMINI_API_KEY is not set. Please create a .env.local file in story-engine folder with:`);
    console.error(`GEMINI_API_KEY="your-api-key-here"\n`);
    process.exit(1);
  }

  // 2. Setup mock graph matching the requested target type
  const bibleNode = {
    id: 'bible-001',
    type: 'bible',
    data: {
      title: 'Iron Horizon',
      premise: 'In a resource-scarce future, a robotic miner discovers an ancient organic seed.',
      theme: 'Hope amidst mechanical decay',
      toneContract: { pacing: 'Slow-burn thriller', darkness: 'Gritty sci-fi' },
      worldRules: { setting: 'Asteroid mining station Vesta-4' }
    }
  };

  const charNode = {
    id: 'char-001',
    type: 'character',
    data: {
      name: 'Kaelen',
      role: 'Protagonist',
      want: 'To secure enough water credits to buy passage home.',
      need: 'To recognize that life is worth more than survival.',
      wound: 'Left behind by his crew during a tunnel collapse.',
      flaw: 'Extremely distrustful of others.'
    }
  };

  const sceneNode = {
    id: 'scene-001',
    type: 'scene',
    data: {
      slugline: 'INT. VESTA-4 - MINING SHAFT - NIGHT',
      location: 'Mining Shaft',
      time: 'Night',
      dramaticJob: 'Kaelen finds the artifact and decides to hide it from the drone.',
      turn: 'From routine labor to world-changing discovery.',
      characters: ['char-001']
    }
  };

  const beatNode = {
    id: 'beat-001',
    type: 'beat',
    data: {
      headline: 'The Drill Strikes Organic Matter',
      action: 'Kaelen shuts down the drill as green bioluminescence leaks from the rock.',
      reaction: 'He stares in disbelief, checking his suit sensors for gas leaks.',
      shift: 'Curiosity replaces fear.'
    }
  };

  const graph = {
    nodes: [bibleNode, charNode, sceneNode, beatNode],
    edges: [
      { id: 'e1', source: 'bible-001', target: 'char-001' },
      { id: 'e2', source: 'bible-001', target: 'scene-001' },
      { id: 'e3', source: 'scene-001', target: 'beat-001' }
    ]
  };

  // Determine targetNodeId
  let targetNodeId = 'char-001';
  if (typeArg === 'bible') targetNodeId = 'bible-001';
  if (typeArg === 'scene') targetNodeId = 'scene-001';
  if (typeArg === 'beat') targetNodeId = 'beat-001';

  console.log(`Target Node ID   : ${targetNodeId}`);

  try {
    // 3. Assemble the prompt context
    console.log(`\n--- Assembling Context Prompts ---`);
    const { systemPrompt, userPrompt } = await assembleContext(
      targetNodeId,
      opArg === 'brainstorm' ? 'generate' : (opArg as any),
      deptArg || null,
      graph,
      'proj-sandbox'
    );

    console.log(`\n[SYSTEM INSTRUCTION]\n${systemPrompt}`);
    console.log(`\n[USER CONTEXT]\n${userPrompt}`);

    // 4. Trigger Gemini Call
    console.log(`\n--- Executing Gemini API Call (gemini-3.5-flash) ---`);
    let result: any = null;

    if (opArg === 'generate') {
      result = await generateCall(targetNodeId, graph, 'proj-sandbox');
    } else if (opArg === 'brainstorm') {
      result = await brainstormCall(targetNodeId, graph, 'proj-sandbox');
    } else if (opArg === 'question') {
      result = await questionCall(targetNodeId, graph, 'proj-sandbox');
    } else if (opArg === 'department') {
      if (!deptArg) {
        console.error('[ERROR] Department name is required for department pass (--dept=dialogue)');
        process.exit(1);
      }
      result = await departmentCall(targetNodeId, deptArg, graph, 'proj-sandbox');
    } else {
      console.error(`[ERROR] Unknown operation: ${opArg}`);
      process.exit(1);
    }

    console.log(`\n[GEMINI RESPONSE]`);
    if (typeof result === 'string') {
      console.log(result);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    console.log(`\n========================================\n`);

  } catch (err: any) {
    console.error(`\n[API RUN ERROR]:`, err.message);
    process.exit(1);
  }
}

run();
