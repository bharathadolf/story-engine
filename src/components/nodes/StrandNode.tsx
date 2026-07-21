import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

interface StrandNodeProps {
  id: string;
  data: {
    name: string;
    genre?: string;
    protagonistRef?: string;
    premiseSentence?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function StrandNode({ id, data, selected }: StrandNodeProps) {
  const { openInspector } = useSidebarStore();

  return (
    <div
      onClick={() => openInspector(id, 'strand')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[200px] max-w-[240px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-teal-500 ${
        selected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-teal-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-teal-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-teal-50 pb-2">
        <div className="flex items-center gap-2 text-teal-600">
          <GitBranch size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Subplot / Strand</span>
        </div>
        <span className="text-[8px] bg-teal-50 text-teal-805 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Plot
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {data.name || 'Unnamed Strand'}
        </h3>
        
        {data.genre && (
          <p className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded inline-block max-w-full truncate">
            {data.genre}
          </p>
        )}

        {data.premiseSentence && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {data.premiseSentence}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-teal-500 !w-3 !h-3" />
    </div>
  );
}
