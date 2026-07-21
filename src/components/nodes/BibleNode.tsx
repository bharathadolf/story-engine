import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

interface BibleNodeProps {
  id: string;
  data: {
    title: string;
    premise?: string;
    theme?: string;
    status?: string;
  };
  selected?: boolean;
}

export default function BibleNode({ id, data, selected }: BibleNodeProps) {
  const { openInspector } = useSidebarStore();

  return (
    <div
      onClick={() => openInspector(id, 'bible')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[220px] max-w-[260px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-purple-600 ${
        selected ? 'border-purple-600 ring-2 ring-purple-100' : 'border-purple-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-purple-50 pb-2">
        <div className="flex items-center gap-2 text-purple-700">
          <BookOpen size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Story Bible</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Setting
          </span>
          <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full uppercase">
            {data.status || 'draft'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
          {data.title || 'Untitled Screenplay'}
        </h3>
        
        {data.premise ? (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {data.premise}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">No premise defined yet</p>
        )}

        {data.theme && (
          <div className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded inline-block truncate max-w-full">
            Theme: {data.theme}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-purple-600 !w-3 !h-3" />
    </div>
  );
}
