import React, { useEffect } from 'react';
import useProjectStore from './store/projectStore.js';
import ProjectCanvas from './pages/ProjectCanvas.js';

export default function AppTest() {
  const { setActiveProjectId, fetchProjects } = useProjectStore() as any;

  useEffect(() => {
    fetchProjects().then(() => {
      setActiveProjectId('proj-test-sandbox');
    });
  }, []);

  const handleBackToDashboard = () => {
    console.log('Dashboard navigation bypassed in developer testbed server.');
  };

  return (
    <div className="w-screen min-h-screen bg-[#0A0A0A] overflow-x-hidden text-[#F5F5F5] font-sans relative">
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-zinc-800/20 blur-[120px] pointer-events-none"></div>
      
      <ProjectCanvas 
        projectId="proj-test-sandbox" 
        onBackToDashboard={handleBackToDashboard} 
      />
    </div>
  );
}
