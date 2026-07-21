import { create } from 'zustand';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange } from '@xyflow/react';
import { defaultData } from '../utils/nodeDefaults.js';

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  projectId: string | null;
  isLoading: boolean;
  error: string | null;
  snapToGrid: boolean;
  searchQuery: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  loadGraph: (projectId: string) => Promise<void>;
  saveGraph: (overrideNodes?: Node[], overrideEdges?: Edge[]) => Promise<void>;
  addNode: (type: string, position: { x: number; y: number }, data?: any) => string;
  updateNodeData: (nodeId: string, updates: any) => void;
  deleteNode: (nodeId: string) => void;
  clearGraph: () => void;
  setSnapToGrid: (snap: boolean) => void;
  setSearchQuery: (query: string) => void;
  autoLayout: () => void;
  brainstormExpansion: (nodeId: string, onStart?: () => void, onComplete?: (numChildren: number) => void, onError?: (err: string) => void) => Promise<void>;
  brainstormingNodeId: string | null;
}

const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  projectId: null,
  isLoading: false,
  error: null,
  snapToGrid: localStorage.getItem('storyboard_snap_to_grid') === 'true',
  searchQuery: '',
  saveStatus: 'saved',
  brainstormingNodeId: null,

  setSnapToGrid: (snap) => {
    localStorage.setItem('storyboard_snap_to_grid', snap ? 'true' : 'false');
    set({ snapToGrid: snap });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  autoLayout: () => {
    set(state => {
      const nextNodes = [...state.nodes];
      
      // Separate nodes by type groups for readable swimlane columns & rows
      const bib = nextNodes.filter(n => n.type === 'bible');
      const chars = nextNodes.filter(n => n.type === 'character');
      const strands = nextNodes.filter(n => n.type === 'strand');
      const acts = nextNodes.filter(n => n.type === 'act');
      const seqs = nextNodes.filter(n => n.type === 'sequence');
      const scenes = nextNodes.filter(n => n.type === 'scene');
      const beats = nextNodes.filter(n => n.type === 'beat' || n.type === 'question');
      const drafts = nextNodes.filter(n => n.type === 'draft');

      // Main layout calculations (highly centered and symmetrical)
      // 1. Bible: Centered at the very top
      bib.forEach((n, idx) => {
        n.position = { x: (idx - (bib.length - 1) / 2) * 300, y: 50 };
      });

      // 2. Characters: Left column (offset -360)
      chars.forEach((n, idx) => {
        n.position = { x: -360, y: 150 + idx * 180 };
      });

      // 3. Strands: Right column (offset 360)
      strands.forEach((n, idx) => {
        n.position = { x: 360, y: 150 + idx * 180 };
      });

      // 4. Acts: Centered under Bible
      acts.forEach((n, idx) => {
        n.position = { x: (idx - (acts.length - 1) / 2) * 300, y: 250 };
      });

      // 5. Sequences: Centered under Acts
      seqs.forEach((n, idx) => {
        n.position = { x: (idx - (seqs.length - 1) / 2) * 300, y: 480 };
      });

      // 6. Scenes: Centered under Sequences
      scenes.forEach((n, idx) => {
        n.position = { x: (idx - (scenes.length - 1) / 2) * 300, y: 710 };
      });

      // 7. Beats/Questions: Centered under Scenes
      beats.forEach((n, idx) => {
        n.position = { x: (idx - (beats.length - 1) / 2) * 300, y: 940 };
      });

      // 8. Drafts: Centered at the very bottom
      drafts.forEach((n, idx) => {
        n.position = { x: (idx - (drafts.length - 1) / 2) * 300, y: 1170 };
      });

      get().saveGraph(nextNodes, state.edges);
      return { nodes: nextNodes };
    });
  },

  onNodesChange: (changes) => {
    set(state => {
      const nextNodes = applyNodeChanges(changes, state.nodes);
      // Auto-save on node changes (like drag end)
      const hasDragEnd = changes.some(c => c.type === 'position' && (c as any).dragging === false);
      if (hasDragEnd || changes.some(c => c.type === 'remove')) {
        get().saveGraph(nextNodes, state.edges);
      }
      return { nodes: nextNodes };
    });
  },

  onEdgesChange: (changes) => {
    set(state => {
      const nextEdges = applyEdgeChanges(changes, state.edges);
      if (changes.some(c => c.type === 'remove')) {
        get().saveGraph(state.nodes, nextEdges);
      }
      return { edges: nextEdges };
    });
  },

  onConnect: (connection) => {
    set(state => {
      const nextEdges = addEdge({ ...connection, id: `edge-${Date.now()}` }, state.edges);
      get().saveGraph(state.nodes, nextEdges);
      return { edges: nextEdges };
    });
  },

  loadGraph: async (projectId) => {
    set({ isLoading: true, error: null, projectId });
    try {
      const res = await fetch(`/api/projects/${projectId}/graph`);
      if (!res.ok) throw new Error('Failed to load project graph');
      const { nodes, edges } = await res.json();
      set({ nodes: nodes || [], edges: edges || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveGraph: async (overrideNodes, overrideEdges) => {
    const { nodes, edges, projectId } = get();
    const activeId = projectId;
    if (!activeId) return;

    set({ saveStatus: 'saving' });
    const nodesToSave = overrideNodes || nodes;
    const edgesToSave = overrideEdges || edges;

    try {
      const res = await fetch(`/api/projects/${activeId}/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: nodesToSave, edges: edgesToSave })
      });
      if (!res.ok) throw new Error('Failed to save project graph');
      set({ saveStatus: 'saved' });
    } catch (err: any) {
      console.error('Error saving graph:', err);
      set({ saveStatus: 'error' });
    }
  },

  addNode: (type, position, data = {}) => {
    const defaultFields = defaultData[type] || {};
    const newNode: Node = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      position,
      data: { ...JSON.parse(JSON.stringify(defaultFields)), ...data }
    };

    set(state => {
      const nextNodes = [...state.nodes, newNode];
      get().saveGraph(nextNodes, state.edges);
      return { nodes: nextNodes };
    });

    return newNode.id;
  },

  updateNodeData: (nodeId, updates) => {
    set(state => {
      const nextNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...updates }
          };
        }
        return node;
      });
      get().saveGraph(nextNodes, state.edges);
      return { nodes: nextNodes };
    });
  },

  deleteNode: (nodeId) => {
    set(state => {
      const nextNodes = state.nodes.filter(node => node.id !== nodeId);
      const nextEdges = state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
      get().saveGraph(nextNodes, nextEdges);
      return { nodes: nextNodes, edges: nextEdges };
    });
  },

  clearGraph: () => set({ nodes: [], edges: [], projectId: null }),

  brainstormExpansion: async (nodeId, onStart, onComplete, onError) => {
    const { nodes, edges, projectId, saveGraph } = get();
    if (!projectId) return;

    set({ brainstormingNodeId: nodeId });
    if (onStart) onStart();

    try {
      const res = await fetch(`/api/projects/${projectId}/generate/brainstorm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetNodeId: nodeId, graph: { nodes, edges } })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to request brainstorm expansion');
      }

      const { children } = await res.json();
      if (!children || children.length === 0) {
        set({ brainstormingNodeId: null });
        if (onComplete) onComplete(0);
        return;
      }

      // Find parent to position around
      const parentNode = nodes.find(n => n.id === nodeId);
      const parentPos = parentNode ? parentNode.position : { x: 0, y: 0 };

      const nextNodes = [...nodes];
      const nextEdges = [...edges];

      children.forEach((child: any, idx: number) => {
        const type = child.type || 'beat';
        const defaultFields = defaultData[type] || {};

        // Arrange in a neat arc
        const angle = (idx - (children.length - 1) / 2) * 45 * (Math.PI / 180) + (Math.PI / 2);
        const radius = 240;
        const x = parentPos.x + radius * Math.cos(angle);
        const y = parentPos.y + radius * Math.sin(angle);

        const newId = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newNode: Node = {
          id: newId,
          type,
          position: { x, y },
          data: { ...JSON.parse(JSON.stringify(defaultFields)), ...child.data }
        };

        nextNodes.push(newNode);

        // Connect
        const newEdge: Edge = {
          id: `edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          source: nodeId,
          target: newId,
          label: child.relationLabel || 'brainstormed',
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 1.5 },
          labelStyle: { fill: '#c084fc', fontSize: 8, fontWeight: 700 },
          labelBgStyle: { fill: '#0a0a0a', fillOpacity: 0.8 },
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4
        };

        nextEdges.push(newEdge);
      });

      set({ nodes: nextNodes, edges: nextEdges, brainstormingNodeId: null });
      await saveGraph(nextNodes, nextEdges);

      if (onComplete) onComplete(children.length);
    } catch (err: any) {
      set({ brainstormingNodeId: null });
      console.error('Brainstorm error:', err);
      if (onError) onError(err.message || 'Brainstorm error');
    }
  }
}));

export default useGraphStore;
