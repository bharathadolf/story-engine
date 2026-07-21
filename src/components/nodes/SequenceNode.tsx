import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ListOrdered } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

interface SequenceNodeProps {
  id: string;
  data: {
    name: string;
    dramaticJob?: string;
    runtimeMins?: number;
    status?: string;
  };
  selected?: boolean;
}

export default function SequenceNode({ id, data, selected }: SequenceNodeProps) {
  const { openInspector } = useSidebarStore();

  return (
    <div
      onClick={() => openInspector(id, 'sequence')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[200px] max-w-[240px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-sky-500 ${
        selected ? 'border-sky-500 ring-2 ring-sky-100' : 'border-sky-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-sky-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-sky-50 pb-2">
        <div className="flex items-center gap-2 text-sky-600">
          <ListOrdered size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Sequence</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] bg-sky-50 text-sky-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Plot
          </span>
          {data.runtimeMins && (
            <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded">
              {data.runtimeMins} min
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {data.name || 'Unnamed Sequence'}
        </h3>
        {data.dramaticJob && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {data.dramaticJob}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-sky-500 !w-3 !h-3" />
    </div>
  );
}
