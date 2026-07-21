import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Lock, Unlock } from 'lucide-react';
import useSidebarStore from '../../store/sidebarStore.js';

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

  const currentVer = data.currentVersion || 1;
  const versionsCount = data.versions?.length || 0;
  const activeVerText = data.versions?.[currentVer - 1]?.text || '';
  const wordCount = activeVerText.trim() ? activeVerText.trim().split(/\s+/).length : 0;

  return (
    <div
      onClick={() => openInspector(id, 'draft')}
      className={`bg-white border-2 rounded-xl p-4 min-w-[210px] max-w-[250px] shadow-lg transition-all hover:shadow-xl cursor-pointer border-l-4 border-l-slate-600 ${
        selected ? 'border-slate-600 ring-2 ring-slate-100' : 'border-slate-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />
      
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
        <div className="flex items-center gap-2 text-slate-700">
          <FileText size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Draft v{currentVer}</span>
        </div>
        <div className="flex items-center gap-1">
          {data.locked ? (
            <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Lock size={10} /> Locked
            </span>
          ) : (
            <span className="text-[10px] bg-slate-50 text-slate-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Unlock size={10} /> Draft
            </span>
          )}
        </div>
        <span className="text-[8px] bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Plot
        </span>
      </div>

      <div className="space-y-2">
        {wordCount > 0 ? (
          <p className="text-xs text-gray-500 line-clamp-3 font-mono leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
            {activeVerText}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">No text generated yet</p>
        )}

        <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
          <span>Words: {wordCount}</span>
          <span>Versions: {versionsCount}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-3 !h-3" />
    </div>
  );
}
