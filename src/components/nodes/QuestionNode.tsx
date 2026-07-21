import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import useSidebarStore, { isHandleCompatible } from '../../store/sidebarStore.js';

interface QuestionNodeProps {
  id: string;
  data: {
    promptText: string;
    options?: string[];
    answer?: string | null;
    locked?: boolean;
    affectsField?: string;
  };
  selected?: boolean;
}

export default function QuestionNode({ id, data, selected }: QuestionNodeProps) {
  const { openInspector } = useSidebarStore();
  const connectingHandle = useSidebarStore(state => state.connectingHandle);

  const isAnswered = data.answer !== null && data.answer !== undefined;

  const isDragging = connectingHandle !== null;
  // Question only has a target (input) handle
  const isTargetCompatible = connectingHandle
    ? isHandleCompatible(connectingHandle, id, 'question', 'target')
    : false;
  const isAnyCompatible = isTargetCompatible;

  // Determine dynamic node styling during drag
  const dragNodeStyle = isDragging
    ? isAnyCompatible
      ? 'opacity-100 scale-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
      : 'opacity-20 scale-95 filter blur-[0.2px] pointer-events-none'
    : 'hover:border-zinc-800';

  const defaultTargetClass = "!bg-zinc-950 !border-2 !border-pink-500 !w-3.5 !h-3.5 !rounded-full hover:scale-125 transition-transform";

  const targetClass = isDragging
    ? isTargetCompatible
      ? '!bg-emerald-500 !border-emerald-300 !w-4 !h-4 scale-125 animate-pulse shadow-[0_0_10px_#10b981]'
      : 'opacity-20 pointer-events-none'
    : defaultTargetClass;

  return (
    <div
      onClick={() => openInspector(id, 'question')}
      className={`bg-zinc-950/90 backdrop-blur-md border rounded-2xl p-4.5 min-w-[210px] max-w-[250px] shadow-2xl transition-all duration-300 hover:shadow-pink-950/10 cursor-pointer border-zinc-900 border-l-4 border-l-pink-500 ${
        selected ? '!border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.25)]' : ''
      } ${dragNodeStyle}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={targetClass} 
      />
      
      <div className="flex items-center justify-between mb-3.5 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2 text-pink-400">
          <HelpCircle size={15} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Question</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] bg-pink-950/40 text-pink-400 border border-pink-900/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Plot
          </span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${
            isAnswered 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
              : 'bg-pink-950/40 text-pink-400 border-pink-900/30'
          }`}>
            {isAnswered ? 'Resolved' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10.5px] font-semibold text-zinc-200 line-clamp-3 leading-relaxed">
          {data.promptText || 'Gathering story decision question...'}
        </p>

        {isAnswered ? (
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-2.5 flex gap-1.5 items-start mt-2">
            <CheckCircle2 size={11} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-emerald-400 leading-normal font-light">
              <span className="font-semibold text-emerald-500">Decision:</span> {data.answer}
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-zinc-500 italic font-light">
            Click to open inspector and select an answer.
          </div>
        )}

        {data.affectsField && (
          <div className="text-[8px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">
            Affects: {data.affectsField}
          </div>
        )}
      </div>
    </div>
  );
}
