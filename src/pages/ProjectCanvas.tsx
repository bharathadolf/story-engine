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
  const [rulesActiveTab, setRulesActiveTab] = useState<'rules' | 'compatibility'>('rules');

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
                    <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Rules & Compatibility Center</h2>
                    <p className="text-[10px] text-zinc-500">Configure AI generation steering prompts and check node compatibility matrix</p>
                  </div>
                </div>

                {/* Tab Swapper */}
                <div className="flex border-b border-zinc-900/60 pb-1.5 gap-4 mb-4 shrink-0">
                  <button
                    onClick={() => setRulesActiveTab('rules')}
                    className={`text-[10px] uppercase tracking-wider pb-2 border-b-2 transition font-bold cursor-pointer ${
                      rulesActiveTab === 'rules'
                        ? 'border-purple-500 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    AI Steering Guidelines
                  </button>
                  <button
                    onClick={() => setRulesActiveTab('compatibility')}
                    className={`text-[10px] uppercase tracking-wider pb-2 border-b-2 transition font-bold cursor-pointer ${
                      rulesActiveTab === 'compatibility'
                        ? 'border-purple-500 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Node Connection Schema
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                  {rulesActiveTab === 'rules' ? (
                    <SkillEditor projectId={projectId} />
                  ) : (
                    <div className="space-y-4 text-xs text-zinc-300 leading-relaxed font-light">
                      {/* Compatibility Visual Diagram Grid */}
                      <div className="bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-xl space-y-1">
                        <h4 className="font-semibold text-zinc-200">How Node Connections Flow:</h4>
                        <p className="text-[10.5px] text-zinc-400">
                          Link output handles (bottom port) to compatible input handles (top port). Establishing correct connection paths establishes the context hierarchy for draft compiler prompts.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {[
                          {
                            name: 'Story Bible',
                            color: 'text-purple-400 border-purple-900/40',
                            inputs: 'None (Absolute Root)',
                            outputs: 'Act, Character, Subplot Strand',
                            desc: 'Holds core logline, setting, and story premise.'
                          },
                          {
                            name: 'Character',
                            color: 'text-rose-400 border-rose-900/40',
                            inputs: 'Story Bible',
                            outputs: 'Scene, Beat',
                            desc: 'Maps character flaws and wants to narrative events.'
                          },
                          {
                            name: 'Subplot Strand',
                            color: 'text-teal-400 border-teal-900/40',
                            inputs: 'Story Bible',
                            outputs: 'Sequence, Scene',
                            desc: 'Defines B-Story, thematic subplots, and dynamics.'
                          },
                          {
                            name: 'Act',
                            color: 'text-blue-400 border-blue-900/40',
                            inputs: 'Story Bible',
                            outputs: 'Sequence',
                            desc: 'Major plot segments (Setup, Confrontation, Resolution).'
                          },
                          {
                            name: 'Sequence',
                            color: 'text-sky-400 border-sky-900/40',
                            inputs: 'Act, Subplot Strand',
                            outputs: 'Beat, Screenplay Draft',
                            desc: 'Multi-scene blocks driving specific narrative tasks.'
                          },
                          {
                            name: 'Beat',
                            color: 'text-indigo-400 border-indigo-900/40',
                            inputs: 'Sequence, Character',
                            outputs: 'Scene',
                            desc: 'Specific emotional shift or action/reaction step.'
                          },
                          {
                            name: 'Scene',
                            color: 'text-amber-400 border-amber-900/40',
                            inputs: 'Beat, Subplot Strand, Character',
                            outputs: 'Screenplay Draft, Decision Query',
                            desc: 'Physical location slugline where actions are dramatized.'
                          },
                          {
                            name: 'Screenplay Draft',
                            color: 'text-slate-400 border-slate-900/40',
                            inputs: 'Sequence, Scene',
                            outputs: 'None (Leaf Node)',
                            desc: 'Accepts both Sequence(s) and Scene(s) to produce the final draft pages.'
                          },
                          {
                            name: 'Decision Query',
                            color: 'text-pink-400 border-pink-900/40',
                            inputs: 'Scene',
                            outputs: 'None (Leaf Node)',
                            desc: 'AI-generated interactive question to steer the plot.'
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3.5 space-y-1.5 hover:border-zinc-800 transition">
                            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>{item.name}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-light leading-normal">{item.desc}</p>
                            <div className="space-y-0.5 text-[9px] pt-1 border-t border-zinc-900/30">
                              <div className="flex items-center justify-between text-zinc-400">
                                <span className="text-zinc-600 font-bold uppercase tracking-wider text-[8px]">Inputs (←)</span>
                                <span className="truncate max-w-[120px] font-medium text-right">{item.inputs}</span>
                              </div>
                              <div className="flex items-center justify-between text-zinc-400">
                                <span className="text-purple-500 font-bold uppercase tracking-wider text-[8px]">Outputs (→)</span>
                                <span className="truncate max-w-[120px] font-medium text-right">{item.outputs}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Rules & Compatibility Center</h2>
                  <p className="text-[10px] text-zinc-500">Configure AI generation steering prompts and check node compatibility matrix</p>
                </div>
              </div>

              {/* Tab Swapper */}
              <div className="flex border-b border-zinc-900/60 pb-1.5 gap-4 mb-4 shrink-0">
                <button
                  onClick={() => setRulesActiveTab('rules')}
                  className={`text-[10px] uppercase tracking-wider pb-2 border-b-2 transition font-bold cursor-pointer ${
                    rulesActiveTab === 'rules'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  AI Steering Guidelines
                </button>
                <button
                  onClick={() => setRulesActiveTab('compatibility')}
                  className={`text-[10px] uppercase tracking-wider pb-2 border-b-2 transition font-bold cursor-pointer ${
                    rulesActiveTab === 'compatibility'
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Node Connection Schema
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                {rulesActiveTab === 'rules' ? (
                  <SkillEditor projectId={projectId} />
                ) : (
                  <div className="space-y-4 text-xs text-zinc-300 leading-relaxed font-light">
                    {/* Compatibility Visual Diagram Grid */}
                    <div className="bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-xl space-y-1">
                      <h4 className="font-semibold text-zinc-200">How Node Connections Flow:</h4>
                      <p className="text-[10.5px] text-zinc-400">
                        Link output handles (bottom port) to compatible input handles (top port). Establishing correct connection paths establishes the context hierarchy for draft compiler prompts.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                      {[
                        {
                          name: 'Story Bible',
                          color: 'text-purple-400 border-purple-900/40',
                          inputs: 'None (Absolute Root)',
                          outputs: 'Act, Character, Subplot Strand',
                          desc: 'Holds core logline, setting, and story premise.'
                        },
                        {
                          name: 'Character',
                          color: 'text-rose-400 border-rose-900/40',
                          inputs: 'Story Bible',
                          outputs: 'Scene, Beat',
                          desc: 'Maps character flaws and wants to narrative events.'
                        },
                        {
                          name: 'Subplot Strand',
                          color: 'text-teal-400 border-teal-900/40',
                          inputs: 'Story Bible',
                          outputs: 'Sequence, Scene',
                          desc: 'Defines B-Story, thematic subplots, and dynamics.'
                        },
                        {
                          name: 'Act',
                          color: 'text-blue-400 border-blue-900/40',
                          inputs: 'Story Bible',
                          outputs: 'Sequence',
                          desc: 'Major plot segments (Setup, Confrontation, Resolution).'
                        },
                        {
                          name: 'Sequence',
                          color: 'text-sky-400 border-sky-900/40',
                          inputs: 'Act, Subplot Strand',
                          outputs: 'Beat, Screenplay Draft',
                          desc: 'Multi-scene blocks driving specific narrative tasks.'
                        },
                        {
                          name: 'Beat',
                          color: 'text-indigo-400 border-indigo-900/40',
                          inputs: 'Sequence, Character',
                          outputs: 'Scene',
                          desc: 'Specific emotional shift or action/reaction step.'
                        },
                        {
                          name: 'Scene',
                          color: 'text-amber-400 border-amber-900/40',
                          inputs: 'Beat, Subplot Strand, Character',
                          outputs: 'Screenplay Draft, Decision Query',
                          desc: 'Physical location slugline where actions are dramatized.'
                        },
                        {
                          name: 'Screenplay Draft',
                          color: 'text-slate-400 border-slate-900/40',
                          inputs: 'Sequence, Scene',
                          outputs: 'None (Leaf Node)',
                          desc: 'Accepts both Sequence(s) and Scene(s) to produce the final draft pages.'
                        },
                        {
                          name: 'Decision Query',
                          color: 'text-pink-400 border-pink-900/40',
                          inputs: 'Scene',
                          outputs: 'None (Leaf Node)',
                          desc: 'AI-generated interactive question to steer the plot.'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3.5 space-y-1.5 hover:border-zinc-800 transition">
                          <div className="flex items-center justify-between border-b border-zinc-900/50 pb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>{item.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-light leading-normal">{item.desc}</p>
                          <div className="space-y-0.5 text-[9px] pt-1 border-t border-zinc-900/30">
                            <div className="flex items-center justify-between text-zinc-400">
                              <span className="text-zinc-600 font-bold uppercase tracking-wider text-[8px]">Inputs (←)</span>
                              <span className="truncate max-w-[120px] font-medium text-right">{item.inputs}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-400">
                              <span className="text-purple-500 font-bold uppercase tracking-wider text-[8px]">Outputs (→)</span>
                              <span className="truncate max-w-[120px] font-medium text-right">{item.outputs}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
