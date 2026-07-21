import { create } from 'zustand';

export interface ConnectingHandleState {
  nodeId: string;
  handleType: 'source' | 'target';
  nodeType: string;
}

export const COMPATIBILITY_RULES: Record<string, string[]> = {
  bible: ['act', 'character', 'strand'],
  character: ['scene', 'beat'],
  act: ['sequence'],
  sequence: ['beat'],
  beat: ['scene'],
  scene: ['draft', 'question'],
  strand: ['sequence', 'scene'],
  draft: [],
  question: []
};

export function isHandleCompatible(
  connecting: ConnectingHandleState,
  candidateNodeId: string,
  candidateNodeType: string,
  candidateHandleType: 'source' | 'target'
): boolean {
  if (connecting.nodeId === candidateNodeId) return false;
  if (connecting.handleType === candidateHandleType) return false; // Must connect source to target or target to source

  const sourceNodeType = connecting.handleType === 'source' ? connecting.nodeType : candidateNodeType;
  const targetNodeType = connecting.handleType === 'target' ? connecting.nodeType : candidateNodeType;

  const allowedTargets = COMPATIBILITY_RULES[sourceNodeType];
  return !!allowedTargets?.includes(targetNodeType);
}

interface SidebarState {
  selectedNodeId: string | null;
  selectedNodeType: string | null;
  isOpen: boolean;
  isRulesOpen: boolean;
  connectingHandle: ConnectingHandleState | null;
  openInspector: (nodeId: string, nodeType: string) => void;
  closeInspector: () => void;
  toggleRules: () => void;
  setConnectingHandle: (handle: ConnectingHandleState | null) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  selectedNodeId: null,
  selectedNodeType: null,
  isOpen: false,
  isRulesOpen: false,
  connectingHandle: null,

  openInspector: (nodeId, nodeType) => set({
    selectedNodeId: nodeId,
    selectedNodeType: nodeType,
    isOpen: true,
    isRulesOpen: false
  }),

  closeInspector: () => set({
    selectedNodeId: null,
    selectedNodeType: null,
    isOpen: false
  }),

  toggleRules: () => set((state) => ({
    isRulesOpen: !state.isRulesOpen,
    isOpen: false
  })),

  setConnectingHandle: (handle) => set({
    connectingHandle: handle
  })
}));

export default useSidebarStore;
