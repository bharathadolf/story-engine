import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Save, 
  BookOpen, 
  User, 
  GitBranch, 
  Sliders, 
  Film, 
  Settings, 
  HelpCircle, 
  Check, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface SkillEditorProps {
  projectId: string;
}

const SKILL_LIST = [
  { key: 'structure', label: 'Structure', fullName: 'Structure Guidelines', desc: 'Beat sheet formulas, dramatic acts, and scene turn criteria.', icon: GitBranch },
  { key: 'character', label: 'Character', fullName: 'Character Rules', desc: 'Want/need/wound/flaw guidelines and subtext criteria.', icon: User },
  { key: 'dialogue', label: 'Dialogue', fullName: 'Dialogue Voice', desc: 'Subtext markers, sentence styling, and voice differentiation rules.', icon: MessageSquare },
  { key: 'world-lore', label: 'World Lore', fullName: 'World Lore Setting', desc: 'Setting constraints, world-rules adherence, and lore checks.', icon: BookOpen },
  { key: 'tone', label: 'Tone', fullName: 'Tonal Consistency', desc: 'Pacing controls, emotional ranges, and genre styling guides.', icon: Sliders },
  { key: 'action-visual', label: 'Action/Visual', fullName: 'Action & Spectacle', desc: 'Physical blocking rules, visual clarity guides, and spectacle flow.', icon: Film },
  { key: 'format', label: 'Format', fullName: 'Screenplay Formatting', desc: 'Industry sluglines, capitalization, indentation, and margins.', icon: Settings }
];

export default function SkillEditor({ projectId }: SkillEditorProps) {
  const [activeSkill, setActiveSkill] = useState('dialogue');
  const [content, setContent] = useState('');
  const [isOverride, setIsOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  const fetchSkillContent = async (skillKey: string) => {
    setIsLoading(true);
    setSaveStatus('idle');
    try {
      const res = await fetch(`/api/projects/${projectId}/skills/${skillKey}`);
      if (!res.ok) throw new Error('Failed to fetch skill');
      const data = await res.json();
      setContent(data.content || '');
      setIsOverride(data.isOverride || false);
    } catch (err) {
      console.error(err);
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillContent(activeSkill);
  }, [projectId, activeSkill]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch(`/api/projects/${projectId}/skills/${activeSkill}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to save override');
      setIsOverride(true);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const activeSkillObj = SKILL_LIST.find(s => s.key === activeSkill) || SKILL_LIST[2];
  const ActiveIcon = activeSkillObj.icon;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Skill list tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-900 bg-zinc-950/80 p-1.5 gap-1 scrollbar-thin">
        {SKILL_LIST.map((skill) => {
          const Icon = skill.icon;
          const isSelected = activeSkill === skill.key;
          return (
            <button
              key={skill.key}
              onClick={() => setActiveSkill(skill.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white border border-zinc-800 shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              <Icon size={11} className={isSelected ? 'text-zinc-300' : 'text-zinc-600'} />
              <span>{skill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-900 overflow-hidden">
        
        {/* Left Side: Skill meta description & Explanation */}
        <div className="p-4 md:w-60 flex-shrink-0 flex flex-col justify-between space-y-4 overflow-y-auto bg-zinc-950/40">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white">
                <ActiveIcon size={15} className="text-zinc-400" />
                <h3 className="font-serif italic text-base">
                  {activeSkillObj.fullName}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                {activeSkillObj.desc}
              </p>
            </div>

            {showHowItWorks && (
              <div className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-900/80 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-zinc-400 flex items-center gap-1">
                    <HelpCircle size={10} />
                    How this works
                  </span>
                  <button 
                    onClick={() => setShowHowItWorks(false)}
                    className="text-[9px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
                  >
                    hide
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
                  These rules act as a <strong>semantic steering engine</strong> for your script. When you draft scenes, create narrative beats, or run quality audits, the Gemini model reads these exact guidelines to control subtext, voice, setting lore, and pacing.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-zinc-900">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOverride ? 'bg-amber-400' : 'bg-zinc-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOverride ? 'bg-amber-500' : 'bg-zinc-600'}`}></span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                {isOverride ? 'Active Custom Override' : 'Global System Rules'}
              </span>
            </div>

            {isOverride ? (
              <p className="text-[10px] text-amber-500/90 leading-relaxed bg-amber-950/20 p-2 rounded-xl border border-amber-950">
                This project is using custom rules. Changes are written to your isolated script folder.
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 leading-relaxed bg-zinc-900/10 p-2 rounded-xl border border-zinc-900/40 font-light">
                Currently using system default rules. Saving any edit will automatically lock in a project-specific override.
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 text-black disabled:text-zinc-600 text-[10px] uppercase tracking-widest font-bold py-2.5 px-4 rounded-full shadow-lg transition-all cursor-pointer"
            >
              <Save size={12} />
              <span>{isSaving ? 'Saving...' : 'Save Override'}</span>
            </button>

            {saveStatus === 'success' && (
              <div className="text-[10px] text-emerald-500 font-medium text-center flex items-center justify-center gap-1 bg-emerald-950/10 py-1 rounded-lg border border-emerald-950/50">
                <Check size={10} />
                <span>Override synchronized!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="text-[10px] text-red-400 font-medium text-center flex items-center justify-center gap-1 bg-red-950/10 py-1 rounded-lg border border-red-950/50">
                <AlertCircle size={10} />
                <span>Failed to save changes.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Text Editor Sheet */}
        <div className="flex-1 flex flex-col min-h-[300px] bg-[#0E0E10]">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-zinc-500">
              <div className="w-5 h-5 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
              <span className="text-[10px] uppercase tracking-wider italic font-light">Loading rules markdown...</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative h-full">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full h-full p-6 font-mono text-[11px] md:text-xs leading-relaxed text-zinc-300 bg-[#0A0A0B] focus:outline-none focus:ring-0 resize-none select-text border-0"
                placeholder="# Set your custom rules or guidelines here..."
              />
              <div className="absolute bottom-3 right-4 px-2 py-1 bg-zinc-900/60 border border-zinc-850 rounded-md text-[9px] font-mono text-zinc-500 select-none">
                Markdown Supported
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

