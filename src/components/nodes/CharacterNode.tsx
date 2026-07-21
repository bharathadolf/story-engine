import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { User } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

interface CharacterNodeProps {
  id: string;
  data: {
    name: string;
    role: string;
    want?: string;
    flaw?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function CharacterNode({ id, data, selected }: CharacterNodeProps) {
  const { openInspector } = useSidebarStore();

  return (
    <div
      onClick={() => openInspector(id, 'character')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[200px] max-w-[240px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-rose-500 ${
        selected ? 'border-rose-500 ring-2 ring-rose-100' : 'border-rose-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-rose-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-rose-50 pb-2">
        <div className="flex items-center gap-2 text-rose-600">
          <User size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Character</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Character
          </span>
          <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full capitalize animate-pulse">
            {data.role || 'protagonist'}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {data.name || 'Unnamed Character'}
        </h3>
        
        {data.want && (
          <p className="text-xs text-gray-500 line-clamp-1">
            <span className="font-semibold text-gray-600">Want:</span> {data.want}
          </p>
        )}

        {data.flaw && (
          <p className="text-xs text-gray-500 line-clamp-1">
            <span className="font-semibold text-gray-600">Flaw:</span> {data.flaw}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-rose-500 !w-3 !h-3" />
    </div>
  );
}
