import React, { useState, useEffect } from 'react';
import { X, Sparkles, HelpCircle, Lock, Book, User, Settings, ArrowRight, MessageSquare, Plus, Trash2, Layers, Film, ListOrdered, FileText, GitBranch, Save, Check, Play, Terminal, Code, Cpu } from 'lucide-react';
import useSidebarStore from '../store/sidebarStore.js';
import useGraphStore from '../store/graphStore.js';
import useProjectStore from '../store/projectStore.js';
import { useLibraryStore } from '../store/libraryStore.js';
import DepartmentChecklist from './DepartmentChecklist.js';
import DraftViewer from './DraftViewer.js';

export default function Sidebar() {
  const { selectedNodeId, selectedNodeType, closeInspector } = useSidebarStore();
  const { nodes, edges, updateNodeData, deleteNode, saveGraph, addNode, onEdgesChange } = useGraphStore();
  const { activeProjectId } = useProjectStore();

  const [localData, setLocalData] = useState<any>({});
  const [isRunningPass, setIsRunningPass] = useState(false);
  const [runningDept, setRunningDept] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuestioning, setIsQuestioning] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'dev-console'>('details');

  // Dev Console States
  const [devCallType, setDevCallType] = useState<'generate' | 'brainstorm' | 'question' | 'department'>('generate');
  const [devDepartment, setDevDepartment] = useState<string>('dialogue');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDevRunning, setIsDevRunning] = useState(false);
  const [devResult, setDevResult] = useState<any>(null);
  const [assembledSystemPrompt, setAssembledSystemPrompt] = useState('');
  const [assembledUserPrompt, setAssembledUserPrompt] = useState('');
  const [devPromptTab, setDevPromptTab] = useState<'system' | 'user'>('system');

  const fetchDevPrompts = async () => {
    if (!selectedNodeId) return;
    setIsPreviewing(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/test-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNodeId: selectedNodeId,
          graph: { nodes, edges },
          callType: devCallType,
          department: devCallType === 'department' ? devDepartment : null
        })
      });
      if (!res.ok) throw new Error('Failed to assemble prompts');
      const data = await res.json();
      setAssembledSystemPrompt(data.systemPrompt);
      setAssembledUserPrompt(data.userPrompt);
    } catch (err: any) {
      console.error(err);
      alert('Error fetching prompts: ' + err.message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const executeDevCall = async () => {
    if (!selectedNodeId) return;
    setIsDevRunning(true);
    setDevResult(null);
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/test-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNodeId: selectedNodeId,
          graph: { nodes, edges },
          callType: devCallType,
          department: devCallType === 'department' ? devDepartment : null
        })
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setAssembledSystemPrompt(data.systemPrompt);
      setAssembledUserPrompt(data.userPrompt);
      setDevResult(data.response);
    } catch (err: any) {
      console.error(err);
      setDevResult(`Execution Error: ${err.message}`);
    } finally {
      setIsDevRunning(false);
    }
  };

  // Custom node template saving states
  const [showSaveTpl, setShowSaveTpl] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplSavedSuccess, setTplSavedSuccess] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedNodes = nodes.filter(n => n.selected);

  // Sync state with selected node and prefill template saving values
  useEffect(() => {
    if (selectedNode) {
      setLocalData(JSON.parse(JSON.stringify(selectedNode.data || {})));
      setShowSaveTpl(false);
      setTplSavedSuccess(false);
      
      const nodeName = selectedNode.data?.name || selectedNode.data?.title || selectedNode.data?.slugline || '';
      const fallbackName = selectedNodeType ? selectedNodeType.charAt(0).toUpperCase() + selectedNodeType.slice(1) : 'Node';
      setTplName(nodeName ? `${nodeName}` : `${fallbackName} Template`);
      setTplDesc(`Custom saved ${selectedNodeType || 'block'} template.`);
    }
  }, [selectedNodeId, selectedNode]);

  // Auto-sync single selection to the inspector store
  useEffect(() => {
    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      if (selectedNodeId !== node.id) {
        useSidebarStore.getState().openInspector(node.id, node.type);
      }
    } else if (selectedNodes.length === 0) {
      if (selectedNodeId !== null) {
        closeInspector();
      }
    }
  }, [selectedNodes.length, selectedNodeId]);

  if (!activeProjectId) return null;

  const handleUpdateField = (field: string, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, updated);
    }
  };

  const handleUpdateNestedField = (parentField: string, childField: string, value: any) => {
    const updatedParent = { ...(localData[parentField] || {}), [childField]: value };
    const updated = { ...localData, [parentField]: updatedParent };
    setLocalData(updated);
    if (selectedNodeId) {
      updateNodeData(selectedNodeId, updated);
    }
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      if (window.confirm('Delete this node from your graph? All connection lines will be severed.')) {
        deleteNode(selectedNodeId);
        closeInspector();
      }
    }
  };

  const handleAutoQuestion = async () => {
    if (!selectedNodeId || isQuestioning) return;
    setIsQuestioning(true);
    try {
      // Save current state first
      await saveGraph();

      const res = await fetch(`/api/projects/${activeProjectId}/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNodeId: selectedNodeId,
          graph: { nodes, edges }
        })
      });

      if (!res.ok) throw new Error('Question call failed');
      const data = await res.json();
      
      let parsedQuestion = { promptText: '', options: [], affectsField: '' };
      try {
        parsedQuestion = JSON.parse(data.text);
      } catch {
        // Fallback if model didn't return perfect JSON
        parsedQuestion = {
          promptText: data.text,
          options: ['Yes, continue', 'No, alter direction', 'Introduce a complication'],
          affectsField: 'turn'
        };
      }

      // Add a QuestionNode near the SceneNode
      const sceneNode = nodes.find(n => n.id === selectedNodeId);
      const position = sceneNode 
        ? { x: sceneNode.position.x - 240, y: sceneNode.position.y + 100 }
        : { x: 100, y: 100 };

      const questionId = addNode('question', position, {
        promptText: parsedQuestion.promptText,
        options: parsedQuestion.options,
        affectsField: parsedQuestion.affectsField || 'turn',
        affectsNodeRef: selectedNodeId,
        locked: false,
        answer: null
      });

      // Connect Scene -> Question on canvas
      setTimeout(() => {
        const { onConnect } = useGraphStore.getState();
        onConnect({ source: selectedNodeId, target: questionId, sourceHandle: null, targetHandle: null });
      }, 300);

      alert('Narrative Decision Node generated! It has been connected to your scene. Please answer it on the canvas to resolve story directions.');
    } catch (err: any) {
      console.error(err);
      alert('Error generating story question: ' + err.message);
    } finally {
      setIsQuestioning(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!selectedNodeId || isGenerating) return;
    setIsGenerating(true);
    try {
      await saveGraph();

      const res = await fetch(`/api/projects/${activeProjectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNodeId: selectedNodeId,
          graph: { nodes, edges }
        })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();

      const sceneNode = nodes.find(n => n.id === selectedNodeId);
      const position = sceneNode 
        ? { x: sceneNode.position.x + 280, y: sceneNode.position.y }
        : { x: 300, y: 100 };

      // Check if a DraftNode is already connected
      let draftNode = nodes.find(n => n.type === 'draft' && n.data.sceneRef === selectedNodeId);
      
      if (!draftNode) {
        // Spawn a fresh DraftNode
        const newDraftId = addNode('draft', position, {
          sceneRef: selectedNodeId,
          versions: [
            {
              versionNumber: 1,
              text: data.text,
              generatedAt: new Date().toISOString(),
              departmentsRun: []
            }
          ],
          currentVersion: 1,
          departmentAnnotations: {},
          locked: false
        });

        // Update SceneNode reference
        updateNodeData(selectedNodeId, { draftRef: newDraftId });

        // Connect Scene -> Draft
        setTimeout(() => {
          const { onConnect } = useGraphStore.getState();
          onConnect({ source: selectedNodeId, target: newDraftId, sourceHandle: null, targetHandle: null });
        }, 300);
      } else {
        // Append a new version to the existing DraftNode
        const nextVerNum = ((draftNode.data as any).versions?.length || 0) + 1;
        const updatedVersions = [
          ...((draftNode.data as any).versions || []),
          {
            versionNumber: nextVerNum,
            text: data.text,
            generatedAt: new Date().toISOString(),
            departmentsRun: []
          }
        ];
        
        updateNodeData(draftNode.id, {
          versions: updatedVersions,
          currentVersion: nextVerNum
        });
      }

      alert('Screenplay draft generated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error generating draft: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunPass = async (dept: string) => {
    // Find associated draft node
    const draftNode = nodes.find(n => n.type === 'draft' && n.data.sceneRef === selectedNodeId);
    if (!draftNode) {
      alert('Please generate a screenplay draft first before running a Writers Room critique pass!');
      return;
    }

    setIsRunningPass(true);
    setRunningDept(dept);
    try {
      await saveGraph();

      const res = await fetch(`/api/projects/${activeProjectId}/department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNodeId: selectedNodeId,
          department: dept,
          graph: { nodes, edges }
        })
      });

      if (!res.ok) throw new Error('Critique pass failed');
      const data = await res.json();

      // Parse the standard department annotations response: [ANNOTATIONS]...[/ANNOTATIONS] [REVISED_DRAFT]...[/REVISED_DRAFT]
      const text = data.text;
      let annotations = '';
      let revisedDraft = '';

      const annotationsMatch = text.match(/\[ANNOTATIONS\]([\s\S]*?)\[\/ANNOTATIONS\]/);
      const draftMatch = text.match(/\[REVISED_DRAFT\]([\s\S]*?)\[\/REVISED_DRAFT\]/);

      if (annotationsMatch) annotations = annotationsMatch[1].trim();
      if (draftMatch) revisedDraft = draftMatch[1].trim();

      // If matches failed, fallback to treating the entire output as annotations or draft
      if (!annotations && !revisedDraft) {
        annotations = text;
      }

      // Update draft node: update departmentAnnotations, append revisedDraft as a new version
      const currentAnnotations = (draftNode.data as any).departmentAnnotations || {};
      const updatedAnnotations = { ...currentAnnotations, [dept]: annotations };

      const currentVerNum = (draftNode.data as any).versions?.length || 1;
      const baseText = (draftNode.data as any).versions?.[currentVerNum - 1]?.text || '';
      
      const nextVerNum = currentVerNum + 1;
      const updatedVersions = [
        ...((draftNode.data as any).versions || []),
        {
          versionNumber: nextVerNum,
          text: revisedDraft || baseText, // Use revised text or base if model only provided annotations
          generatedAt: new Date().toISOString(),
          departmentsRun: [...((draftNode.data as any).versions?.[currentVerNum - 1]?.departmentsRun || []), dept]
        }
      ];

      updateNodeData(draftNode.id, {
        departmentAnnotations: updatedAnnotations,
        versions: updatedVersions,
        currentVersion: nextVerNum
      });

      // Update SceneNode departmentsPassed checklist
      const passed = localData.departmentsPassed || [];
      if (!passed.includes(dept)) {
        handleUpdateField('departmentsPassed', [...passed, dept]);
      }

      alert(`${dept.toUpperCase()} Department critique completed! You can read their feedback in the "Feedback" tab.`);
    } catch (err: any) {
      console.error(err);
      alert('Critique pass failed: ' + err.message);
    } finally {
      setIsRunningPass(false);
      setRunningDept(null);
    }
  };

  const handleAnswerQuestion = (option: string) => {
    // Lock the decision node
    handleUpdateField('answer', option);
    handleUpdateField('locked', true);
    handleUpdateField('answeredAt', new Date().toISOString());

    // Auto-propagate the decision back to the affected SceneNode
    const affectsNodeId = localData.affectsNodeRef;
    const affectsField = localData.affectsField;

    if (affectsNodeId && affectsField) {
      const affectedNode = nodes.find(n => n.id === affectsNodeId);
      if (affectedNode) {
        const nextData = { ...affectedNode.data, [affectsField]: option };
        updateNodeData(affectsNodeId, nextData);
      }
    }

    alert(`Decision locked! Story context updated.`);
  };

  const charactersList = nodes.filter(n => n.type === 'character');

  return (
    <div className="w-full md:w-[480px] h-full bg-[#0E0E10] border-l border-zinc-900 flex flex-col relative">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950">
        <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-zinc-400">
          {selectedNodeType ? `${selectedNodeType} Inspector` : 'Workspace Inspector'}
        </span>
        <button
          onClick={closeInspector}
          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Container Scrollable */}
      <div className="flex-1 overflow-y-auto bg-[#0E0E10]">
        {selectedNodes.length > 1 ? (
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl shadow-inner">
              <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-purple-400 bg-purple-950/20 border border-purple-900/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Layers size={10} className="animate-pulse" />
                Multi-Selection Group
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 rounded-md">
                {selectedNodes.length} Blocks
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Selected Elements</h4>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {selectedNodes.map(node => {
                  const getNodeIconInline = (type: string) => {
                    switch (type) {
                      case 'bible': return <Book size={13} className="text-purple-400" />;
                      case 'character': return <User size={13} className="text-rose-400" />;
                      case 'strand': return <GitBranch size={13} className="text-teal-400" />;
                      case 'act': return <Layers size={13} className="text-blue-400" />;
                      case 'sequence': return <ListOrdered size={13} className="text-sky-400" />;
                      case 'scene': return <Film size={13} className="text-amber-400" />;
                      case 'beat': return <Sparkles size={13} className="text-indigo-400" />;
                      case 'question': return <HelpCircle size={13} className="text-pink-400" />;
                      default: return <FileText size={13} className="text-zinc-400" />;
                    }
                  };
                  return (
                    <div key={node.id} className="flex items-center justify-between bg-[#09090b] border border-zinc-900/60 p-2.5 rounded-xl text-xs hover:border-zinc-800 transition duration-200">
                      <div className="flex items-center gap-2 min-w-0">
                        {getNodeIconInline(node.type)}
                        <div className="truncate">
                          <p className="font-semibold text-zinc-200 truncate leading-tight">
                            {node.type === 'bible' && (node.data?.title || 'Story Bible')}
                            {node.type === 'character' && (node.data?.name || 'Unnamed Character')}
                            {node.type === 'scene' && (node.data?.slugline || 'Scene Slugline')}
                            {node.type === 'act' && `Act ${node.data?.actNumber || 'I'}`}
                            {node.type === 'sequence' && (node.data?.name || 'Sequence')}
                            {node.type === 'beat' && (node.data?.headline || `Beat ${node.data?.order || '1'}`)}
                            {node.type === 'draft' && 'Screenplay Draft'}
                            {node.type === 'strand' && (node.data?.name || 'Subplot Strand')}
                            {node.type === 'question' && 'Decision Query'}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5 font-semibold">
                            {node.type} block
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const { nodes } = useGraphStore.getState();
                          nodes.forEach(n => { n.selected = n.id === node.id; });
                          useSidebarStore.getState().openInspector(node.id, node.type);
                        }}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] uppercase tracking-wider font-bold rounded-lg border border-zinc-850 transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bulk Actions Section */}
            <div className="border-t border-zinc-900 pt-5 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Bulk Graph Actions</h4>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    const count = selectedNodes.length;
                    if (confirm(`Are you absolutely sure you want to delete these ${count} selected screenplay blocks? All associated connection lines will be severed.`)) {
                      selectedNodes.forEach(node => {
                        deleteNode(node.id);
                      });
                      closeInspector();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/45 hover:border-red-500 text-[10px] uppercase tracking-wider font-bold py-3 rounded-xl transition cursor-pointer shadow-sm"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedNodes.length} Blocks)</span>
                </button>

                <button
                  onClick={() => {
                    const selectedIds = new Set(selectedNodes.map(n => n.id));
                    const connectedEdges = edges.filter(
                      edge => selectedIds.has(edge.source) || selectedIds.has(edge.target)
                    );

                    if (connectedEdges.length > 0) {
                      if (confirm(`Sever all ${connectedEdges.length} connections to/from selected blocks?`)) {
                        onEdgesChange(connectedEdges.map(ed => ({ id: ed.id, type: 'remove' })));
                      }
                    } else {
                      alert("Selected blocks have no connection lines to sever.");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-850 hover:border-zinc-700 text-[10px] uppercase tracking-wider font-bold py-3 rounded-xl transition cursor-pointer shadow-sm"
                >
                  <Layers size={13} className="text-zinc-500" />
                  <span>Disconnect Selected ({selectedNodes.length} Blocks)</span>
                </button>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-2xl text-[10px] text-zinc-500 font-light leading-relaxed">
              <span className="font-semibold text-zinc-400">Multi-Selection Tip:</span> Hold <kbd className="px-1 py-0.5 bg-zinc-900 rounded text-[9px] font-mono">Shift</kbd> and drag a box on the canvas to select multiple nodes simultaneously. You can also drag selected blocks together to organize.
            </div>
          </div>
        ) : !selectedNodeId ? (
          /* Landing/Empty Inspector state */
          <div className="p-8 text-center h-full flex flex-col items-center justify-center space-y-5 bg-[#0E0E10]">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg text-white">Workspace Inspector</h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mt-1.5 font-light">
                Select any screenplay block node (Bible, Character, Scene, Draft) on the canvas to configure parameters, run department audits, or draft dialogue.
              </p>
            </div>
          </div>
        ) : (
          /* Active Selected Node Form Panels */
          <div className="p-5 space-y-6">
            
            {/* Type Header Badge */}
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl shadow-inner">
              <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-400 bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-full">
                {selectedNodeType} Settings
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-red-400 hover:text-red-300 bg-red-950/10 hover:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-950 transition cursor-pointer"
              >
                <Trash2 size={11} />
                <span>Delete Block</span>
              </button>
            </div>

            {/* Save Node as Template Card Option */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Template Creator</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveTpl(!showSaveTpl)}
                  className="text-[10px] uppercase tracking-wider font-bold text-purple-400 hover:text-purple-300 px-2.5 py-1 rounded bg-purple-950/20 border border-purple-900/35 transition cursor-pointer select-none"
                >
                  {showSaveTpl ? 'Collapse' : 'Save to Library'}
                </button>
              </div>

              {showSaveTpl && (
                <div className="space-y-3 pt-2.5 border-t border-zinc-900/50 animate-in fade-in duration-200">
                  {tplSavedSuccess ? (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-950/10 border border-emerald-950/30 p-2.5 rounded-xl font-semibold">
                      <Check size={12} className="text-emerald-400" />
                      <span>Template saved to Node Library!</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Template Name</label>
                        <input
                          type="text"
                          value={tplName}
                          onChange={(e) => setTplName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 rounded-xl focus:outline-none text-zinc-200"
                          placeholder="e.g. My Custom Character Sheet"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
                        <textarea
                          value={tplDesc}
                          onChange={(e) => setTplDesc(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 rounded-xl focus:outline-none text-zinc-200 resize-none"
                          rows={2}
                          placeholder="What makes this template configuration special?"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!tplName.trim()) {
                            alert('Please provide a name for your template.');
                            return;
                          }
                          const { saveTemplate } = useLibraryStore.getState();
                          saveTemplate(
                            tplName,
                            selectedNodeType || 'custom',
                            tplDesc,
                            selectedNode?.data || {}
                          );
                          setTplSavedSuccess(true);
                          setTimeout(() => {
                            setShowSaveTpl(false);
                            setTplSavedSuccess(false);
                          }, 2000);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-900 text-[10px] uppercase tracking-wider font-bold py-2 rounded-xl transition cursor-pointer"
                      >
                        <Save size={11} />
                        <span>Confirm Save to Library</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* BIBLE NODE FORM */}
            {selectedNodeType === 'bible' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Screenplay Title</label>
                  <input
                    type="text"
                    value={localData.title || ''}
                    onChange={(e) => handleUpdateField('title', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Premise Summary</label>
                  <textarea
                    value={localData.premise || ''}
                    onChange={(e) => handleUpdateField('premise', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Core Theme</label>
                  <input
                    type="text"
                    value={localData.theme || ''}
                    onChange={(e) => handleUpdateField('theme', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-900 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Tonal Contract</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500">Pacing</label>
                      <input
                        type="text"
                        value={localData.toneContract?.pacing || ''}
                        onChange={(e) => handleUpdateNestedField('toneContract', 'pacing', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500">Atmospheric Darkness</label>
                      <input
                        type="text"
                        value={localData.toneContract?.darkness || ''}
                        onChange={(e) => handleUpdateNestedField('toneContract', 'darkness', e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">World & Lore Constraints</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500">Primary Setting</label>
                    <input
                      type="text"
                      value={localData.worldRules?.setting || ''}
                      onChange={(e) => handleUpdateNestedField('worldRules', 'setting', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CHARACTER NODE FORM */}
            {selectedNodeType === 'character' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Roster Role</label>
                  <select
                    value={localData.role || 'protagonist'}
                    onChange={(e) => handleUpdateField('role', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors cursor-pointer font-sans"
                  >
                    <option value="protagonist">Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Want (Conscious Obsession)</label>
                  <input
                    type="text"
                    value={localData.want || ''}
                    onChange={(e) => handleUpdateField('want', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                    placeholder="What they are actively chasing"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Need (Subconscious Growth)</label>
                  <input
                    type="text"
                    value={localData.need || ''}
                    onChange={(e) => handleUpdateField('need', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                    placeholder="What they require to transform"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Wound (Past Trauma)</label>
                  <input
                    type="text"
                    value={localData.wound || ''}
                    onChange={(e) => handleUpdateField('wound', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                    placeholder="Traumatic core catalyst event"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Flaw (Behavioral Defense)</label>
                  <input
                    type="text"
                    value={localData.flaw || ''}
                    onChange={(e) => handleUpdateField('flaw', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                    placeholder="Defensive barrier keeping them stuck"
                  />
                </div>
              </div>
            )}

            {/* STRAND NODE FORM */}
            {selectedNodeType === 'strand' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Storyline Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subplot Premise</label>
                  <textarea
                    value={localData.premiseSentence || ''}
                    onChange={(e) => handleUpdateField('premiseSentence', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* ACT NODE FORM */}
            {selectedNodeType === 'act' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Act Number</label>
                  <input
                    type="number"
                    value={localData.actNumber || 1}
                    onChange={(e) => handleUpdateField('actNumber', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dramatic Job</label>
                  <textarea
                    value={localData.dramaticJob || ''}
                    onChange={(e) => handleUpdateField('dramaticJob', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* SEQUENCE NODE FORM */}
            {selectedNodeType === 'sequence' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sequence Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dramatic Function</label>
                  <textarea
                    value={localData.dramaticJob || ''}
                    onChange={(e) => handleUpdateField('dramaticJob', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Target Duration (Minutes)</label>
                  <input
                    type="number"
                    value={localData.runtimeMins || 10}
                    onChange={(e) => handleUpdateField('runtimeMins', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* BEAT NODE FORM */}
            {selectedNodeType === 'beat' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Beat Order Index</label>
                  <input
                    type="number"
                    value={localData.order || 1}
                    onChange={(e) => handleUpdateField('order', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Action (Setup)</label>
                  <textarea
                    value={localData.action || ''}
                    onChange={(e) => handleUpdateField('action', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Reaction (Consequence)</label>
                  <textarea
                    value={localData.reaction || ''}
                    onChange={(e) => handleUpdateField('reaction', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Narrative Shift</label>
                  <input
                    type="text"
                    value={localData.shift || ''}
                    onChange={(e) => handleUpdateField('shift', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* SCENE NODE FORM - WORKFLOW ENGINE */}
            {selectedNodeType === 'scene' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Slugline (Slug)</label>
                  <input
                    type="text"
                    value={localData.slugline || ''}
                    onChange={(e) => handleUpdateField('slugline', e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 font-mono tracking-wider transition-colors placeholder-zinc-750 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scene Turn (Polarity Shift)</label>
                  <textarea
                    value={localData.turn || ''}
                    onChange={(e) => handleUpdateField('turn', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                    placeholder="e.g. From friendly negotiation to violent standoff"
                  />
                </div>

                {/* Cast Multi-Select list */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Scene Cast (Casting)</span>
                    <span className="text-[10px] text-zinc-500 normal-case font-normal">Check to select characters</span>
                  </label>
                  <div className="max-h-[120px] overflow-y-auto border border-zinc-900 rounded-xl p-3 bg-zinc-950 space-y-1.5 scrollbar-thin">
                    {charactersList.length > 0 ? (
                      charactersList.map(char => {
                        const castArr = localData.characters || [];
                        const isCasted = castArr.includes(char.id);

                        return (
                          <label key={char.id} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1.5 rounded-lg transition select-none">
                            <input
                              type="checkbox"
                              checked={isCasted}
                              onChange={(e) => {
                                const nextCast = e.target.checked
                                  ? [...castArr, char.id]
                                  : castArr.filter((id: string) => id !== char.id);
                                handleUpdateField('characters', nextCast);
                              }}
                              className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0"
                            />
                            <span className="font-semibold text-xs text-zinc-200">{char.data.name}</span>
                            <span className="text-[9px] text-zinc-400 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded-md uppercase font-semibold tracking-wider">{char.data.role}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-[10px] text-zinc-500 italic text-center py-4 font-light">
                        No characters created. Spawn Character nodes to cast them in scenes!
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Dramatic Goal / Obstacles</label>
                  <textarea
                    value={localData.dramaticJob || ''}
                    onChange={(e) => handleUpdateField('dramaticJob', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors placeholder-zinc-700 leading-relaxed resize-none"
                  />
                </div>

                {/* AI Writers Room Actions */}
                <div className="border-t border-zinc-900 pt-4 space-y-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Writers Room Services</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Auto-Question */}
                    <button
                      type="button"
                      onClick={handleAutoQuestion}
                      disabled={isQuestioning || isGenerating}
                      className="flex items-center justify-center gap-1.5 bg-zinc-900 text-zinc-200 border border-zinc-800 hover:border-pink-900/60 hover:text-pink-400 hover:bg-pink-950/10 disabled:bg-zinc-950 disabled:text-zinc-650 disabled:border-zinc-900 text-[10px] uppercase tracking-wider font-bold py-3 px-4 rounded-xl shadow-md transition cursor-pointer"
                    >
                      <HelpCircle size={13} />
                      <span>{isQuestioning ? 'Resolving...' : 'Auto-Question'}</span>
                    </button>

                    {/* Generate Screenplay Draft */}
                    <button
                      type="button"
                      onClick={handleGenerateDraft}
                      disabled={isGenerating || isQuestioning}
                      className="flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 text-black disabled:text-zinc-650 text-[10px] uppercase tracking-wider font-bold py-3 px-4 rounded-xl shadow-lg transition cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>{isGenerating ? 'Drafting...' : 'Generate Draft'}</span>
                    </button>
                  </div>
                </div>

                {/* Writers Room Critiques Checklist */}
                {localData.draftRef && (
                  <DepartmentChecklist
                    departmentsPassed={localData.departmentsPassed || []}
                    onRunPass={handleRunPass}
                    isRunningPass={isRunningPass}
                    runningDept={runningDept}
                  />
                )}
              </div>
            )}

            {/* QUESTION NODE FORM */}
            {selectedNodeType === 'question' && (
              <div className="space-y-4">
                <div className="bg-pink-950/20 border border-pink-900/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-pink-400">
                    <HelpCircle size={15} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Engine Query</span>
                  </div>
                  <p className="text-xs font-semibold text-pink-100 leading-relaxed font-sans select-text">
                    {localData.promptText}
                  </p>
                </div>

                {localData.locked ? (
                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-4 space-y-2">
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-400">Decision Locked</h4>
                    <p className="text-xs text-emerald-100 font-semibold">{localData.answer}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Locked at: {new Date(localData.answeredAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pick Narrative Choice:</label>
                    <div className="space-y-2">
                      {localData.options?.map((option: string) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleAnswerQuestion(option)}
                          className="w-full flex items-center justify-between text-left gap-3 px-4 py-3 border border-zinc-900 bg-[#09090b] hover:border-pink-900/60 hover:bg-pink-950/10 rounded-xl transition-all text-xs font-semibold text-zinc-300 hover:text-pink-300 cursor-pointer shadow-sm"
                        >
                          <span>{option}</span>
                          <ArrowRight size={13} className="text-zinc-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RELIGION NODE FORM */}
            {selectedNodeType === 'religion' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Religion Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sacred Text / Holy Book</label>
                  <input
                    type="text"
                    value={localData.sacredText || ''}
                    onChange={(e) => handleUpdateField('sacredText', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                    placeholder="e.g. The Book of Blood"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Creation Myth & Origins</label>
                  <textarea
                    value={localData.mythology || ''}
                    onChange={(e) => handleUpdateField('mythology', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Religious Hierarchy</label>
                  <input
                    type="text"
                    value={localData.hierarchy || ''}
                    onChange={(e) => handleUpdateField('hierarchy', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                    placeholder="e.g. High Priest -> Guardians"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sacred Rituals & Ceremonies</label>
                  <textarea
                    value={localData.rituals || ''}
                    onChange={(e) => handleUpdateField('rituals', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Holy Symbols</label>
                  <input
                    type="text"
                    value={localData.holySymbols || ''}
                    onChange={(e) => handleUpdateField('holySymbols', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Forbidden Acts & Sacred Laws</label>
                  <textarea
                    value={localData.laws || ''}
                    onChange={(e) => handleUpdateField('laws', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                    placeholder="e.g. Breaking ancient seals..."
                  />
                </div>
              </div>
            )}

            {/* MAGIC NODE FORM */}
            {selectedNodeType === 'magic' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Magic System / Rule Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rules of Engagement / Mechanics</label>
                  <textarea
                    value={localData.rules || ''}
                    onChange={(e) => handleUpdateField('rules', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Consequences / Toll on Users</label>
                  <textarea
                    value={localData.consequences || ''}
                    onChange={(e) => handleUpdateField('consequences', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                    placeholder="e.g. Life energy drain"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Limitations & Weaknesses</label>
                  <textarea
                    value={localData.limitations || ''}
                    onChange={(e) => handleUpdateField('limitations', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                    placeholder="e.g. Cold iron, running water"
                  />
                </div>
              </div>
            )}

            {/* LOCATION NODE FORM */}
            {selectedNodeType === 'location' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Location Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Visual Description & Ambience</label>
                  <textarea
                    value={localData.description || ''}
                    onChange={(e) => handleUpdateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Geography & Layout</label>
                  <textarea
                    value={localData.geography || ''}
                    onChange={(e) => handleUpdateField('geography', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Historical Lore</label>
                  <textarea
                    value={localData.history || ''}
                    onChange={(e) => handleUpdateField('history', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ARTIFACT NODE FORM */}
            {selectedNodeType === 'artifact' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Artifact Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Historical Origins</label>
                  <textarea
                    value={localData.origins || ''}
                    onChange={(e) => handleUpdateField('origins', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mystical Powers & Tech Specs</label>
                  <textarea
                    value={localData.powers || ''}
                    onChange={(e) => handleUpdateField('powers', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Danger / Classification Level</label>
                  <select
                    value={localData.dangerLevel || 'low'}
                    onChange={(e) => handleUpdateField('dangerLevel', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors cursor-pointer font-sans"
                  >
                    <option value="low">Low (Safe/Utility)</option>
                    <option value="medium">Medium (Requires training)</option>
                    <option value="high">High (Dangerous/Unstable)</option>
                    <option value="lethal">Lethal (Godlike relic/Weapon)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TIMELINE NODE FORM */}
            {selectedNodeType === 'timeline' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Event Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Historical Era / Year</label>
                  <input
                    type="text"
                    value={localData.year || ''}
                    onChange={(e) => handleUpdateField('year', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                    placeholder="e.g. 1337 AD, 5000 BC"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Summary of Event</label>
                  <textarea
                    value={localData.eventSummary || ''}
                    onChange={(e) => handleUpdateField('eventSummary', e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Historical Impact on Current World</label>
                  <textarea
                    value={localData.historicalImpact || ''}
                    onChange={(e) => handleUpdateField('historicalImpact', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ORGANIZATION NODE FORM */}
            {selectedNodeType === 'organization' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Faction / Organization Name</label>
                  <input
                    type="text"
                    value={localData.name || ''}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Organization Category</label>
                  <select
                    value={localData.type || 'faction'}
                    onChange={(e) => handleUpdateField('type', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors cursor-pointer font-sans"
                  >
                    <option value="kingdom">Kingdom / Monarch</option>
                    <option value="empire">Empire / Realm</option>
                    <option value="republic">Republic / Alliance</option>
                    <option value="faction">Faction / Syndicate</option>
                    <option value="military">Military Command</option>
                    <option value="guild">Trade Guild / Corporation</option>
                    <option value="sect">Cabal / Sect / Cult</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Key Leaders & Members</label>
                  <input
                    type="text"
                    value={localData.leaders || ''}
                    onChange={(e) => handleUpdateField('leaders', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Core Agenda & Ambition</label>
                  <textarea
                    value={localData.agenda || ''}
                    onChange={(e) => handleUpdateField('agenda', e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors resize-none leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Declared Allies</label>
                  <input
                    type="text"
                    value={localData.allies || ''}
                    onChange={(e) => handleUpdateField('allies', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Active Enemies</label>
                  <input
                    type="text"
                    value={localData.enemies || ''}
                    onChange={(e) => handleUpdateField('enemies', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#09090b] border border-zinc-900 hover:border-zinc-800 focus:border-zinc-700 rounded-xl focus:outline-none text-zinc-200 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* DRAFT NODE FORM */}
            {selectedNodeType === 'draft' && (
              <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
                <DraftViewer
                  versions={localData.versions || []}
                  currentVersion={localData.currentVersion || 1}
                  locked={localData.locked || false}
                  annotations={localData.departmentAnnotations || {}}
                  onLockToggle={() => {
                    const nextLockState = !localData.locked;
                    handleUpdateField('locked', nextLockState);
                  }}
                  onTextChange={(text) => {
                    // Update the active version's text
                    const currentVer = localData.currentVersion || 1;
                    const updatedVersions = (localData.versions || []).map((v: any) => {
                      if (v.versionNumber === currentVer) {
                        return { ...v, text };
                      }
                      return v;
                    });
                    handleUpdateField('versions', updatedVersions);
                  }}
                  onVersionChange={(ver) => {
                    handleUpdateField('currentVersion', ver);
                  }}
                />
              </div>
            )}

            {/* Sandbox Developer Console (Collasible or inline at the bottom) */}
            {(activeProjectId === 'proj-sandbox' || activeProjectId === 'proj-test-sandbox') && selectedNodeType !== 'draft' && (
              <div className="border-t border-zinc-900 pt-5 mt-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-zinc-900/60 pb-2 mb-2">
                  <Terminal size={14} />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Sandbox Developer Console</h4>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
                  Inspect how prompts are assembled for this individual <span className="text-zinc-300 font-mono font-semibold">{selectedNode?.type}</span> node, and test Gemini execution in isolation.
                </p>

                {/* API Trigger Settings */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">API Operation</label>
                    <select
                      value={devCallType}
                      onChange={(e) => setDevCallType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-850 focus:outline-none focus:border-zinc-700 rounded-xl text-white cursor-pointer"
                    >
                      <option value="generate">Generate Content (generateCall)</option>
                      <option value="brainstorm">Brainstorm Child Nodes (brainstormCall)</option>
                      <option value="question">Propose Story Questions (questionCall)</option>
                      <option value="department">Run Department Pass (departmentCall)</option>
                    </select>
                  </div>

                  {devCallType === 'department' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Writers Room Department</label>
                      <select
                        value={devDepartment}
                        onChange={(e) => setDevDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-850 focus:outline-none focus:border-zinc-700 rounded-xl text-white cursor-pointer"
                      >
                        <option value="dialogue">Dialogue Pass</option>
                        <option value="structure">Structure & Turn</option>
                        <option value="character">Character Arc</option>
                        <option value="world-lore">World Lore</option>
                        <option value="tone">Tone Contract</option>
                        <option value="action-visual">Spectacle / Blocking</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Actions Button Bar */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={fetchDevPrompts}
                    disabled={isPreviewing || isDevRunning || !selectedNodeId}
                    className="flex items-center justify-center gap-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer disabled:opacity-40"
                  >
                    <Code size={12} />
                    <span>{isPreviewing ? 'Loading...' : 'Preview Prompts'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={executeDevCall}
                    disabled={isPreviewing || isDevRunning || !selectedNodeId}
                    className="flex items-center justify-center gap-1.5 bg-emerald-950 border border-emerald-900/60 hover:bg-emerald-900/40 text-emerald-400 hover:border-emerald-500 font-bold text-[10px] uppercase tracking-[0.15em] py-2.5 rounded-xl transition cursor-pointer disabled:opacity-40"
                  >
                    <Play size={10} className="fill-current" />
                    <span>{isDevRunning ? 'Executing...' : 'Run Gemini Call'}</span>
                  </button>
                </div>

                {/* Prompt Inspector section */}
                {(assembledSystemPrompt || assembledUserPrompt) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                      <h5 className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">Assembled Prompt Context</h5>
                      <div className="flex bg-zinc-950 border border-zinc-900 p-0.5 rounded-lg">
                        <button
                          onClick={() => setDevPromptTab('system')}
                          className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded ${
                            devPromptTab === 'system' ? 'bg-zinc-850 text-white' : 'text-zinc-500'
                          }`}
                        >
                          System
                        </button>
                        <button
                          onClick={() => setDevPromptTab('user')}
                          className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded ${
                            devPromptTab === 'user' ? 'bg-zinc-850 text-white' : 'text-zinc-500'
                          }`}
                        >
                          User
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#050507] border border-zinc-900 rounded-2xl p-4 overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin text-left">
                      <pre className="text-[10px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {devPromptTab === 'system' ? assembledSystemPrompt : assembledUserPrompt}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Response Section */}
                {(isDevRunning || devResult) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={13} className="text-purple-400 animate-pulse" />
                      <h5 className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">Gemini Response</h5>
                    </div>

                    <div className="bg-[#050507] border border-zinc-900 rounded-2xl p-4 min-h-[100px] flex flex-col justify-center text-left relative overflow-hidden">
                      {isDevRunning ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <div className="w-6 h-6 rounded-full border-2 border-zinc-850 border-t-purple-400 animate-spin" />
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Querying LLM...</span>
                        </div>
                      ) : (
                        <div className="w-full">
                          {typeof devResult === 'string' ? (
                            <pre className="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                              {devResult}
                            </pre>
                          ) : Array.isArray(devResult) ? (
                            <div className="space-y-3.5">
                              <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Brainstormed Child Candidates ({devResult.length}):</p>
                              <div className="grid grid-cols-1 gap-2.5">
                                {devResult.map((child: any, idx: number) => (
                                  <div key={idx} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-900/30">
                                        {child.type}
                                      </span>
                                      <span className="text-[9px] text-zinc-500 font-medium italic">
                                        Relation: {child.relationLabel}
                                      </span>
                                    </div>
                                    <div className="bg-black/40 border border-zinc-900/60 p-2 rounded-lg">
                                      <pre className="text-[9px] font-mono text-zinc-400 truncate">
                                        {JSON.stringify(child.data, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <pre className="text-[10px] font-mono text-red-400 whitespace-pre-wrap leading-relaxed">
                              {JSON.stringify(devResult, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
