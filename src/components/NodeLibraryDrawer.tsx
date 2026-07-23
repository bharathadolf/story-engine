import React, { useState, useEffect } from 'react';
import { Search, X, PlusCircle, Trash2, User, Book, Layers, FileText, Sparkles, HelpCircle, ListOrdered, Map, GitBranch } from 'lucide-react';
import { useLibraryStore, NodeTemplate } from '../store/libraryStore.js';
import useGraphStore from '../store/graphStore.js';
import { useReactFlow } from '@xyflow/react';

interface NodeLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (text: string, type: 'success' | 'delete' | 'info') => void;
}

export default function NodeLibraryDrawer({ isOpen, onClose, addToast }: NodeLibraryDrawerProps) {
  const { templates, loadTemplates, deleteTemplate } = useLibraryStore();
  const { addNode } = useGraphStore();
  const { screenToFlowPosition, getViewport } = useReactFlow();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  if (!isOpen) return null;

  const handleSpawnTemplate = (template: NodeTemplate) => {
    // Determine center of current React Flow viewport to place the spawned template nicely
    let spawnPosition = { x: 250, y: 250 };
    try {
      const { x, y, zoom } = getViewport();
      // Calculate center of screen in flow coordinates
      const centerScreenX = window.innerWidth / 2;
      const centerScreenY = window.innerHeight / 2;
      spawnPosition = screenToFlowPosition({ x: centerScreenX, y: centerScreenY });
    } catch (err) {
      // Fallback
      spawnPosition = { 
        x: Math.random() * 200 + 150, 
        y: Math.random() * 200 + 150 
      };
    }

    addNode(template.type, spawnPosition, template.data);
    addToast(`Spawned template: ${template.name}`, 'success');
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || t.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return <User size={14} className="text-rose-400" />;
      case 'bible': return <Book size={14} className="text-purple-400" />;
      case 'strand': return <Layers size={14} className="text-teal-400" />;
      case 'act': return <FileText size={14} className="text-blue-400" />;
      case 'sequence': return <Layers size={14} className="text-sky-400" />;
      case 'scene': return <Sparkles size={14} className="text-amber-400" />;
      case 'beat': return <ListOrdered size={14} className="text-indigo-400" />;
      case 'question': return <HelpCircle size={14} className="text-pink-400" />;
      case 'religion': return <Book size={14} className="text-red-500" />;
      case 'magic': return <Sparkles size={14} className="text-fuchsia-500" />;
      case 'location': return <Map size={14} className="text-emerald-500" />;
      case 'artifact': return <Layers size={14} className="text-amber-500" />;
      case 'timeline': return <ListOrdered size={14} className="text-orange-500" />;
      case 'organization': return <GitBranch size={14} className="text-sky-500" />;
      default: return <Layers size={14} className="text-zinc-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'character': return 'border-l-rose-500 bg-rose-950/5';
      case 'bible': return 'border-l-purple-500 bg-purple-950/5';
      case 'strand': return 'border-l-teal-500 bg-teal-950/5';
      case 'act': return 'border-l-blue-500 bg-blue-950/5';
      case 'sequence': return 'border-l-sky-500 bg-sky-950/5';
      case 'scene': return 'border-l-amber-500 bg-amber-950/5';
      case 'beat': return 'border-l-indigo-500 bg-indigo-950/5';
      case 'question': return 'border-l-pink-500 bg-pink-950/5';
      case 'religion': return 'border-l-red-600 bg-red-950/5';
      case 'magic': return 'border-l-fuchsia-500 bg-fuchsia-950/5';
      case 'location': return 'border-l-emerald-500 bg-emerald-950/5';
      case 'artifact': return 'border-l-amber-500 bg-amber-950/5';
      case 'timeline': return 'border-l-orange-500 bg-orange-950/5';
      case 'organization': return 'border-l-sky-500 bg-sky-950/5';
      default: return 'border-l-zinc-500 bg-zinc-950/5';
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-[#0E0E10] border-r border-zinc-900 flex flex-col z-40 shadow-2xl animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-purple-400" />
          <h3 className="font-serif italic text-[15px] text-white">Node Template Library</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/40 space-y-3">
        <div className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 flex items-center gap-2 w-full">
          <Search size={13} className="text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 border-none outline-none focus:ring-0 w-full font-light"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300">
              <X size={11} />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-1">
          {['all', 'character', 'scene', 'beat', 'bible'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-semibold transition cursor-pointer ${
                activeFilter === f
                  ? 'bg-purple-950 text-purple-300 border border-purple-900/55'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-850 hover:text-zinc-300 hover:bg-zinc-850'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-zinc-950/10">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const isCustom = template.id.startsWith('tpl-custom-');

            return (
              <div
                key={template.id}
                className={`group border border-zinc-900 border-l-4 rounded-xl p-3.5 transition-all duration-300 hover:border-zinc-850 hover:bg-zinc-900/40 relative flex flex-col space-y-2.5 shadow-sm ${getTypeColor(
                  template.type
                )}`}
              >
                {/* Badge and Spawner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(template.type)}
                    <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">
                      {template.type} template
                    </span>
                  </div>

                  {isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete template "${template.name}"?`)) {
                          deleteTemplate(template.id);
                          addToast(`Deleted template: ${template.name}`, 'delete');
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-red-500 hover:text-red-400 transition cursor-pointer"
                      title="Delete Custom Template"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>

                {/* Template Title */}
                <div>
                  <h4 className="text-[12px] font-semibold text-zinc-100 group-hover:text-white transition">
                    {template.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-light leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Insertion Action */}
                <button
                  onClick={() => handleSpawnTemplate(template)}
                  className="w-full flex items-center justify-center gap-1 bg-zinc-900 hover:bg-purple-950/60 hover:text-purple-300 border border-zinc-850 hover:border-purple-900 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-lg transition-all duration-200 cursor-pointer shadow-inner"
                >
                  <PlusCircle size={11} />
                  <span>Insert to Canvas</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <Layers size={24} className="text-zinc-800 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-zinc-500 font-light">No templates match search criteria.</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-900 bg-zinc-950 text-center select-none text-[9px] text-zinc-600 font-mono tracking-widest">
        STORYBOARD DRAWER MODULE v1.1
      </div>
    </div>
  );
}
