import React, { useEffect, useState } from 'react';
import { Plus, Film, BookOpen, Search, Sparkles, Layout, FolderOpen, X, Layers, Terminal, Cpu, Database, Info, Upload, Trash2, Check } from 'lucide-react';
import useProjectStore from '../store/projectStore.js';
import { useLibraryStore } from '../store/libraryStore.js';
import ProjectCard from '../components/ProjectCard.js';

interface ProjectDashboardProps {
  onOpenProject: (id: string) => void;
}

export default function ProjectDashboard({ onOpenProject }: ProjectDashboardProps) {
  const { projects, isLoading, error, fetchProjects, createProject, duplicateProject, deleteProject } = useProjectStore();
  const { templates, loadTemplates, deleteTemplate } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('feature screenplay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // macOS Dock Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'delete' | 'info' }[]>([]);

  const addToast = (text: string, type: 'success' | 'delete' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    fetchProjects();
    loadTemplates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const p = await createProject(name, genre);
      setName('');
      setIsModalOpen(false);
      onOpenProject(p.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateProject(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const proj = projects.find(p => p.id === id);
    if (window.confirm(`Are you absolutely sure you want to delete "${proj?.name}"? All scene drafts and screenplay content will be lost permanently.`)) {
      try {
        await deleteProject(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;
    setIsSubmitting(true);
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.nodes || !parsed.edges) {
        throw new Error("Invalid format: JSON storyboard outline must contain 'nodes' and 'edges' lists.");
      }
      
      const importedName = parsed.projectName || `Imported Screenplay ${new Date().toLocaleDateString()}`;
      const importedGenre = parsed.projectGenre || "feature screenplay";
      
      const newProj = await createProject(importedName, importedGenre);
      
      // Save nodes & edges graph structure to the server
      const res = await fetch(`/api/projects/${newProj.id}/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: parsed.nodes, edges: parsed.edges })
      });
      
      if (!res.ok) throw new Error("Failed to initialize project graph files.");
      
      addToast(`Imported project "${importedName}" successfully!`, "success");
      setImportJson('');
      setIsImportOpen(false);
      onOpenProject(newProj.id);
    } catch (err: any) {
      alert("Project Import Failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.genre && p.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalNodes = projects.reduce((acc, p) => acc + (p.nodeCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col font-sans relative">
      {/* Background Accent Gradient */}
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-zinc-900/40 blur-[100px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="bg-[#0A0A0A]/80 backdrop-blur-md border-b border-zinc-900 px-6 py-5 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <Film size={18} className="stroke-[2.0]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif italic tracking-tighter leading-none text-[#F5F5F5]">Story Engine</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-1.5">Creative Writers Room</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search screenplay projects..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-850 focus:outline-none focus:border-zinc-700 text-xs bg-zinc-900/50 text-[#F5F5F5] placeholder-zinc-500 transition"
          />
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 px-6 py-8 md:px-12 max-w-7xl mx-auto w-full space-y-10 z-10">
        
        {/* Welcome Block with stats */}
        <div className="border border-zinc-900 bg-zinc-950/40 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full bg-zinc-850/10 blur-[80px] pointer-events-none"></div>

          <div className="space-y-4 z-10 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-zinc-700"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium">Creative Workspace</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif italic tracking-tighter leading-tight text-white">
              The Architecture of <br />
              <span className="text-zinc-500">Subtle Narrative.</span>
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm max-w-xl leading-relaxed font-light tracking-wide">
              A space where structural blocks (acts, sequences, and character arcs) compile directly into locked screenplay manuscripts. Harness Gemini-AI to co-author, format, and align dramatic tension.
            </p>
          </div>

          <div className="flex gap-4 md:gap-6 flex-shrink-0 z-10 w-full md:w-auto">
            <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl flex-1 md:flex-initial min-w-[120px] text-center">
              <div className="text-2xl md:text-3xl font-serif italic text-[#F5F5F5]">{projects.length}</div>
              <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-[0.2em] mt-1">Screenplays</div>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl flex-1 md:flex-initial min-w-[120px] text-center">
              <div className="text-2xl md:text-3xl font-serif italic text-[#F5F5F5]">{totalNodes}</div>
              <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-[0.2em] mt-1">Total Nodes</div>
            </div>
          </div>
        </div>

        {/* Dashboard grid container */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-zinc-400" />
              <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold">Your Active Storyboards</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenProject('proj-sandbox')}
                className="group flex items-center gap-2 px-5 py-2.5 border border-emerald-900 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/55 hover:border-emerald-700 rounded-full transition-all duration-300 cursor-pointer text-[10px] uppercase tracking-[0.15em] font-semibold"
              >
                <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                <span>Open Sandbox Canvas</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center gap-2 px-5 py-2.5 border border-zinc-800 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer text-[10px] uppercase tracking-[0.15em] font-medium text-white bg-zinc-900/50"
              >
                <Plus size={13} className="transition-transform group-hover:rotate-90 duration-300" />
                <span>New Screenplay</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[230px] rounded-2xl border border-zinc-900 bg-zinc-950/10 animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const ProjectCardComp = ProjectCard as any;
                return (
                  <ProjectCardComp
                    key={project.id}
                    project={project}
                    onOpen={onOpenProject}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center space-y-5">
              <div className="w-12 h-12 bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-full flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif italic text-lg text-white">No screenplay projects found</h4>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-light">
                  Create your first screenplay project. Story Bibles, nodes, and guidelines are isolated per project.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 border border-zinc-850 hover:border-white text-white hover:bg-white hover:text-black font-semibold text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-full transition duration-300 cursor-pointer bg-zinc-900/40"
              >
                <Plus size={13} />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>

        {/* Elegant design-led footer */}
        <footer className="border-t border-zinc-900 pt-10 mt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Current Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-zinc-300 font-medium">Available for Creative Output</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Platform Engine</span>
              <span className="text-xs text-zinc-300">Google Gemini-AI Co-pilot</span>
              <span className="text-[9px] text-zinc-500 mt-0.5">Automated Formatting & Annotation</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-2">Locations</span>
              <span className="text-xs text-zinc-300">Zürich • Tokyo • Silicon Valley</span>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center">
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Established MMXXVI</span>
            </div>
          </div>
        </footer>

      </main>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl max-w-md w-full overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-white" />
                <h2 className="font-serif italic text-lg text-white">Launch New Project</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-900 transition hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">Screenplay Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-850 focus:outline-none focus:border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:bg-zinc-900/80 transition"
                  placeholder="e.g. Iron song"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold">Format Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-850 focus:outline-none focus:border-zinc-700 rounded-xl text-white cursor-pointer transition"
                >
                  <option value="feature screenplay" className="bg-zinc-950 text-white">Feature Screenplay</option>
                  <option value="sci-fi tv pilot" className="bg-zinc-950 text-white">Sci-Fi TV Pilot</option>
                  <option value="half-hour sitcom" className="bg-zinc-950 text-white">Sitcom Comedy Pilot</option>
                  <option value="stage play manuscript" className="bg-zinc-950 text-white">Stage Play Manuscript</option>
                  <option value="cinematic short film" className="bg-zinc-950 text-white">Cinematic Short Film</option>
                  <option value="epic fantasy lore" className="bg-zinc-950 text-white">Epic Fantasy Lore Bible</option>
                </select>
              </div>

              <div className="px-5 py-4 bg-zinc-900/30 rounded-2xl border border-zinc-900/85 flex gap-3 items-start mt-2">
                <Sparkles size={14} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                  Launching creates an isolated writers board containing a seeded Story Bible. Spawns Character, Act, and Scene blocks on the canvas to commence production drafting.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white text-[10px] uppercase tracking-wider font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border border-zinc-800 hover:border-white text-white hover:bg-white hover:text-black font-semibold text-[10px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-full transition duration-300 cursor-pointer bg-zinc-900"
                >
                  {isSubmitting ? 'Launching...' : 'Create Project'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* FLOATING MAC DOCK */}
      <div className="mac-dock">
        {/* 1. New Screenplay */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mac-dock-item"
        >
          <Plus size={20} className="text-zinc-300 shrink-0" />
          <span className="mac-dock-tooltip">New Script</span>
        </button>

        {/* 2. Open Sandbox */}
        <button 
          onClick={() => onOpenProject('proj-sandbox')}
          className="mac-dock-item"
        >
          <Sparkles size={20} className="text-emerald-400 shrink-0 animate-pulse" />
          <span className="mac-dock-tooltip text-emerald-400">Sandbox</span>
        </button>

        {/* 3. Block Library */}
        <button 
          onClick={() => setIsLibraryOpen(true)}
          className="mac-dock-item"
        >
          <Layers size={20} className="text-purple-400 shrink-0" />
          <span className="mac-dock-tooltip text-purple-400">Library</span>
        </button>

        {/* 4. Project Importer */}
        <button 
          onClick={() => setIsImportOpen(true)}
          className="mac-dock-item"
        >
          <FolderOpen size={20} className="text-amber-400 shrink-0" />
          <span className="mac-dock-tooltip text-amber-400">Import</span>
        </button>

        {/* 5. System Console */}
        <button 
          onClick={() => setIsConsoleOpen(true)}
          className="mac-dock-item"
        >
          <Terminal size={20} className="text-blue-400 shrink-0" />
          <span className="mac-dock-tooltip text-blue-400">Console</span>
        </button>

        {/* 6. Screenplay Guide */}
        <button 
          onClick={() => setIsGuideOpen(true)}
          className="mac-dock-item"
        >
          <BookOpen size={20} className="text-pink-400 shrink-0" />
          <span className="mac-dock-tooltip text-pink-400">Guide</span>
        </button>
      </div>

      {/* TOASTS OVERLAY */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
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

      {/* TEMPLATE LIBRARY MODAL */}
      {isLibraryOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-2xl w-full overflow-hidden flex flex-col h-[75vh] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-purple-400" />
                <h2 className="font-serif italic text-lg text-white">Block Template Library</h2>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-900 transition hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-zinc-400 font-light leading-relaxed mb-2">
                These node configuration templates are available to spawn instantly on your story canvases. Custom templates can be managed and deleted here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => {
                  const isDefault = tpl.id.startsWith('tpl-hero-') || tpl.id.startsWith('tpl-shadow-') || tpl.id.startsWith('tpl-inciting-') || tpl.id.startsWith('tpl-climax-') || tpl.id.startsWith('tpl-action-');
                  return (
                    <div key={tpl.id} className="bg-[#09090b] border border-zinc-900 rounded-2xl p-4.5 flex flex-col justify-between hover:border-zinc-850 transition">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 bg-purple-950/20 border border-purple-900/30 px-2 py-0.5 rounded">
                            {tpl.type}
                          </span>
                          {isDefault ? (
                            <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider bg-zinc-900/40 px-1.5 py-0.5 rounded border border-zinc-850/60">System Default</span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Delete custom template "${tpl.name}"?`)) {
                                  deleteTemplate(tpl.id);
                                  addToast("Template deleted from library", "delete");
                                }
                              }}
                              className="text-zinc-600 hover:text-red-400 p-1 hover:bg-zinc-900 rounded-lg transition"
                              title="Delete Custom Template"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-200">{tpl.name}</h4>
                        <p className="text-[10px] text-zinc-500 leading-normal font-light">{tpl.description}</p>
                      </div>
                      <div className="mt-4 pt-3.5 border-t border-zinc-900/50 flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                        <span>Keys: {Object.keys(tpl.data || {}).length} variables</span>
                        <span>{new Date(tpl.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT IMPORT MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <FolderOpen size={16} className="text-amber-400" />
                <h2 className="font-serif italic text-lg text-white">Import Screenplay JSON Outline</h2>
              </div>
              <button 
                onClick={() => setIsImportOpen(false)}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-900 transition hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Paste Storyboard Graph JSON Outline</label>
                <textarea
                  required
                  rows={12}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="w-full p-3 font-mono text-[9px] text-zinc-400 bg-zinc-900 border border-zinc-850 focus:outline-none focus:border-zinc-700 rounded-xl scrollbar-thin"
                  placeholder='{&#10;  "projectName": "My Imported Masterpiece",&#10;  "projectGenre": "sci-fi tv pilot",&#10;  "nodes": [...],&#10;  "edges": [...]&#10;}'
                />
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl flex gap-2.5 items-start">
                <Upload size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Accepts any Storyboard Outline backup containing standard screenplay nodes (Bible, Acts, Scenes, Beats) and edge connections. Re-spawns variables automatically inside a new storyboard project folder.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white text-[10px] uppercase tracking-wider font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border border-amber-900 bg-amber-950/20 text-amber-400 hover:bg-amber-950/60 hover:text-white font-semibold text-[10px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-full transition duration-300 cursor-pointer"
                >
                  {isSubmitting ? 'Importing...' : 'Restore Screenplay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENGINE STATS / CONSOLE MODAL */}
      {isConsoleOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <Terminal size={16} className="text-blue-400" />
                <h2 className="font-serif italic text-lg text-white">Writers Room Engine Stats</h2>
              </div>
              <button 
                onClick={() => setIsConsoleOpen(false)}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-900 transition hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Active LLM Engine</span>
                  <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                    <Cpu size={12} /> Gemini-3.5-flash
                  </span>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Local Workspace DB</span>
                  <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Database size={12} /> JSON / File Storage
                  </span>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Workspace Projects</span>
                  <span className="text-[11px] font-semibold text-zinc-300">{projects.length} boards</span>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-1">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold block">Compiled Scene Nodes</span>
                  <span className="text-[11px] font-semibold text-zinc-300">{totalNodes} total nodes</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-bold block">Active Services Logs</span>
                <div className="bg-zinc-900/50 border border-zinc-900 p-4.5 rounded-2xl font-mono text-[9px] text-zinc-400 space-y-1.5 max-h-[140px] overflow-y-auto">
                  <div className="flex gap-2"><span className="text-zinc-600">[OK]</span> <span>Loaded projectService.ts</span></div>
                  <div className="flex gap-2"><span className="text-emerald-500">[OK]</span> <span>Writers Room API initialized at :3000</span></div>
                  <div className="flex gap-2"><span className="text-emerald-500">[OK]</span> <span>Local database linked at data/projects.json</span></div>
                  <div className="flex gap-2"><span className="text-purple-400">[INFO]</span> <span>Sandbox project projection proj-sandbox ready</span></div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="border border-zinc-850 hover:border-white text-white hover:bg-white hover:text-black font-semibold text-[10px] uppercase tracking-[0.15em] px-5 py-2 rounded-full transition duration-300 cursor-pointer bg-zinc-900"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WRITERS GUIDE MODAL */}
      {isGuideOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-xl w-full overflow-hidden flex flex-col h-[75vh] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} className="text-pink-400" />
                <h2 className="font-serif italic text-lg text-white">Screenplay Architecture Guide</h2>
              </div>
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="p-1 rounded text-zinc-500 hover:bg-zinc-900 transition hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Act structure (The Three-Act paradigm)
                </h4>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-light">
                  A classic screenplay separates action into three structural blocks. <strong>Act I (Setup)</strong> establishes the ordinary world and the inciting incident. <strong>Act II (Confrontation)</strong> pushes the hero through obstacles, leading to the midpoint shift where stakes become permanent. <strong>Act III (Climax & Resolution)</strong> drives character wants and needs to their ultimate confrontation.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Dialogue subtext rules
                </h4>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-light">
                  Great screenwriting avoids literal, "on-the-nose" dialogue. Subtext is what characters mean but do not say out loud. Use the narrative editor to input actions and emotional contradictions so the AI dialogue generation can speak around the subject instead of directly addressing it.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AI steering prompts
                </h4>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-light">
                  Steer model generation using localized "Steering Guidelines" (Narrative Rules). Specify clear genre boundaries, dialogue styles (e.g. terse, lyrical, naturalistic), pacing rules, or visual themes. This ensures Gemini stays inside your aesthetic contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
