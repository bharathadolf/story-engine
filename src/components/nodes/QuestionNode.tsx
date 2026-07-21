import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

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

  const isAnswered = data.answer !== null && data.answer !== undefined;

  return (
    <div
      onClick={() => openInspector(id, 'question')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[210px] max-w-[250px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-pink-500 ${
        selected ? 'border-pink-500 ring-2 ring-pink-100' : 'border-pink-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-pink-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-pink-50 pb-2">
        <div className="flex items-center gap-2 text-pink-600">
          <HelpCircle size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Question</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] bg-pink-50 text-pink-805 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Plot
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
            isAnswered ? 'bg-green-50 text-green-700' : 'bg-pink-50 text-pink-700'
          }`}>
            {isAnswered ? 'Resolved' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-800 line-clamp-3 leading-relaxed">
          {data.promptText || 'Gathering story decision question...'}
        </p>

        {isAnswered ? (
          <div className="bg-green-50/50 border border-green-100 rounded p-2 flex gap-1.5 items-start mt-2">
            <CheckCircle2 size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-green-800 leading-normal">
              <span className="font-semibold">Decision:</span> {data.answer}
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-gray-400 italic">
            Click to open inspector and select an answer.
          </div>
        )}

        {data.affectsField && (
          <div className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">
            Affects: {data.affectsField}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-3 !h-3" />
    </div>
  );
}
