import React, { useEffect } from 'react';
import useProjectStore from './store/projectStore.js';
import ProjectDashboard from './pages/ProjectDashboard.js';
import ProjectCanvas from './pages/ProjectCanvas.js';

export default function App() {
  const { activeProjectId, setActiveProjectId, fetchProjects } = useProjectStore() as any;

  useEffect(() => {
    // Bootstrap projects database on startup
    fetchProjects().then(() => {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project') || params.get('projectId');
      if (projectId) {
        setActiveProjectId(projectId);
      }
    });
  }, []);

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('project', id);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToDashboard = () => {
    setActiveProjectId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    url.searchParams.delete('projectId');
    window.history.pushState({}, '', url.pathname);
  };

  return (
    <div className="w-screen min-h-screen bg-[#0A0A0A] overflow-x-hidden text-[#F5F5F5] font-sans relative">
      {/* Background Accent Gradient */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-zinc-800/20 blur-[120px] pointer-events-none"></div>
      
      {activeProjectId ? (
        <ProjectCanvas 
          projectId={activeProjectId} 
          onBackToDashboard={handleBackToDashboard} 
        />
      ) : (
        <ProjectDashboard 
          onOpenProject={handleOpenProject} 
        />
      )}
    </div>
  );
}
