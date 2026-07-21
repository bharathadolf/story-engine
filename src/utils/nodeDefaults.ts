export const defaultData: Record<string, any> = {
  bible: {
    title: 'New Screenplay Project',
    premise: '',
    theme: '',
    toneContract: {
      pacing: 'Moderate pacing',
      darkness: 'Balanced light & darkness',
      adventure: 'Dramatic hero journey style'
    },
    worldRules: {
      setting: 'Contemporary real world'
    },
    twistMechanics: '',
    status: 'draft'
  },
  character: {
    name: 'New Character',
    role: 'protagonist', // protagonist | antagonist | supporting
    strand: '',
    want: '',
    need: '',
    wound: '',
    flaw: '',
    arcSummary: '',
    appearsInScenes: [],
    status: 'draft'
  },
  strand: {
    name: 'Main Storyline',
    genre: '',
    timePeriod: '',
    protagonistRef: '',
    premiseSentence: '',
    convergenceRole: '',
    status: 'draft'
  },
  act: {
    strandRef: null,
    actNumber: 1,
    dramaticJob: 'Set up the world and trigger the main conflict',
    openingState: '',
    closingState: '',
    turn: '',
    protagonistPosition: '',
    status: 'draft'
  },
  sequence: {
    actRef: '',
    name: 'New Sequence',
    episodeRef: null,
    dramaticJob: '',
    miniClimax: '',
    runtimeMins: 10,
    seedPlanted: '',
    status: 'draft'
  },
  scene: {
    sequenceRef: '',
    slugline: 'INT. NEW LOCATION - DAY',
    characters: [], // Array of character node IDs
    enteringState: '',
    exitingState: '',
    turn: '',
    dramaticJob: '',
    seedPlanted: '',
    runtimeMins: 3,
    departmentsPassed: [], // List of departments passed
    draftRef: null,
    status: 'draft'
  },
  beat: {
    sceneRef: '',
    order: 1,
    action: '',
    reaction: '',
    shift: '',
    notes: '',
    status: 'draft'
  },
  question: {
    promptText: '',
    options: [],
    answer: null,
    answeredAt: null,
    locked: false,
    affectsNodeRef: '',
    affectsField: '',
    blocksGenerate: true
  },
  draft: {
    sceneRef: '',
    versions: [
      {
        versionNumber: 1,
        text: '',
        generatedAt: '',
        departmentsRun: []
      }
    ],
    currentVersion: 1,
    departmentAnnotations: {}, // e.g. { dialogue: "Annotations feedback" }
    locked: false,
    exportReady: false
  }
};

export const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  draft: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
  locked: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  review: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  completed: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' }
};

export const nodeTypesList = [
  { type: 'bible', label: 'Story Bible', color: 'bg-purple-600', textColor: 'text-purple-600', desc: 'Core world premise & tone settings' },
  { type: 'character', label: 'Character', color: 'bg-rose-500', textColor: 'text-rose-500', desc: 'Character backstory, wants & flaws' },
  { type: 'strand', label: 'Strand / Subplot', color: 'bg-teal-500', textColor: 'text-teal-500', desc: 'Narrative subplot line' },
  { type: 'act', label: 'Act', color: 'bg-blue-600', textColor: 'text-blue-600', desc: 'Dramatic acts (Act 1, 2, 3...)' },
  { type: 'sequence', label: 'Sequence', color: 'bg-sky-500', textColor: 'text-sky-500', desc: 'A group of scenes forming a mini-arc' },
  { type: 'scene', label: 'Scene', color: 'bg-amber-500', textColor: 'text-amber-500', desc: 'The fundamental building block of a script' },
  { type: 'beat', label: 'Beat', color: 'bg-indigo-500', textColor: 'text-indigo-500', desc: 'Individual narrative beats within a scene' },
  { type: 'question', label: 'Question / Decision', color: 'bg-pink-500', textColor: 'text-pink-500', desc: 'Decision node to resolve plot paths' },
  { type: 'draft', label: 'Screenplay Draft', color: 'bg-slate-600', textColor: 'text-slate-600', desc: 'Screenplay text and revision drafts' }
];
