import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

interface BeatNodeProps {
  id: string;
  data: {
    order?: number;
    action: string;
    reaction?: string;
    shift?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function BeatNode({ id, data, selected }: BeatNodeProps) {
  const { openInspector } = useSidebarStore();

  return (
    <div
      onClick={() => openInspector(id, 'beat')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[200px] max-w-[240px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-indigo-500 ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-indigo-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-indigo-50 pb-2">
        <div className="flex items-center gap-2 text-indigo-600">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Beat {data.order ? `#${data.order}` : ''}</span>
        </div>
        <span className="text-[8px] bg-indigo-50 text-indigo-805 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Plot
        </span>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-gray-700">Action:</h4>
        <p className="text-xs text-gray-500 line-clamp-2">
          {data.action || 'Define physical action...'}
        </p>

        {data.shift && (
          <div className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded inline-block truncate max-w-full">
            Shift: {data.shift}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3" />
    </div>
  );
}
