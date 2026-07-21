import { create } from 'zustand';

interface SidebarState {
  selectedNodeId: string | null;
  selectedNodeType: string | null;
  isOpen: boolean;
  isRulesOpen: boolean;
  openInspector: (nodeId: string, nodeType: string) => void;
  closeInspector: () => void;
  toggleRules: () => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  selectedNodeId: null,
  selectedNodeType: null,
  isOpen: false,
  isRulesOpen: false,

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
  }))
}));

export default useSidebarStore;
