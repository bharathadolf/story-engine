import React from 'react';
import { CheckCircle2, AlertCircle, Play, Sparkles } from 'lucide-react';

interface DepartmentChecklistProps {
  departmentsPassed: string[];
  onRunPass: (dept: string) => void;
  isRunningPass: boolean;
  runningDept: string | null;
}

export default function DepartmentChecklist({
  departmentsPassed,
  onRunPass,
  isRunningPass,
  runningDept
}: DepartmentChecklistProps) {
  
  const departments = [
    { key: 'dialogue', label: 'Dialogue Pass', desc: 'Checks voice, subtext, and realistic lines' },
    { key: 'structure', label: 'Structure & Turn', desc: 'Verifies dramatic goals, obstacle and scene turn' },
    { key: 'character', label: 'Character Arc', desc: 'Validates wants, needs, wounds, and flaws' },
    { key: 'world-lore', label: 'World Lore', desc: 'Evaluates continuity, setups & geographical rules' },
    { key: 'tone', label: 'Tone Contract', desc: 'Assesses pacing rhythm and emotional register' },
    { key: 'action-visual', label: 'Spectacle / Blocking', desc: 'Checks physical spacing, clarity and spectacle flow' }
  ];

  return (
    <div className="space-y-3.5 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4.5 mt-2">
      <div className="flex items-center gap-1.5 border-b border-zinc-900/80 pb-2.5 mb-1.5">
        <Sparkles size={13} className="text-amber-500 fill-amber-500/10 animate-pulse" />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Writers Room Critiques</h4>
      </div>

      <div className="space-y-2">
        {departments.map((dept) => {
          const isPassed = departmentsPassed.includes(dept.key);
          const isCurrentRunning = isRunningPass && runningDept === dept.key;

          return (
            <div 
              key={dept.key}
              className="flex items-center justify-between gap-3 text-xs p-3 rounded-xl bg-zinc-950 border border-zinc-900/60 shadow-sm"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  {isPassed ? (
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={13} className="text-zinc-600 flex-shrink-0" />
                  )}
                  <span className={`font-semibold text-xs text-zinc-300 ${isPassed ? 'text-emerald-400' : ''}`}>
                    {dept.label}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5 pl-4.5 font-light">{dept.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => onRunPass(dept.key)}
                disabled={isRunningPass}
                className={`flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isPassed 
                    ? 'border-emerald-900 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50 hover:border-emerald-800'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-800'
                } disabled:opacity-40`}
              >
                {isCurrentRunning ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                    Critiquing...
                  </span>
                ) : (
                  <>
                    <Play size={8} className="fill-current" />
                    <span>Run pass</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
