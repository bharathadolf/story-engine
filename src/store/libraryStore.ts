import { create } from 'zustand';

export interface NodeTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  data: any;
  createdAt: string;
}

interface LibraryState {
  templates: NodeTemplate[];
  loadTemplates: () => void;
  saveTemplate: (name: string, type: string, description: string, data: any) => void;
  deleteTemplate: (id: string) => void;
}

const DEFAULT_TEMPLATES: NodeTemplate[] = [
  {
    id: 'tpl-hero-protagonist',
    name: 'Classic Protagonist (Hero)',
    type: 'character',
    description: 'Pre-configured character template optimized for a traditional hero archetype.',
    createdAt: new Date().toISOString(),
    data: {
      name: 'Hero Protagonist',
      role: 'protagonist',
      archetype: 'Hero',
      description: 'The central driving force of the story, carrying a deep moral wound but possessing high integrity.',
      want: 'To restore balance and protect their community from imminent threat.',
      need: 'To learn humility, embrace collaboration, and let go of individualistic burdens.',
      wound: 'The loss of a mentor/parent due to their own past inaction.',
      flaw: 'Stubborn self-reliance and fear of vulnerability.',
      objective: 'Overcome the antagonist and complete their inner transformation.'
    }
  },
  {
    id: 'tpl-shadow-antagonist',
    name: 'Shadow Antagonist',
    type: 'character',
    description: 'Pre-configured villain or foil node reflecting negative traits of the hero.',
    createdAt: new Date().toISOString(),
    data: {
      name: 'The Antagonist',
      role: 'antagonist',
      archetype: 'Shadow',
      description: 'The main adversarial force who challenges the protagonist physically and ideologically.',
      want: 'To reshape the environment to their own absolute control.',
      need: 'To recognize the self-destructive nature of their obsession (which they will fail to do).',
      wound: 'Betrayal by the institution they once served faithfully.',
      flaw: 'Cynical ruthlessness and absolute refusal to trust anyone.',
      objective: 'Secure total power and break the protagonist’s spirit.'
    }
  },
  {
    id: 'tpl-inciting-scene',
    name: 'Inciting Incident Scene',
    type: 'scene',
    description: 'A pre-filled scene template optimized to disrupt the protagonist’s ordinary world.',
    createdAt: new Date().toISOString(),
    data: {
      slugline: 'INT. HERO HOME - NIGHT',
      turn: 'The disruption of the status quo: A sudden message or intrusion breaks the peace, leaving no path backward.',
      dramaticJob: 'Force the protagonist out of their comfort zone and present the core call to adventure.',
      strandRef: 'Main Plot',
      characters: [],
      departmentsPassed: []
    }
  },
  {
    id: 'tpl-climax-scene',
    name: 'Climax Confrontation Scene',
    type: 'scene',
    description: 'High-stakes scene template where wants and needs collide in the final showdown.',
    createdAt: new Date().toISOString(),
    data: {
      slugline: 'EXT. THE SUMMIT - DAWN',
      turn: 'The ultimate climax: High action and final confrontation, resolving the core structural want.',
      dramaticJob: 'Bring the protagonist’s want and need to their peak collision; force the final choice.',
      strandRef: 'Main Plot',
      characters: [],
      departmentsPassed: []
    }
  },
  {
    id: 'tpl-action-beat',
    name: 'High-Tension Action Beat',
    type: 'beat',
    description: 'An action-driven narrative beat to build momentum and raise stakes.',
    createdAt: new Date().toISOString(),
    data: {
      order: 1,
      type: 'Action',
      headline: 'A Sudden Threat Appears',
      action: 'An unexpected complication occurs, forcing immediate physical or conversational reaction.',
      reaction: 'The protagonist reacts on instinct, revealing their primary behavioral flaw.',
      shift: 'From passive safety to active panic; stakes are doubled.'
    }
  }
];

export const useLibraryStore = create<LibraryState>((set) => ({
  templates: [],

  loadTemplates: () => {
    const stored = localStorage.getItem('storyboard_custom_templates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Combine user templates with default ones to ensure they always have awesome samples
        const merged = [...DEFAULT_TEMPLATES, ...parsed.filter((p: any) => !DEFAULT_TEMPLATES.some(d => d.id === p.id))];
        set({ templates: merged });
      } catch (err) {
        console.error('Error parsing stored templates, falling back to defaults:', err);
        set({ templates: DEFAULT_TEMPLATES });
      }
    } else {
      // First run, save defaults
      localStorage.setItem('storyboard_custom_templates', JSON.stringify([]));
      set({ templates: DEFAULT_TEMPLATES });
    }
  },

  saveTemplate: (name, type, description, data) => {
    const stored = localStorage.getItem('storyboard_custom_templates');
    let customList: NodeTemplate[] = [];
    if (stored) {
      try {
        customList = JSON.parse(stored);
      } catch {
        customList = [];
      }
    }

    const newTemplate: NodeTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name,
      type,
      description: description || `Saved ${type} block template configuration.`,
      createdAt: new Date().toISOString(),
      // Deep clone data to avoid reference leaks
      data: JSON.parse(JSON.stringify(data))
    };

    const updatedCustomList = [newTemplate, ...customList];
    localStorage.setItem('storyboard_custom_templates', JSON.stringify(updatedCustomList));

    set({ templates: [newTemplate, ...useLibraryStore.getState().templates] });
  },

  deleteTemplate: (id) => {
    // Cannot delete default built-in templates
    if (DEFAULT_TEMPLATES.some(d => d.id === id)) {
      alert('Built-in system templates cannot be deleted.');
      return;
    }

    const stored = localStorage.getItem('storyboard_custom_templates');
    let customList: NodeTemplate[] = [];
    if (stored) {
      try {
        customList = JSON.parse(stored);
      } catch {
        customList = [];
      }
    }

    const updatedCustomList = customList.filter(t => t.id !== id);
    localStorage.setItem('storyboard_custom_templates', JSON.stringify(updatedCustomList));

    set({ templates: useLibraryStore.getState().templates.filter(t => t.id !== id) });
  }
}));
