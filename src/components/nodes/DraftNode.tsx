import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Lock, Unlock } from 'lucide-react';
import useSidebarStore, { isHandleCompatible } from '../../store/sidebarStore.js';

interface DraftNodeProps {
  id: string;
  data: {
    versions?: Array<{ text: string; versionNumber: number }>;
    currentVersion?: number;
    locked?: boolean;
    sceneRef?: string;
  };
  selected?: boolean;
}

export default function DraftNode({ id, data, selected }: DraftNodeProps) {
  const { openInspector } = useSidebarStore();
  const connectingHandle = useSidebarStore(state => state.connectingHandle);

  const currentVer = data.currentVersion || 1;
  const versionsCount = data.versions?.length || 0;
  const activeVerText = data.versions?.[currentVer - 1]?.text || '';
  const wordCount = activeVerText.trim() ? activeVerText.trim().split(/\s+/).length : 0;

  const isDragging = connectingHandle !== null;
  // Draft only has a target (input) handle
  const isTargetCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'draft', 'target')
    : false;
  const isAnyCompatible = isTargetCompatible;

  // Determine dynamic node styling during drag
  const dragNodeStyle = isDragging
    ? isAnyCompatible
      ? 'opacity-100 scale-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'opacity-20 scale-95 filter blur-[0.2px] pointer-events-none'
    : 'hover:border-zinc-800';

  const defaultTargetClass = "!bg-zinc-950 !border-2 !border-slate-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";

  const targetClass = isDragging
    ? isTargetCompatible
      ? '!bg-emerald-500 !border-emerald-300 !w-4 !h-4 scale-125 animate-pulse shadow-[0_0_10px_#10b981]'
      : 'opacity-20 pointer-events-none'
    : defaultTargetClass;

  return (
    <div
      onClick={() => openInspector(id, 'draft')}
      className={`bg-zinc-950/90 backdrop-blur-md border rounded-2xl p-4.5 min-w-[210px] max-w-[250px] shadow-2xl transition-all duration-300 hover:shadow-zinc-800/10 cursor-pointer border-zinc-900 border-l-4 border-l-slate-500 ${
        selected ? '!border-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.25)]' : ''
      } ${dragNodeStyle}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={targetClass} 
      />
      
      <div className="flex items-center justify-between mb-3.5 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <FileText size={15} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Draft v{currentVer}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {data.locked ? (
            <span className="text-[8px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Lock size={9} /> Locked
            </span>
          ) : (
            <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Unlock size={9} /> Draft
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {wordCount > 0 ? (
          <p className="text-[10px] text-zinc-400 line-clamp-3 font-mono leading-relaxed bg-zinc-900/40 p-2 rounded border border-zinc-900">
            {activeVerText}
          </p>
        ) : (
          <p className="text-[10.5px] text-zinc-500 italic font-light">No text generated yet</p>
        )}

        <div className="flex justify-between items-center text-[8px] text-zinc-500 pt-1 font-bold uppercase tracking-wider">
          <span>Words: {wordCount}</span>
          <span>Versions: {versionsCount}</span>
        </div>
      </div>
    </div>
  );
}
