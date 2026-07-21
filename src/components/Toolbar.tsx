import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Download, Settings, Plus, Layout, User, Layers, ListOrdered, Film, Sparkles, HelpCircle, FileText, GitBranch, Share2, ChevronDown, BookOpen } from 'lucide-react';
import useProjectStore from '../store/projectStore.js';
import useGraphStore from '../store/graphStore.js';
import ProjectSettingsModal from './ProjectSettingsModal.js';
import { nodeTypesList } from '../utils/nodeDefaults.js';

interface ToolbarProps {
  onBackToDashboard: () => void;
  isLibraryOpen: boolean;
  onToggleLibrary: () => void;
  isRulesOpen: boolean;
  onToggleRules: () => void;
}

export default function Toolbar({ onBackToDashboard, isLibraryOpen, onToggleLibrary, isRulesOpen, onToggleRules }: ToolbarProps) {
  const { projects, activeProjectId, setActiveProjectId } = useProjectStore() as any;
  const { nodes, edges, addNode, saveGraph, saveStatus, autoLayout } = useGraphStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find((p: any) => p.id === activeProjectId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const filename = `${activeProject?.name?.replace(/\s+/g, '_') || 'Story'}_graph_structure.json`;
    downloadFile(dataStr, filename, 'application/json');
  };

  const handleExportOutline = () => {
    const bibles = nodes.filter(n => n.type === 'bible');
    const characters = nodes.filter(n => n.type === 'character');
    const strands = nodes.filter(n => n.type === 'strand');
    const acts = nodes.filter(n => n.type === 'act');
    const sequences = nodes.filter(n => n.type === 'sequence');
    const scenes = nodes.filter(n => n.type === 'scene');
    const beats = nodes.filter(n => n.type === 'beat');
    const questions = nodes.filter(n => n.type === 'question');
    const drafts = nodes.filter(n => n.type === 'draft');

    let outline = `========================================================================\n`;
    outline += `SCREENPLAY OUTLINE: ${(activeProject?.name as string)?.toUpperCase() || 'UNTITLED SCRIPT'}\n`;
    outline += `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    outline += `========================================================================\n\n`;

    // 1. STORY BIBLE / CORE THEME
    if (bibles.length > 0) {
      outline += `I. STORY BIBLE & LOGLINE\n`;
      outline += `------------------------------------------------------------------------\n`;
      bibles.forEach((b) => {
        const d = b.data as any || {};
        outline += `Theme: ${d.theme || 'N/A'} | Genre: ${d.genre || 'N/A'}\n`;
        outline += `Logline:\n${d.logline || 'No logline added.'}\n\n`;
      });
      outline += `\n`;
    }

    // 2. CHARACTER INDEX
    if (characters.length > 0) {
      outline += `II. DRAMATIS PERSONAE (CHARACTERS)\n`;
      outline += `------------------------------------------------------------------------\n`;
      characters.forEach((c, idx) => {
        const d = c.data as any || {};
        outline += `${idx + 1}. ${(d.name as string)?.toUpperCase() || 'Unnamed Character'} [${d.archetype || 'No Archetype'}]\n`;
        outline += `   - Role: ${d.role || 'Secondary'}\n`;
        outline += `   - Description/Bio: ${d.description || 'No description provided.'}\n`;
        outline += `   - Objective: ${d.objective || 'No objective stated.'}\n\n`;
      });
      outline += `\n`;
    }

    // 3. SUBPLOTS & STRANDS
    if (strands.length > 0) {
      outline += `III. SUBPLOT STRANDS\n`;
      outline += `------------------------------------------------------------------------\n`;
      strands.forEach((s) => {
        const d = s.data as any || {};
        outline += `- STRAND "${d.name || 'Unnamed Strand'}":\n`;
        outline += `  Focus: ${d.focus || 'N/A'} | Dynamic Tension: ${d.tension || 'N/A'}\n\n`;
      });
      outline += `\n`;
    }

    // 4. ACT STRUCTURAL HIERARCHY
    outline += `IV. NARRATIVE SEQUENCE & SCENE HIERARCHY\n`;
    outline += `------------------------------------------------------------------------\n`;
    if (acts.length > 0) {
      acts.forEach((act, actIdx) => {
        const actData = act.data as any || {};
        outline += `ACT ${actIdx + 1}: ${(actData.title as string)?.toUpperCase() || 'UNNAMED ACT'}\n`;
        outline += `  Summary: ${actData.summary || 'No summary.'}\n\n`;

        const sequenceEdges = edges.filter(e => e.source === act.id);
        const actSeqIds = new Set(sequenceEdges.map(e => e.target));
        const actSeqs = sequences.filter(s => actSeqIds.has(s.id));

        if (actSeqs.length > 0) {
          actSeqs.forEach((seq, seqIdx) => {
            const seqData = seq.data as any || {};
            outline += `  > Sequence ${actIdx + 1}.${seqIdx + 1}: ${(seqData.title as string)?.toUpperCase() || 'UNNAMED SEQUENCE'}\n`;
            outline += `    Context: ${seqData.context || 'No sequence context.'}\n\n`;

            const sceneEdges = edges.filter(e => e.source === seq.id);
            const seqSceneIds = new Set(sceneEdges.map(e => e.target));
            const seqScenes = scenes.filter(sc => seqSceneIds.has(sc.id));

            if (seqScenes.length > 0) {
              seqScenes.forEach((scene, scIdx) => {
                const scData = scene.data as any || {};
                outline += `    [Scene ${actIdx + 1}.${seqIdx + 1}.${scIdx + 1}]: ${(scData.slugline as string)?.toUpperCase() || 'INT. UNNAMED SCENE - DAY'}\n`;
                outline += `      A/B Story alignment: ${scData.strandRef || 'Main Plot'}\n`;
                outline += `      Dramatized Beats:\n`;

                const beatEdges = edges.filter(e => e.source === scene.id);
                const sceneBeatIds = new Set(beatEdges.map(e => e.target));
                const sceneBeats = beats.filter(b => sceneBeatIds.has(b.id));

                if (sceneBeats.length > 0) {
                  sceneBeats.forEach((beat, bIdx) => {
                    const bData = beat.data as any || {};
                    outline += `        - Beat ${bIdx + 1} (${bData.type || 'Action'}): ${bData.headline || 'No headline'} -> ${bData.description || ''}\n`;
                  });
                } else {
                  outline += `        (No beats mapped to this scene yet)\n`;
                }

                const draftEdges = edges.filter(e => e.source === scene.id);
                const sceneDraftIds = new Set(draftEdges.map(e => e.target));
                const sceneDrafts = drafts.filter(dr => sceneDraftIds.has(dr.id));

                if (sceneDrafts.length > 0) {
                  outline += `      Draft Versions:\n`;
                  sceneDrafts.forEach(dr => {
                    const drData = dr.data as any || {};
                    const curVer = drData.currentVersion || 1;
                    const activeText = drData.versions?.[curVer - 1]?.text || 'Empty draft text.';
                    outline += `        * Draft v${curVer} Text Summary:\n          "${activeText.substring(0, 300)}${activeText.length > 300 ? '...' : ''}"\n`;
                  });
                }
                outline += `\n`;
              });
            } else {
              outline += `    (No scenes mapped to this sequence yet)\n\n`;
            }
          });
        } else {
          outline += `  (No sequences mapped to this act yet)\n\n`;
        }
      });
    } else {
      outline += `(No narrative acts defined in the storyboard canvas yet)\n`;
    }

    // 5. DECISION BOARD QUESTIONS
    if (questions.length > 0) {
      outline += `V. CRITICAL DRAMATIC DECISION BOARD & QUERIES\n`;
      outline += `------------------------------------------------------------------------\n`;
      questions.forEach((q, idx) => {
        const d = q.data as any || {};
        outline += `${idx + 1}. QUERY: "${d.query || 'Unnamed Question?'}"\n`;
        outline += `   - Story Context: ${d.storyContext || 'N/A'}\n`;
        outline += `   - Resolution Options: ${Array.isArray(d.options) ? d.options.join(', ') : 'No options listed.'}\n\n`;
      });
      outline += `\n`;
    }

    const filename = `${activeProject?.name?.replace(/\s+/g, '_') || 'Story'}_screenplay_outline.txt`;
    downloadFile(outline, filename, 'text/plain;charset=utf-8');
  };

  const handleExport = async () => {
    if (!activeProjectId) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph: { nodes, edges } })
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject?.name?.replace(/\s+/g, '_') || 'Story'}_screenplay.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export screenplay. Make sure you have locked scene drafts connected.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleForceSave = async () => {
    setIsSaving(true);
    try {
      await saveGraph();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const spawnNode = (type: string) => {
    // Generate a random-ish coordinate near the visual viewport center
    const x = 300 + Math.random() * 150;
    const y = 200 + Math.random() * 150;
    addNode(type, { x, y });
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'bible': return <Layout size={14} />;
      case 'character': return <User size={14} />;
      case 'strand': return <GitBranch size={14} />;
      case 'act': return <Layers size={14} />;
      case 'sequence': return <ListOrdered size={14} />;
      case 'scene': return <Film size={14} />;
      case 'beat': return <Sparkles size={14} />;
      case 'question': return <HelpCircle size={14} />;
      case 'draft': return <FileText size={14} />;
      default: return <Plus size={14} />;
    }
  };

  return (
    <div className="bg-[#0A0A0A]/95 text-[#F5F5F5] px-6 py-4 border-b border-zinc-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 z-50 sticky top-0 shadow-md">
      
      {/* Left side switcher & back action */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-4 py-2 rounded-full transition cursor-pointer"
        >
          <ArrowLeft size={11} />
          <span>Dashboard</span>
        </button>

        <div className="h-5 w-[1px] bg-zinc-900 hidden md:block" />

        {/* Node Library Toggle Button */}
        <button
          onClick={onToggleLibrary}
          className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-4 py-2 rounded-full transition cursor-pointer select-none ${
            isLibraryOpen 
              ? 'bg-purple-950/60 text-purple-300 border border-purple-900/50 ring-1 ring-purple-800' 
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-700'
          }`}
          title="Open Custom & Predefined Node Template Library"
        >
          <Layers size={11} className="text-purple-400" />
          <span>Node Library</span>
        </button>

        <div className="h-5 w-[1px] bg-zinc-900 hidden md:block" />

        {/* Project Switcher */}
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">Active Script</span>
          <div className="flex items-center gap-2">
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-transparent text-xs font-serif italic text-white focus:outline-none focus:ring-0 cursor-pointer max-w-[200px] truncate"
            >
              {projects.map((p: any) => (
                <option key={p.id} value={p.id} className="bg-zinc-950 text-zinc-200">
                  {p.name}
                </option>
              ))}
            </select>
            {activeProjectId === 'proj-sandbox' && (
              <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 select-none animate-pulse">
                Sandbox
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Spawn Node buttons */}
      <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/50 p-1.5 rounded-2xl border border-zinc-900/80">
        <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold px-2 select-none hidden lg:inline">Add:</span>
        {nodeTypesList.map(item => (
          <button
            key={item.type}
            onClick={() => spawnNode(item.type)}
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-xl hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-850 transition cursor-pointer ${item.textColor}`}
            title={item.desc}
          >
            {getNodeIcon(item.type)}
            <span className="hidden sm:inline">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* Auto-save Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-full select-none text-[9px] uppercase tracking-wider font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${
            saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' :
            saveStatus === 'error' ? 'bg-red-500 animate-ping' :
            'bg-emerald-500'
          }`} />
          <span className="text-zinc-500">
            {saveStatus === 'saving' ? 'Saving...' :
             saveStatus === 'error' ? 'Save Error' :
             'Synced'}
          </span>
        </div>

        <button
          onClick={autoLayout}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3.5 py-2 rounded-full transition cursor-pointer"
          title="Auto-arrange screenplay elements into clean, structured layers"
        >
          <Layout size={11} className="text-purple-400" />
          <span>Auto Layout</span>
        </button>

        <button
          onClick={onToggleRules}
          className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-3.5 py-2 rounded-full transition cursor-pointer ${
            isRulesOpen 
              ? 'bg-purple-950/80 border border-purple-900/50 text-purple-200 hover:text-white' 
              : 'bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Narrative Steering Rules Editor (R)"
        >
          <BookOpen size={11} className={isRulesOpen ? 'text-purple-300' : 'text-purple-400'} />
          <span>Rules</span>
        </button>

        <button
          onClick={handleForceSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-850 hover:border-zinc-700 px-3.5 py-2 rounded-full transition disabled:opacity-50 cursor-pointer"
        >
          <Save size={11} />
          <span>{isSaving ? 'Saved' : 'Save'}</span>
        </button>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold border border-zinc-800 hover:border-purple-500 text-white bg-zinc-900/40 hover:bg-zinc-900 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer"
          >
            <Download size={11} className="text-purple-400" />
            <span>Export Suite</span>
            <ChevronDown size={11} className="text-zinc-500 transition-transform duration-200" />
          </button>

          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl z-50 w-56 p-1.5 space-y-1 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-100">
              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  handleExport();
                }}
                disabled={isExporting}
                className="w-full text-left px-3 py-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FileText size={13} className="text-blue-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold">Full Screenplay DOCX</span>
                  <span className="text-[9px] text-zinc-500">Draft version compiling</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  handleExportOutline();
                }}
                className="w-full text-left px-3 py-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ListOrdered size={13} className="text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold">Screenplay Outline (.txt)</span>
                  <span className="text-[9px] text-zinc-500">Structured hierarchy dump</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  handleExportJSON();
                }}
                className="w-full text-left px-3 py-2 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Share2 size={13} className="text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold">Graph JSON Structure</span>
                  <span className="text-[9px] text-zinc-500">Canvas nodes & edges JSON</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          title="Project Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {activeProjectId && (
        <ProjectSettingsModal
          projectId={activeProjectId}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onDeleted={onBackToDashboard}
        />
      )}

    </div>
  );
}
