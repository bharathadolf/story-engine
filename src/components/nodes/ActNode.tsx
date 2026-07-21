import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

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

  return (
    <div
      onClick={() => openInspector(id, 'act')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[200px] max-w-[245px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-blue-600 ${
        selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-blue-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-blue-50 pb-2">
        <div className="flex items-center gap-2 text-blue-600">
          <Layers size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Act {data.actNumber || 1}</span>
        </div>
        <span className="text-[8px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Plot
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-600 font-medium line-clamp-2">
          {data.dramaticJob || 'Define dramatic job...'}
        </p>

        {(data.openingState || data.closingState) && (
          <div className="text-[10px] bg-blue-50/50 text-blue-800 rounded p-1.5 space-y-0.5">
            {data.openingState && (
              <div className="truncate"><span className="font-semibold">Start:</span> {data.openingState}</div>
            )}
            {data.closingState && (
              <div className="truncate"><span className="font-semibold">End:</span> {data.closingState}</div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-3 !h-3" />
    </div>
  );
}
