import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import useSidebarStore, { isHandleCompatible } from '../../store/sidebarStore.js';

interface ActNodeProps {
  id: string;
  data: {
    actNumber: number;
    dramaticJob: string;
    openingState?: string;
    closingState?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function ActNode({ id, data, selected }: ActNodeProps) {
  const { openInspector } = useSidebarStore();
  const connectingHandle = useSidebarStore(state => state.connectingHandle);

  const isDragging = connectingHandle !== null;
  const isTargetCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'act', 'target')
    : false;
  const isSourceCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'act', 'source')
    : false;
  const isAnyCompatible = isTargetCompatible || isSourceCompatible;

  // Determine dynamic node styling during drag
  const dragNodeStyle = isDragging
    ? isAnyCompatible
      ? 'opacity-100 scale-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'opacity-20 scale-95 filter blur-[0.2px] pointer-events-none'
    : 'hover:border-zinc-800';

  const defaultTargetClass = "!bg-zinc-950 !border-2 !border-blue-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";
  const defaultSourceClass = "!bg-zinc-950 !border-2 !border-blue-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";

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
      onClick={() => openInspector(id, 'act')}
      className={`bg-zinc-950/90 backdrop-blur-md border rounded-2xl p-4.5 min-w-[200px] max-w-[245px] shadow-2xl transition-all duration-300 hover:shadow-blue-950/20 cursor-pointer border-zinc-900 border-l-4 border-l-blue-500 ${
        selected ? '!border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : ''
      } ${dragNodeStyle}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={targetClass} 
      />
      
      <div className="flex items-center justify-between mb-3.5 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-blue-400">
          <Layers size={15} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Act {data.actNumber || 1}</span>
        </div>
        <span className="text-[8px] bg-blue-950/40 text-blue-400 border border-blue-900/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Plot
        </span>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10.5px] text-zinc-400 font-medium line-clamp-2 leading-relaxed font-light">
          {data.dramaticJob || 'Define dramatic job...'}
        </p>

        {(data.openingState || data.closingState) && (
          <div className="text-[9px] bg-zinc-900/50 text-zinc-400 rounded-xl p-2.5 space-y-1 border border-zinc-900 font-light">
            {data.openingState && (
              <div className="truncate"><span className="font-semibold text-zinc-500">Start:</span> {data.openingState}</div>
            )}
            {data.closingState && (
              <div className="truncate"><span className="font-semibold text-zinc-500">End:</span> {data.closingState}</div>
            )}
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
