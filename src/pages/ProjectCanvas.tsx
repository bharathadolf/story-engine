import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import useGraphStore from '../store/graphStore.js';
import useSidebarStore from '../store/sidebarStore.js';
import Canvas from '../components/Canvas.js';
import Toolbar from '../components/Toolbar.js';
import Sidebar from '../components/Sidebar.js';
import NodeLibraryDrawer from '../components/NodeLibraryDrawer.js';
import DiagnosticPanel from '../components/DiagnosticPanel.js';
import BreadcrumbTrail from '../components/BreadcrumbTrail.js';
import SkillEditor from '../components/SkillEditor.js';
import { BookOpen, X, ArrowLeft, Plus, Layout, Info, Save } from 'lucide-react';

interface ProjectCanvasProps {
  projectId: string;
  onBackToDashboard: () => void;
}

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'delete' | 'info';
}

export default function ProjectCanvas({ projectId, onBackToDashboard }: ProjectCanvasProps) {
  const { loadGraph, saveGraph, isLoading, nodes, edges, autoLayout } = useGraphStore();
  const { isOpen, isRulesOpen, toggleRules, closeInspector } = useSidebarStore();
  const [isReady, setIsReady] = useState(false);
  
  // Custom states for the template library & toast overlay
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'delete' | 'info') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const initGraph = async () => {
      closeInspector(); // Clear any previous selected node states
      setIsReady(false);
      try {
        await loadGraph(projectId);
        setIsReady(true);
      } catch (err) {
        console.error('Error loading graph:', err);
      }
    };
    initGraph();
  }, [projectId]);

  if (!isReady || isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-[#F5F5F5] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-900 border-t-zinc-300 animate-spin" />
        </div>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.25em] animate-pulse">
          Reconstituting Storyboard...
        </p>
      </div>
    );
  }

  if (projectId === 'proj-sandbox') {
    return (
      <ReactFlowProvider>
        <div className="w-screen h-screen overflow-hidden bg-[#0A0A0A] relative flex flex-row">
          <div className="flex-1 h-full overflow-hidden relative">
            <Canvas />
          </div>

          {/* Sidebar Inspector Drawer */}
          <div className={`transition-all duration-300 ease-in-out h-full ${
            isOpen ? 'w-[480px] opacity-100 border-l border-zinc-900' : 'w-0 opacity-0 pointer-events-none'
          } shrink-0 overflow-hidden`}>
            <div className="w-[480px] h-full">
              <Sidebar />
            </div>
          </div>

          {/* Narrative Rules Dialog Popover */}
          {isRulesOpen && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
                <button
                  onClick={() => useSidebarStore.setState({ isRulesOpen: false })}
                  className="absolute top-4 right-4 p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer z-50"
                  title="Close Rules"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3.5 mb-4 shrink-0">
                  <div className="p-2 bg-purple-950/40 text-purple-400 border border-purple-900/30 rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Narrative Steering Rules</h2>
                    <p className="text-[10px] text-zinc-500">Configure AI generation constraints and structural guidelines</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 pr-1">
                  <SkillEditor projectId={projectId} />
                </div>
              </div>
            </div>
          )}

          {/* Node Library Drawer Overlay in Sandbox */}
          <NodeLibraryDrawer 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            addToast={(text) => console.log(text)}
          />

          {/* FLOATING MAC DOCK (CANVAS EDITION) */}
          <div className="mac-dock">
            {/* 1. Dashboard (Back to Home) */}
            <button 
              onClick={onBackToDashboard}
              className="mac-dock-item"
              title="Return to Dashboard"
            >
              <ArrowLeft size={20} className="text-zinc-300 shrink-0" />
              <span className="mac-dock-tooltip">Dashboard</span>
            </button>

            {/* 2. Presets Library */}
            <button 
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              className="mac-dock-item"
              title="Add Screenplay Blocks"
            >
              <Plus size={20} className="text-purple-400 shrink-0" />
              <span className="mac-dock-tooltip text-purple-400">Add Blocks</span>
            </button>

            {/* 3. Auto Layout */}
            <button 
              onClick={autoLayout}
              className="mac-dock-item"
              title="Auto-Layout Canvas"
            >
              <Layout size={20} className="text-blue-400 shrink-0" />
              <span className="mac-dock-tooltip text-blue-400">Layout</span>
            </button>

            {/* 4. Narrative Rules */}
            <button 
              onClick={toggleRules}
              className="mac-dock-item"
              title="AI Steering Rules (R)"
            >
              <BookOpen size={20} className="text-pink-400 shrink-0" />
              <span className="mac-dock-tooltip text-pink-400">Rules</span>
            </button>

            {/* 5. Properties Inspector */}
            <button 
              onClick={() => useSidebarStore.setState({ isOpen: !isOpen })}
              className="mac-dock-item"
              title="Properties Inspector (I)"
            >
              <Info size={20} className="text-amber-400 shrink-0" />
              <span className="mac-dock-tooltip text-amber-400">Inspector</span>
            </button>

            {/* 6. Save Graph */}
            <button 
              onClick={() => saveGraph(nodes, edges)}
              className="mac-dock-item"
              title="Save Screenplay Board"
            >
              <Save size={20} className="text-emerald-400 shrink-0" />
              <span className="mac-dock-tooltip text-emerald-400">Save</span>
            </button>
          </div>
        </div>
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#0A0A0A] font-sans relative">
        
        {/* Dynamic Header Toolbar Controls */}
        <Toolbar 
          onBackToDashboard={onBackToDashboard} 
          isLibraryOpen={isLibraryOpen}
          onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
          isRulesOpen={isRulesOpen}
          onToggleRules={toggleRules}
        />

        {/* Hierarchy Breadcrumb Navigation Trail */}
        <BreadcrumbTrail />

        {/* Main Workspace Stage */}
        <div className="flex-1 flex flex-row relative overflow-hidden">
          
          {/* Custom Node Library Drawer Overlay */}
          <NodeLibraryDrawer 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            addToast={addToast}
          />

          {/* Core Canvas Board with Graph Diagnostics Overlay */}
          <div className="flex-1 h-full overflow-hidden relative">
            <Canvas />
            
            {/* Real-time Diagnostics HUD */}
            <DiagnosticPanel />
          </div>

          {/* Sidebar Inspector Drawer */}
          <div className={`transition-all duration-300 ease-in-out h-full ${
            isOpen ? 'w-[480px] opacity-100 border-l border-zinc-900' : 'w-0 opacity-0 pointer-events-none'
          } shrink-0 overflow-hidden`}>
            <div className="w-[480px] h-full">
              <Sidebar />
            </div>
          </div>

        </div>

        {/* Narrative Rules Dialog Popover */}
        {isRulesOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
              <button
                onClick={() => useSidebarStore.setState({ isRulesOpen: false })}
                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer z-50"
                title="Close Rules"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3.5 mb-4 shrink-0">
                <div className="p-2 bg-purple-950/40 text-purple-400 border border-purple-900/30 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Narrative Steering Rules</h2>
                  <p className="text-[10px] text-zinc-500">Configure AI generation constraints and structural guidelines</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 pr-1">
                <SkillEditor projectId={projectId} />
              </div>
            </div>
          </div>
        )}

        {/* FLOATING MAC DOCK (CANVAS EDITION) */}
        <div className="mac-dock">
          {/* 1. Dashboard (Back to Home) */}
          <button 
            onClick={onBackToDashboard}
            className="mac-dock-item"
            title="Return to Dashboard"
          >
            <ArrowLeft size={20} className="text-zinc-300 shrink-0" />
            <span className="mac-dock-tooltip">Dashboard</span>
          </button>

          {/* 2. Presets Library */}
          <button 
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="mac-dock-item"
            title="Add Screenplay Blocks"
          >
            <Plus size={20} className="text-purple-400 shrink-0" />
            <span className="mac-dock-tooltip text-purple-400">Add Blocks</span>
          </button>

          {/* 3. Auto Layout */}
          <button 
            onClick={autoLayout}
            className="mac-dock-item"
            title="Auto-Layout Canvas"
          >
            <Layout size={20} className="text-blue-400 shrink-0" />
            <span className="mac-dock-tooltip text-blue-400">Layout</span>
          </button>

          {/* 4. Narrative Rules */}
          <button 
            onClick={toggleRules}
            className="mac-dock-item"
            title="AI Steering Rules (R)"
          >
            <BookOpen size={20} className="text-pink-400 shrink-0" />
            <span className="mac-dock-tooltip text-pink-400">Rules</span>
          </button>

          {/* 5. Properties Inspector */}
          <button 
            onClick={() => useSidebarStore.setState({ isOpen: !isOpen })}
            className="mac-dock-item"
            title="Properties Inspector (I)"
          >
            <Info size={20} className="text-amber-400 shrink-0" />
            <span className="mac-dock-tooltip text-amber-400">Inspector</span>
          </button>

          {/* 6. Save Graph */}
          <button 
            onClick={() => saveGraph(nodes, edges)}
            className="mac-dock-item"
            title="Save Screenplay Board"
          >
            <Save size={20} className="text-emerald-400 shrink-0" />
            <span className="mac-dock-tooltip text-emerald-400">Save</span>
          </button>
        </div>

        {/* Toast Notifier Overlay */}
        <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-right-5 fade-in duration-300 ${
                t.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-900/60 text-emerald-200' 
                  : t.type === 'delete'
                  ? 'bg-red-950/90 border-red-900/60 text-red-200'
                  : 'bg-[#09090b]/90 border-zinc-900 text-zinc-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${t.type === 'success' ? 'bg-emerald-400' : t.type === 'delete' ? 'bg-red-400' : 'bg-purple-400'}`} />
              <span>{t.text}</span>
            </div>
          ))}
        </div>

      </div>
    </ReactFlowProvider>
  );
}
