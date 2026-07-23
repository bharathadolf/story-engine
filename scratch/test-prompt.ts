import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { assembleContext } from '../src/server/services/contextAssembler.js';

async function runTest() {
  console.log('--- STARTING PROMPT SERIALIZATION TEST ---');

  const bibleNode = {
    id: 'bible-001',
    type: 'bible',
    data: {
      title: 'The Lost Kingdom of Mayong',
      premise: 'Railway engineers awaken an ancient mystical army.',
      theme: 'History never dies',
      toneContract: { pacing: 'Fast paced', darkness: 'Grim' },
      worldRules: { setting: 'Mayong Valley' }
    }
  };

  const charNode = {
    id: 'char-kael',
    type: 'character',
    data: {
      name: 'Kaelen Sterling',
      role: 'protagonist',
      want: 'Find the ancient gold.',
      need: 'Learn that blood is sacred.'
    }
  };

  const religionNode = {
    id: 'rel-covenant',
    type: 'religion',
    data: {
      name: 'The Crimson Covenant',
      sacredText: 'The Book of Blood',
      mythology: 'Sovereign blood spilled on iron clay.',
      hierarchy: 'High Priest -> Priest',
      rituals: 'Blood offerings',
      holySymbols: 'Red spiral',
      laws: 'Do not burn blood'
    }
  };

  const magicNode = {
    id: 'mag-blood',
    type: 'magic',
    data: {
      name: 'Blood Remembrance',
      rules: 'Blood cannot lie and remembers origins.',
      consequences: 'Drains lifeforce.',
      limitations: 'Fire permanently burns it.'
    }
  };

  const locationNode = {
    id: 'loc-battlefield',
    type: 'location',
    data: {
      name: 'Mystic battlefield',
      description: 'Misty red soil with broken iron structures.',
      geography: 'Steep gorges and buried crypt entrances.'
    }
  };

  const sceneNode = {
    id: 'scene-discover',
    type: 'scene',
    data: {
      slugline: 'INT. MAYONG CRYPTS - NIGHT',
      dramaticJob: 'Kaelen spills blood on the stone door, accidentally triggering the tomb seals.',
      turn: 'Tomb seals activate when meeting Kaelen\'s royal ancestry.',
      characters: ['char-kael']
    }
  };

  const graph = {
    nodes: [bibleNode, charNode, religionNode, magicNode, locationNode, sceneNode],
    edges: [
      { id: 'e-bible-char', source: 'bible-001', target: 'char-kael' },
      { id: 'e-char-scene', source: 'char-kael', target: 'scene-discover' },
      { id: 'e-scene-loc', source: 'scene-discover', target: 'loc-battlefield' },
      { id: 'e-scene-rel', source: 'scene-discover', target: 'rel-covenant' },
      { id: 'e-scene-mag', source: 'scene-discover', target: 'mag-blood' }
    ]
  };

  try {
    const { systemPrompt, userPrompt } = await assembleContext(
      'scene-discover',
      'generate',
      null,
      graph,
      'proj-sandbox'
    );

    console.log('\n================ SYSTEM PROMPT ================');
    console.log(systemPrompt);

    console.log('\n================ USER PROMPT ================');
    console.log(userPrompt);

    // Verify sections exist
    const hasReligion = userPrompt.includes('WORLDBUILDING: RELIGION & MYTHOLOGY');
    const hasMagic = userPrompt.includes('WORLDBUILDING: MAGIC SYSTEM & LAWS');
    const hasLocation = userPrompt.includes('WORLDBUILDING: GEOGRAPHY & LOCATIONS');
    
    if (hasReligion && hasMagic && hasLocation) {
      console.log('\n[SUCCESS] All worldbuilding context correctly parsed and serialized!');
    } else {
      console.error('\n[FAILURE] Missing worldbuilding context blocks in user prompt.');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

runTest();
