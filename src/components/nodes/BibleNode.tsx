import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpen } from 'lucide-react';
import useSidebarStore, { isHandleCompatible } from '../../store/sidebarStore.js';

interface BibleNodeProps {
  id: string;
  data: {
    title: string;
    premise?: string;
    theme?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function BibleNode({ id, data, selected }: BibleNodeProps) {
  const { openInspector } = useSidebarStore();
  const connectingHandle = useSidebarStore(state => state.connectingHandle);

  const isDragging = connectingHandle !== null;
  // Bible only has a source (output) handle
  const isSourceCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'bible', 'source')
    : false;
  const isAnyCompatible = isSourceCompatible;

  // Determine dynamic node styling during drag
  const dragNodeStyle = isDragging
    ? isAnyCompatible
      ? 'opacity-100 scale-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'opacity-20 scale-95 filter blur-[0.2px] pointer-events-none'
    : 'hover:border-zinc-800';

  const defaultSourceClass = "!bg-zinc-950 !border-2 !border-purple-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";

  const sourceClass = isDragging
    ? isSourceCompatible
      ? '!bg-emerald-500 !border-emerald-300 !w-4 !h-4 scale-125 animate-pulse shadow-[0_0_10px_#10b981]'
      : 'opacity-20 pointer-events-none'
    : defaultSourceClass;

  return (
    <div
      onClick={() => openInspector(id, 'bible')}
      className={`bg-zinc-950/90 backdrop-blur-md border rounded-2xl p-4.5 min-w-[220px] max-w-[260px] shadow-2xl transition-all duration-300 hover:shadow-purple-950/20 cursor-pointer border-zinc-900 border-l-4 border-l-purple-500 ${
        selected ? '!border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]' : ''
      } ${dragNodeStyle}`}
    >
      <div className="flex items-center justify-between mb-3.5 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-purple-400">
          <BookOpen size={15} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Story Bible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] bg-purple-950/40 text-purple-400 border border-purple-900/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Setting
          </span>
          <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 font-bold px-1.5 py-0.5 rounded uppercase">
            {data.status || 'draft'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-100 line-clamp-1 leading-snug">
          {data.title || 'Untitled Screenplay'}
        </h3>
        
        {data.premise ? (
          <p className="text-[10.5px] text-zinc-400 line-clamp-2 leading-relaxed font-light">
            {data.premise}
          </p>
        ) : (
          <p className="text-[10.5px] text-zinc-500 italic font-light">No premise defined yet</p>
        )}

        {data.theme && (
          <div className="text-[9px] bg-zinc-900/50 text-zinc-400 border border-zinc-900 px-2 py-0.5 rounded inline-block truncate max-w-full font-medium">
            Theme: {data.theme}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={sourceClass} 
      />
    </div>
  );
}
