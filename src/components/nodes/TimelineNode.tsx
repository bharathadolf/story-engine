import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ListOrdered } from 'lucide-react';
import useSidebarStore, { isHandleCompatible } from '../../store/sidebarStore.js';

interface TimelineNodeProps {
  id: string;
  data: {
    name: string;
    year?: string;
    eventSummary?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function TimelineNode({ id, data, selected }: TimelineNodeProps) {
  const { openInspector } = useSidebarStore();
  const connectingHandle = useSidebarStore(state => state.connectingHandle);

  const isDragging = connectingHandle !== null;
  const isTargetCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'timeline', 'target')
    : false;
  const isSourceCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'timeline', 'source')
    : false;
  const isAnyCompatible = isTargetCompatible || isSourceCompatible;

  const dragNodeStyle = isDragging
    ? isAnyCompatible
      ? 'opacity-100 scale-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'opacity-20 scale-95 filter blur-[0.2px] pointer-events-none'
    : 'hover:border-zinc-800';

  const defaultTargetClass = "!bg-zinc-950 !border-2 !border-orange-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";
  const defaultSourceClass = "!bg-zinc-950 !border-2 !border-orange-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";

  const targetClass = isDragging
    ? isTargetCompatible
      ? '!bg-emerald-500 !border-emerald-300 !w-4 !h-4 scale-125 animate-pulse shadow-[0_0_10px_#10b981]'
      : 'opacity-20 pointer-events-none'
    : defaultTargetClass;

  const sourceClass = isDragging
    ? isSourceCompatible
      ? '!bg-emerald-500 !border-emerald-300 !w-4 !h-4 scale-125 animate-pulse shadow-[0_0_10px_#10b981]'
      : 'opacity-20 pointer-events-none'
    : defaultSourceClass;

  return (
    <div
      onClick={() => openInspector(id, 'timeline')}
      className={`bg-zinc-950/90 backdrop-blur-md border rounded-2xl p-4.5 min-w-[200px] max-w-[240px] shadow-2xl transition-all duration-300 hover:shadow-orange-950/20 cursor-pointer border-zinc-900 border-l-4 border-l-orange-500 ${
        selected ? '!border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)]' : ''
      } ${dragNodeStyle}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={targetClass} 
      />
      
      <div className="flex items-center justify-between mb-3.5 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-orange-500">
          <ListOrdered size={15} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Timeline</span>
        </div>
        <span className="text-[8px] bg-orange-950/40 text-orange-400 border border-orange-900/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          {data.year || 'Era'}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-100 truncate">
          {data.name || 'Timeline Event'}
        </h3>
        
        {data.eventSummary && (
          <p className="text-[10.5px] text-zinc-400 line-clamp-2 leading-relaxed font-light">
            {data.eventSummary}
          </p>
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
