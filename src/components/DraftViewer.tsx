import React, { useState, useEffect } from 'react';
import { Eye, Edit3, Lock, Unlock, ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

interface Version {
  versionNumber: number;
  text: string;
  generatedAt: string;
  departmentsRun?: string[];
}

interface DraftViewerProps {
  versions: Version[];
  currentVersion: number;
  locked: boolean;
  onTextChange: (newText: string) => void;
  onLockToggle: () => void;
  onVersionChange: (ver: number) => void;
  annotations?: Record<string, string>; // e.g. { dialogue: "annotations content" }
}

export default function DraftViewer({
  versions,
  currentVersion,
  locked,
  onTextChange,
  onLockToggle,
  onVersionChange,
  annotations = {}
}: DraftViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'critique'>('text');

  const currentVerData = versions[currentVersion - 1];
  const versionsCount = versions.length;

  useEffect(() => {
    if (currentVerData) {
      setDraftText(currentVerData.text);
    }
  }, [currentVerData, currentVersion]);

  const handleSave = () => {
    onTextChange(draftText);
    setIsEditing(false);
  };

  // Compile annotations text
  const annotationsList = Object.entries(annotations).filter(([_, val]) => !!val);

  return (
    <div className="flex flex-col h-full border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl">
      
      {/* Viewer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-900 z-10">
        <div className="flex items-center gap-1.5">
          {/* Version Switcher */}
          <button
            onClick={() => onVersionChange(currentVersion - 1)}
            disabled={currentVersion <= 1}
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-[11px] font-semibold text-zinc-300 select-none uppercase tracking-wide">
            Draft {currentVersion}/{versionsCount || 1}
          </span>
          <button
            onClick={() => onVersionChange(currentVersion + 1)}
            disabled={currentVersion >= versionsCount}
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md transition ${
                activeTab === 'text' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-350'
              } cursor-pointer`}
            >
              Script
            </button>
            <button
              onClick={() => setActiveTab('critique')}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md transition flex items-center gap-1 relative ${
                activeTab === 'critique' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-350'
              } cursor-pointer`}
            >
              <span>Feedback</span>
              {annotationsList.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="w-[1px] h-4 bg-zinc-900" />

          {/* Edit/View toggle */}
          {activeTab === 'text' && !locked && (
            isEditing ? (
              <button
                onClick={handleSave}
                className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg shadow-sm transition cursor-pointer"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 rounded-lg text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <Edit3 size={11} />
                <span>Edit</span>
              </button>
            )
          )}

          {/* Lock toggle */}
          <button
            onClick={onLockToggle}
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer ${
              locked 
                ? 'bg-emerald-950/30 border border-emerald-900 text-emerald-400 hover:border-emerald-700' 
                : 'border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-900'
            }`}
          >
            {locked ? (
              <>
                <Lock size={11} className="text-emerald-400" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Unlock size={11} />
                <span>Lock</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Viewer Main Content Sheet */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex justify-center bg-zinc-950/40">
        {activeTab === 'text' ? (
          isEditing ? (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full max-w-[560px] min-h-[360px] h-full bg-[#0A0A0B] border border-zinc-850 rounded-xl p-5 md:p-6 shadow-2xl font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none focus:border-zinc-750 resize-none select-text"
              placeholder="Start drafting screenplay lines directly or click 'Generate Draft' in the sidebar scene block settings..."
            />
          ) : (
            <div className="w-full max-w-[560px] bg-[#0A0A0B] border border-zinc-900 rounded-xl p-6 md:p-8 shadow-2xl font-mono text-xs md:text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap select-text break-words">
              {currentVerData?.text ? (
                currentVerData.text
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <AlertCircle size={20} className="text-zinc-700" />
                  <p className="text-zinc-500 font-sans italic max-w-xs leading-normal text-xs font-light">
                    This scene draft is currently empty. Click 'Generate' or edit this block directly.
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          /* Critique Tab */
          <div className="w-full max-w-[560px] space-y-3.5">
            {annotationsList.length > 0 ? (
              annotationsList.map(([dept, review]) => (
                <div key={dept} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-900/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-500/90">
                      {dept} critique report
                    </span>
                    <MessageSquare size={12} className="text-amber-500" />
                  </div>
                  <div className="p-4 font-sans text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-text font-light">
                    {review}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <MessageSquare size={20} className="text-zinc-750" />
                <p className="text-zinc-500 italic font-sans max-w-xs leading-normal text-xs font-light">
                  No critique passes run yet. Choose 'Run pass' in the scene block settings to critique dialogue, continuity, or structures!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
