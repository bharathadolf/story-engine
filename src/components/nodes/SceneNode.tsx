import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Film, CheckCircle2 } from 'lucide-react';
import useSidebarStore, { isHandleCompatible } from '../../store/sidebarStore.js';

interface SceneNodeProps {
  id: string;
  data: {
    slugline: string;
    turn?: string;
    runtimeMins?: number;
    departmentsPassed?: string[];
    draftRef?: string | null;
    status?: string;
  };
  selected?: boolean;
}

export default function SceneNode({ id, data, selected }: SceneNodeProps) {
  const { openInspector } = useSidebarStore();
  const connectingHandle = useSidebarStore(state => state.connectingHandle);

  const deptsPassed = data.departmentsPassed?.length || 0;
  const deptsTotal = 6;

  const isDragging = connectingHandle !== null;
  const isTargetCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'scene', 'target')
    : false;
  const isSourceCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'scene', 'source')
    : false;
  const isAnyCompatible = isTargetCompatible || isSourceCompatible;

  // Determine dynamic node styling during drag
  const dragNodeStyle = isDragging
    ? isAnyCompatible
      ? 'opacity-100 scale-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'opacity-20 scale-95 filter blur-[0.2px] pointer-events-none'
    : 'hover:border-zinc-800';

  const defaultTargetClass = "!bg-zinc-950 !border-2 !border-amber-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";
  const defaultSourceClass = "!bg-zinc-950 !border-2 !border-amber-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";

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
      onClick={() => openInspector(id, 'scene')}
      className={`bg-zinc-950/90 backdrop-blur-md border rounded-2xl p-4.5 min-w-[210px] max-w-[250px] shadow-2xl transition-all duration-300 hover:shadow-amber-950/20 cursor-pointer border-zinc-900 border-l-4 border-l-amber-500 ${
        selected ? '!border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : ''
      } ${dragNodeStyle}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={targetClass} 
      />
      
      <div className="flex items-center justify-between mb-3.5 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Film size={15} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Scene</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] bg-amber-950/40 text-amber-400 border border-amber-900/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Plot
          </span>
          {data.runtimeMins && (
            <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 font-semibold px-1.5 py-0.5 rounded">
              {data.runtimeMins} min
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3.5">
        <h3 className="text-[10px] font-mono font-bold text-zinc-200 line-clamp-2 bg-zinc-900/50 p-2 rounded border border-zinc-900 uppercase">
          {data.slugline || 'INT. NEW LOCATION - DAY'}
        </h3>
        
        {data.turn ? (
          <p className="text-[10.5px] text-zinc-400 italic line-clamp-2 font-light leading-relaxed">
            <span className="font-semibold text-zinc-500 font-sans not-italic">Turn:</span> {data.turn}
          </p>
        ) : (
          <p className="text-[10.5px] text-zinc-500 italic font-light">No turn defined</p>
        )}
      </div>

      <div className="space-y-1 pt-1.5 border-t border-zinc-900/40">
        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>Dept Passes</span>
          <span>{deptsPassed}/{deptsTotal}</span>
        </div>
        <div className="w-full bg-zinc-900 rounded-full h-1">
          <div
            className="bg-amber-500 h-1 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${(deptsPassed / deptsTotal) * 100}%` }}
          />
        </div>
      </div>

      {data.draftRef && (
        <div className="mt-3.5 pt-2 border-t border-zinc-900 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
          <CheckCircle2 size={13} />
          <span>Draft generated</span>
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={sourceClass} 
      />
    </div>
  );
}
