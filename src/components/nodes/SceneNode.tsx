import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Film, CheckCircle2 } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

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

  const deptsPassed = data.departmentsPassed?.length || 0;
  const deptsTotal = 6; // dialogue, structure, character, world-lore, tone, action-visual

  return (
    <div
      onClick={() => openInspector(id, 'scene')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[210px] max-w-[250px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-amber-500 ${
        selected ? 'border-amber-500 ring-2 ring-amber-100' : 'border-amber-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-amber-50 pb-2">
        <div className="flex items-center gap-2 text-amber-600">
          <Film size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Scene</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] bg-amber-50 text-amber-805 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Plot
          </span>
          {data.runtimeMins && (
            <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded">
              {data.runtimeMins} min
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <h3 className="text-xs font-mono font-semibold text-gray-800 line-clamp-2 bg-gray-50 p-1.5 rounded border border-gray-100 uppercase">
          {data.slugline || 'INT. NEW LOCATION - DAY'}
        </h3>
        
        {data.turn ? (
          <p className="text-xs text-gray-500 italic line-clamp-2">
            <span className="font-semibold text-gray-600 font-sans not-italic">Turn:</span> {data.turn}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">No turn defined</p>
        )}
      </div>

      {/* Progress towards locking */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
          <span>Dept Passes</span>
          <span>{deptsPassed}/{deptsTotal}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(deptsPassed / deptsTotal) * 100}%` }}
          />
        </div>
      </div>

      {data.draftRef && (
        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle2 size={14} />
          <span>Draft generated</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
    </div>
  );
}
