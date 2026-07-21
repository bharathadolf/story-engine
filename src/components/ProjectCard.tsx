import React from 'react';
import { Play, Copy, Trash2, Calendar, Layout } from 'lucide-react';
import { ProjectMeta } from '../store/projectStore.js';

interface ProjectCardProps {
  project: ProjectMeta;
  onOpen: (id: string) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => any;
  onDelete: (id: string, e: React.MouseEvent) => any;
}

export default function ProjectCard({ project, onOpen, onDuplicate, onDelete }: ProjectCardProps) {
  const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={() => onOpen(project.id)}
      className="bg-zinc-950/50 border border-zinc-900 rounded-3xl overflow-hidden hover:border-zinc-700 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-[230px]"
    >
      {/* Visual Cover Header */}
      <div className="h-11 flex items-center justify-between px-4 relative transition-colors duration-300 border-b border-zinc-900/80 bg-zinc-950 relative">
        <div 
          className="absolute left-0 top-0 bottom-0 w-[4px]"
          style={{ backgroundColor: project.coverColor || '#71717a' }}
        />
        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-400 pl-1.5">
          {project.genre || 'General'}
        </span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => onDuplicate(project.id, e)}
            title="Duplicate Project"
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <Copy size={11} />
          </button>
          <button
            onClick={(e) => onDelete(project.id, e)}
            title="Delete Project"
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-red-950 hover:border-red-900 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-zinc-950/30">
        <div>
          <h3 className="font-serif italic text-lg text-white line-clamp-1 group-hover:text-zinc-300 transition-colors">
            {project.name}
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-1.5 flex items-center gap-1.5">
            <Calendar size={11} />
            <span>Updated {formattedDate}</span>
          </p>
          <p className="text-xs text-zinc-400 mt-3 line-clamp-2 italic leading-relaxed font-light">
            {project.logline || 'Develop world-building rules, plot nodes, acts, and dialogue beats into a production screenplay.'}
          </p>
        </div>

        {/* Footer Statistics */}
        <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-2">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium tracking-wide">
            <Layout size={12} />
            <span>{project.nodeCount} graph nodes</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(project.id);
            }}
            className="flex items-center gap-1.5 border border-zinc-800 hover:border-white text-white hover:bg-white hover:text-black font-semibold text-[10px] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 cursor-pointer bg-zinc-900/60"
          >
            <Play size={10} className="fill-current" />
            <span>Open Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
