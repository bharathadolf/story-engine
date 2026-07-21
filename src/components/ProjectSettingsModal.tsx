import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Sliders, Palette, Grid } from 'lucide-react';
import useProjectStore, { ProjectMeta } from '../store/projectStore.js';
import useGraphStore from '../store/graphStore.js';

interface ProjectSettingsModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function ProjectSettingsModal({ projectId, isOpen, onClose, onDeleted }: ProjectSettingsModalProps) {
  const { projects, updateProjectMeta, deleteProject } = useProjectStore();
  const { snapToGrid, setSnapToGrid } = useGraphStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [logline, setLogline] = useState('');
  const [coverColor, setCoverColor] = useState('#7c3aed');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setGenre(currentProject.genre || '');
      setLogline(currentProject.logline || '');
      setCoverColor(currentProject.coverColor || '#7c3aed');
    }
  }, [currentProject, isOpen]);

  if (!isOpen || !currentProject) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProjectMeta(projectId, {
        name,
        genre,
        logline,
        coverColor
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this project? This will permanently delete all nodes, draft scripts, and custom settings override files, and cannot be undone!')) {
      try {
        await deleteProject(projectId);
        onClose();
        if (onDeleted) onDeleted();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const colors = [
    '#7c3aed', // Purple
    '#2563eb', // Blue
    '#059669', // Emerald
    '#db2777', // Pink
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#374151'  // Gray
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Sliders size={20} className="text-purple-600" />
            <h2 className="font-bold text-xl">Project Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wide">Project Title</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="e.g. Ironsong"
            />
          </div>

          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wide">Genre / Format</label>
            <input 
              type="text" 
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm"
              placeholder="e.g. Sci-Fi/Dark Fantasy TV Series"
            />
          </div>

          {/* Logline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wide">Premise Logline</label>
            <textarea 
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm resize-none leading-relaxed"
              placeholder="Provide a brief, compelling summary of the central dramatic narrative hook."
            />
          </div>

          {/* Color theme picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wide flex items-center gap-1">
              <Palette size={14} />
              <span>Cover Accent Color</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoverColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    coverColor === c ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Canvas Preferences */}
          <div className="border-t border-slate-100 pt-5 mt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wide flex items-center gap-1.5">
              <Grid size={14} className="text-purple-600" />
              <span>Canvas Preferences</span>
            </h4>
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-sm font-semibold text-slate-850 block">Snap to Grid</span>
                <span className="text-xs text-slate-500">Automatically align script elements on a tidy visual grid.</span>
              </div>
              <button
                type="button"
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer outline-none focus:ring-2 focus:ring-purple-200 ${
                  snapToGrid ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    snapToGrid ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Delete section */}
          <div className="border-t border-slate-100 pt-5 mt-5">
            <div className="bg-red-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-red-800">Danger Zone</h4>
                <p className="text-xs text-red-600 mt-0.5">Delete this screenplay project and all assets permanently.</p>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Save size={13} />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
