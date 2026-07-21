import React, { useState, useMemo } from 'react';
import { ShieldAlert, Heart, TrendingUp, ChevronUp, ChevronDown, CheckCircle, Activity, Sparkles, AlertTriangle } from 'lucide-react';
import useGraphStore from '../store/graphStore.js';

export default function DiagnosticPanel() {
  const { nodes, edges, autoLayout } = useGraphStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamic calculations for Graph Diagnostics
  const stats = useMemo(() => {
    const totalNodes = nodes.length;
    const totalConnections = edges.length;

    if (totalNodes === 0) {
      return {
        score: 100,
        isolatedCount: 0,
        missingFieldsCount: 0,
        hasBible: false,
        suggestions: ["Spawn your first block! Press '1' for a Story Bible, or drag elements onto the canvas."],
        level: 'excellent' as const
      };
    }

    const suggestions: string[] = [];
    let deductions = 0;

    // 1. Story Bible Check
    const bibleNodes = nodes.filter(n => n.type === 'bible');
    const hasBible = bibleNodes.length > 0;
    if (!hasBible) {
      deductions += 15;
      suggestions.push("Thematic Core: Create a Story Bible node (Press '1') to set the logline and thematic foundation.");
    }

    // 2. Isolated Nodes Check
    let isolatedCount = 0;
    nodes.forEach(node => {
      const isConnected = edges.some(e => e.source === node.id || e.target === node.id);
      if (!isConnected && node.type !== 'bible') { // bible can sometimes be isolated initially
        isolatedCount++;
        const nodeLabel = node.data?.name || node.data?.title || node.data?.slugline || node.type;
        suggestions.push(`Establish Flow: Connect isolated "${nodeLabel}" block to other storyline elements.`);
      }
    });
    deductions += Math.min(isolatedCount * 10, 30); // Max 30 point deduction for isolated nodes

    // 3. Missing Fields Check
    let missingFieldsCount = 0;
    nodes.forEach(node => {
      const d = node.data || {};
      let isMissing = false;
      if (node.type === 'character' && (!d.name || d.name === 'Unnamed Character')) isMissing = true;
      if (node.type === 'scene' && (!(d.slugline as string) || (d.slugline as string).includes('UNNAMED'))) isMissing = true;
      if (node.type === 'act' && !d.summary) isMissing = true;
      if (node.type === 'beat' && !d.headline && !d.action) isMissing = true;

      if (isMissing) {
        missingFieldsCount++;
      }
    });
    deductions += Math.min(missingFieldsCount * 5, 20); // Max 20 point deduction for missing fields
    if (missingFieldsCount > 0) {
      suggestions.push(`Refine Details: Fill in critical properties for ${missingFieldsCount} unnamed/blank block(s).`);
    }

    // 4. Casting Check
    const characters = nodes.filter(n => n.type === 'character');
    const scenes = nodes.filter(n => n.type === 'scene');
    if (characters.length > 0 && scenes.length > 0) {
      const castedCount = scenes.filter(s => s.data?.characters && (s.data.characters as string[]).length > 0).length;
      if (castedCount === 0) {
        deductions += 10;
        suggestions.push("Casting: Select scene nodes and check characters in the inspector to cast them.");
      }
    }

    // 5. Drafting Check
    if (scenes.length > 0) {
      const draftsCount = nodes.filter(n => n.type === 'draft').length;
      if (draftsCount === 0) {
        deductions += 10;
        suggestions.push("Drafting: Select a Scene and click 'Generate Draft' in the inspector to write the screenplay script.");
      }
    }

    // 6. Organization Check
    if (totalNodes > 10 && totalConnections > 10) {
      suggestions.push("Optimize Layout: Canvas is growing dense. Run 'Auto-Layout' to keep your storyboard perfectly aligned.");
    }

    const rawScore = 100 - deductions;
    const score = Math.max(rawScore, 10); // Floor at 10

    let level: 'danger' | 'warning' | 'excellent' = 'excellent';
    if (score < 50) level = 'danger';
    else if (score < 80) level = 'warning';

    return {
      score,
      isolatedCount,
      missingFieldsCount,
      hasBible,
      suggestions,
      level
    };
  }, [nodes, edges]);

  const scoreColor = {
    danger: 'text-rose-500 stroke-rose-500',
    warning: 'text-amber-500 stroke-amber-500',
    excellent: 'text-emerald-500 stroke-emerald-500'
  }[stats.level];

  const scoreBg = {
    danger: 'bg-rose-950/20 border-rose-900/30',
    warning: 'bg-amber-950/20 border-amber-900/30',
    excellent: 'bg-emerald-950/20 border-emerald-900/30'
  }[stats.level];

  return (
    <div className="absolute bottom-4 right-4 z-40 w-80 bg-zinc-950/95 border border-zinc-900 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300">
      
      {/* Mini Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-900/50 transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className={scoreColor} />
          <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-300">
            Graph Diagnostics
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Health Indicator */}
          <span className={`text-xs font-mono font-bold ${scoreColor}`}>
            {stats.score}% Health
          </span>
          {isExpanded ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronUp size={14} className="text-zinc-500" />}
        </div>
      </button>

      {/* Expanded Metrics Area */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-900/50 space-y-4 max-h-[320px] overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Summary Health Panel */}
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${scoreBg}`}>
            <div className="relative flex items-center justify-center">
              {/* Circular Health Meter */}
              <svg className="w-11 h-11 transform -rotate-90">
                <circle cx="22" cy="22" r="18" fill="transparent" stroke="#1f1f23" strokeWidth="3" />
                <circle 
                  cx="22" 
                  cy="22" 
                  r="18" 
                  fill="transparent" 
                  stroke={stats.level === 'danger' ? '#f43f5e' : stats.level === 'warning' ? '#f59e0b' : '#10b981'} 
                  strokeWidth="3" 
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - stats.score / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-zinc-100">{stats.score}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide">
                {stats.level === 'danger' ? 'Fragmented Narrative' : stats.level === 'warning' ? 'Refinements Needed' : 'Structured Flow'}
              </h4>
              <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">
                {nodes.length} Screenplay Blocks with {edges.length} connections.
              </p>
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-[#09090b] border border-zinc-900 rounded-lg p-2.5">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold">Isolated Nodes</span>
              <span className="block text-sm font-mono font-bold text-zinc-200 mt-0.5">{stats.isolatedCount}</span>
            </div>
            <div className="bg-[#09090b] border border-zinc-900 rounded-lg p-2.5">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold">Incomplete Nodes</span>
              <span className="block text-sm font-mono font-bold text-zinc-200 mt-0.5">{stats.missingFieldsCount}</span>
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="space-y-2">
            <h5 className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              <span>Diagnostic Recommendations</span>
            </h5>
            
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {stats.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex gap-2 text-[10px] leading-relaxed text-zinc-400 font-light bg-[#09090b] border border-zinc-900/40 p-2 rounded-lg">
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span>{suggestion}</span>
                </div>
              ))}
              {stats.suggestions.length === 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/10 border border-emerald-950 p-2.5 rounded-lg">
                  <CheckCircle size={12} className="shrink-0" />
                  <span>Excellent! No issues detected. Your screenplay graph is fully sound and balanced!</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Organize Trigger */}
          {nodes.length > 0 && (
            <button
              onClick={() => {
                autoLayout();
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] uppercase tracking-wider font-bold py-2 rounded-xl transition cursor-pointer select-none"
            >
              <Activity size={12} className="text-purple-400" />
              <span>Execute Symmetrical Splay Auto-Layout</span>
            </button>
          )}

        </div>
      )}

    </div>
  );
}
