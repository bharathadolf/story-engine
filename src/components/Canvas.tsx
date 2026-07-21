import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  ControlButton,
  MiniMap, 
  ReactFlowProvider, 
  useReactFlow 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useGraphStore from '../store/graphStore.js';
import BibleNode from './nodes/BibleNode.js';
import CharacterNode from './nodes/CharacterNode.js';
import StrandNode from './nodes/StrandNode.js';
import ActNode from './nodes/ActNode.js';
import SequenceNode from './nodes/SequenceNode.js';
import SceneNode from './nodes/SceneNode.js';
import BeatNode from './nodes/BeatNode.js';
import QuestionNode from './nodes/QuestionNode.js';
import DraftNode from './nodes/DraftNode.js';
import useSidebarStore from '../store/sidebarStore.js';

import { 
  Keyboard, 
  Trash2, 
  Link2Off, 
  X, 
  Plus, 
  Sparkles, 
  Check, 
  HelpCircle,
  Search,
  Expand,
  Hand,
  MousePointer,
  Copy,
  Layout,
  Map,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'delete' | 'info';
}

function CanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    snapToGrid,
    searchQuery,
    setSearchQuery,
    brainstormExpansion,
    brainstormingNodeId,
    autoLayout
  } = useGraphStore();

  const { screenToFlowPosition, fitView, setCenter, fitBounds } = useReactFlow();

  const [showShortcuts, setShowShortcuts] = useState(false); // Default false so it is not intrusive, can open via click or keys
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [boxSelectionMode, setBoxSelectionMode] = useState(false);
  const [minimapMode, setMinimapMode] = useState<'type' | 'health'>('type');
  const [isMinimapExpanded, setIsMinimapExpanded] = useState(true);

  const getNodeColorMinimap = useCallback((node: any) => {
    if (minimapMode === 'type') {
      switch (node.type) {
        case 'bible': return '#a855f7';
        case 'character': return '#f43f5e';
        case 'strand': return '#14b8a6';
        case 'act': return '#2563eb';
        case 'sequence': return '#0ea5e9';
        case 'scene': return '#f59e0b';
        case 'beat': return '#6366f1';
        case 'question': return '#ec4899';
        case 'draft': return '#475569';
        default: return '#27272a';
      }
    } else {
      // Production Health Heatmap
      const isConnected = edges.some(e => e.source === node.id || e.target === node.id);
      if (!isConnected && node.type !== 'bible') {
        return '#ef4444'; // Red: isolated node
      }

      if (node.type === 'draft') {
        return node.data?.locked ? '#10b981' : '#f59e0b'; // Green: locked draft, Yellow: draft outline
      }

      if (node.type === 'question') {
        return node.data?.locked ? '#10b981' : '#f59e0b'; // Green: answered query, Yellow: open question
      }

      // Check fields completeness
      const d = node.data || {};
      let isIncomplete = false;
      if (node.type === 'character' && (!d.name || d.name === 'Unnamed Character')) isIncomplete = true;
      if (node.type === 'scene' && (!d.slugline || d.slugline.includes('UNNAMED'))) isIncomplete = true;
      if (node.type === 'act' && !d.summary) isIncomplete = true;
      if (node.type === 'beat' && !d.headline && !d.action) isIncomplete = true;

      if (isIncomplete) {
        return '#71717a'; // Zinc: incomplete
      }

      return '#6366f1'; // Indigo: complete & connected
    }
  }, [minimapMode, edges]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeType: string;
    flowX?: number;
    flowY?: number;
  } | null>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      const pane = document.getElementById('canvas-stage')?.getBoundingClientRect();
      if (pane) {
        const flowCoords = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setContextMenu({
          x: event.clientX - pane.left,
          y: event.clientY - pane.top,
          nodeId: node.id,
          nodeType: node.type,
          flowX: flowCoords.x,
          flowY: flowCoords.y
        });
      }
    },
    [screenToFlowPosition]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const pane = document.getElementById('canvas-stage')?.getBoundingClientRect();
      if (pane) {
        const flowCoords = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setContextMenu({
          x: event.clientX - pane.left,
          y: event.clientY - pane.top,
          nodeId: '',
          nodeType: '',
          flowX: flowCoords.x,
          flowY: flowCoords.y
        });
      }
    },
    [screenToFlowPosition]
  );

  // Close context menu on any click outside
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Show a fleeting, beautifully styled notification toast on key action
  const addToast = (text: string, type: 'success' | 'delete' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  const nodeTypes = useMemo(() => {
    const wrapNode = (Component: any, type: string) => {
      return (props: any) => {
        const { searchQuery, brainstormingNodeId } = useGraphStore();
        const isBrainstormingThis = brainstormingNodeId === props.id;
        
        const matches = useMemo(() => {
          if (!searchQuery) return false;
          const q = searchQuery.toLowerCase();
          const d = props.data || {};
          
          return Object.values(d).some(val => {
            if (typeof val === 'string') {
              return val.toLowerCase().includes(q);
            }
            if (typeof val === 'number') {
              return val.toString().toLowerCase().includes(q);
            }
            if (Array.isArray(val)) {
              return val.some(v => typeof v === 'string' && v.toLowerCase().includes(q));
            }
            if (val && typeof val === 'object') {
              return Object.values(val).some(subVal => typeof subVal === 'string' && subVal.toLowerCase().includes(q));
            }
            return false;
          });
        }, [props.data, searchQuery]);

        return (
          <div className="relative group transition-all duration-300">
            {matches && (
              <>
                {/* Search Match Highlight Border Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/80 to-yellow-400/80 rounded-2xl blur-md opacity-80 animate-pulse z-0 pointer-events-none" />
                {/* Search Match Badge */}
                <div className="absolute -top-3.5 left-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider z-50 shadow-lg flex items-center gap-1 border border-amber-300">
                  <span className="w-1 h-1 rounded-full bg-black animate-ping" />
                  Match
                </div>
              </>
            )}

            {isBrainstormingThis && (
              <>
                {/* Brainstorming Purple/Indigo Highlight Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 rounded-2xl blur-md opacity-90 animate-pulse z-0 pointer-events-none" />
                {/* Brainstorming Badge */}
                <div className="absolute -top-3.5 left-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider z-50 shadow-lg flex items-center gap-1.5 border border-purple-400 animate-bounce">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  AI Brainstorming...
                </div>
              </>
            )}

            <div className={`relative z-10 transition-all duration-300 ${
              isBrainstormingThis ? 'scale-[1.05] animate-pulse duration-1000' : 
              matches ? 'scale-[1.04]' : 
              searchQuery ? 'opacity-35 scale-[0.96]' : ''
            }`}>
              <Component {...props} />
            </div>
          </div>
        );
      };
    };

    return {
      bible: wrapNode(BibleNode, 'bible'),
      character: wrapNode(CharacterNode, 'character'),
      strand: wrapNode(StrandNode, 'strand'),
      act: wrapNode(ActNode, 'act'),
      sequence: wrapNode(SequenceNode, 'sequence'),
      scene: wrapNode(SceneNode, 'scene'),
      beat: wrapNode(BeatNode, 'beat'),
      question: wrapNode(QuestionNode, 'question'),
      draft: wrapNode(DraftNode, 'draft')
    };
  }, []);

  useEffect(() => {
    let currentMouseX = window.innerWidth / 2;
    let currentMouseY = window.innerHeight / 2;
    let isMouseInCanvas = false;

    // Keep track of client mouse coordinate
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      currentMouseX = e.clientX;
      currentMouseY = e.clientY;
    };

    const canvasEl = document.getElementById('canvas-stage');
    const handleMouseEnter = () => { isMouseInCanvas = true; };
    const handleMouseLeave = () => { isMouseInCanvas = false; };

    if (canvasEl) {
      canvasEl.addEventListener('mouseenter', handleMouseEnter);
      canvasEl.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('mousemove', handleMouseMoveGlobal);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if the user is typing in a contenteditable, input, or textarea
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Toggle HUD Help Panel (? / / / k)
      if (key === '?' || e.key === '/' || key === 'k') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        addToast(showShortcuts ? "Shortcuts panel collapsed" : "Shortcuts panel displayed", "info");
        return;
      }

      // Escape key - can clear visual selections
      if (e.key === 'Escape') {
        // Let standard React Flow selection behavior resolve, but offer a nice feedback toast
        addToast("Selections cleared", "info");
        return;
      }

      // Backspace or Delete to remove nodes / connections
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(ed => ed.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault();
          
          let deletedNodesCount = 0;
          let deletedEdgesCount = 0;

          if (selectedNodes.length > 0) {
            selectedNodes.forEach(n => {
              deleteNode(n.id);
              deletedNodesCount++;
            });
          }

          if (selectedEdges.length > 0) {
            onEdgesChange(selectedEdges.map(ed => {
              deletedEdgesCount++;
              return { id: ed.id, type: 'remove' };
            }));
          }

          if (deletedNodesCount > 0 && deletedEdgesCount > 0) {
            addToast(`Removed ${deletedNodesCount} block(s) and ${deletedEdgesCount} connection(s)`, "delete");
          } else if (deletedNodesCount > 0) {
            addToast(`Removed selected block`, "delete");
          } else if (deletedEdgesCount > 0) {
            addToast(`Removed selected connection`, "delete");
          }
        }
        return;
      }

      // Shift + D or Alt + L to Delink (disconnect) selected node's links
      if ((isShift && key === 'd') || (isAlt && key === 'l')) {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          e.preventDefault();
          const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
          const connectedEdges = edges.filter(
            edge => selectedNodeIds.has(edge.source) || selectedNodeIds.has(edge.target)
          );

          if (connectedEdges.length > 0) {
            onEdgesChange(connectedEdges.map(ed => ({ id: ed.id, type: 'remove' })));
            addToast(`Delinked ${connectedEdges.length} connection(s) from selected block(s)`, "delete");
          } else {
            addToast("Selected block has no connections to delink", "info");
          }
        } else {
          addToast("Select a block first to delink its connections", "info");
        }
        return;
      }

      // I - Toggle Properties Inspector (Open/Close properties panel)
      if (key === 'i') {
        e.preventDefault();
        const sidebar = useSidebarStore.getState();
        if (sidebar.isOpen) {
          sidebar.closeInspector();
          addToast("Inspector panel collapsed", "info");
        } else {
          const selectedNodes = nodes.filter(n => n.selected);
          if (selectedNodes.length > 0) {
            sidebar.openInspector(selectedNodes[0].id, selectedNodes[0].type);
          } else {
            useSidebarStore.setState({ isOpen: true, selectedNodeId: null, selectedNodeType: null });
          }
          addToast("Inspector panel expanded", "info");
        }
        return;
      }

      // R - Toggle Narrative Rules Drawer
      if (key === 'r') {
        e.preventDefault();
        useSidebarStore.getState().toggleRules();
        const rulesOpen = useSidebarStore.getState().isRulesOpen;
        addToast(rulesOpen ? "Rules editor expanded" : "Rules editor collapsed", "info");
        return;
      }

      // Houdini Workspace Shortcuts
      // H - Home (Center/Frame All)
      if (key === 'h') {
        e.preventDefault();
        fitView({ duration: 600 });
        addToast("Framed all blocks (Home)", "info");
        return;
      }

      // F - Frame Selected (Focus Selected)
      if (key === 'f') {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          e.preventDefault();
          if (selectedNodes.length === 1) {
            const node = selectedNodes[0];
            const nodeWidth = node.measured?.width || 240;
            const nodeHeight = node.measured?.height || 120;
            const centerX = node.position.x + nodeWidth / 2;
            const centerY = node.position.y + nodeHeight / 2;
            setCenter(centerX, centerY, { zoom: 1.65, duration: 600 });
          } else {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            selectedNodes.forEach(node => {
              const x = node.position.x;
              const y = node.position.y;
              const w = node.measured?.width || 240;
              const h = node.measured?.height || 120;
              if (x < minX) minX = x;
              if (x + w > maxX) maxX = x + w;
              if (y < minY) minY = y;
              if (y + h > maxY) maxY = y + h;
            });
            const width = maxX - minX;
            const height = maxY - minY;
            fitBounds({ x: minX, y: minY, width, height }, { padding: 40, duration: 600 });
          }
          addToast(`Framed ${selectedNodes.length} selected block(s)`, "info");
        } else {
          addToast("Select a block to focus/frame", "info");
        }
        return;
      }

      // L - Layout All Nodes (Houdini arrange)
      if (key === 'l' && !isShift && !isAlt) {
        e.preventDefault();
        autoLayout();
        fitView({ duration: 800 });
        addToast("Arranged storyboard layout", "success");
        return;
      }

      // Number keys 1-9 to spawn a screenplay node directly under cursor
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        e.preventDefault();
        const spawnTypes = [
          'bible',      // 1
          'character',  // 2
          'strand',     // 3
          'act',        // 4
          'sequence',   // 5
          'scene',      // 6
          'beat',       // 7
          'question',   // 8
          'draft'       // 9
        ];

        const typeToSpawn = spawnTypes[num - 1];
        if (typeToSpawn) {
          let spawnCoords = { x: 300, y: 300 };
          try {
            if (isMouseInCanvas) {
              spawnCoords = screenToFlowPosition({ x: currentMouseX, y: currentMouseY });
            } else {
              spawnCoords = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }
          } catch (err) {
            spawnCoords = { x: 300 + Math.random() * 120, y: 200 + Math.random() * 120 };
          }

          const labelMap: Record<string, string> = {
            bible: 'Story Bible',
            character: 'Character',
            strand: 'Subplot Strand',
            act: 'Act',
            sequence: 'Sequence',
            scene: 'Scene',
            beat: 'Beat',
            question: 'Decision Query',
            draft: 'Screenplay Draft'
          };

          addNode(typeToSpawn, spawnCoords);
          addToast(`Created ${labelMap[typeToSpawn]} block`, "success");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      if (canvasEl) {
        canvasEl.removeEventListener('mouseenter', handleMouseEnter);
        canvasEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [nodes, edges, deleteNode, onEdgesChange, screenToFlowPosition, showShortcuts]);

  const totalMatches = useMemo(() => {
    if (!searchQuery) return 0;
    const q = searchQuery.toLowerCase();
    return nodes.filter(node => {
      const d = node.data || {};
      return Object.values(d).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'number') return val.toString().toLowerCase().includes(q);
        if (Array.isArray(val)) return val.some(v => typeof v === 'string' && v.toLowerCase().includes(q));
        if (val && typeof val === 'object') return Object.values(val).some(subVal => typeof subVal === 'string' && subVal.toLowerCase().includes(q));
        return false;
      });
    }).length;
  }, [nodes, searchQuery]);

  const isValidConnection = useCallback(
    (connection: any) => {
      if (connection.source === connection.target) return false;
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      const typeA = sourceNode.type || '';
      const typeB = targetNode.type || '';

      const COMPATIBILITY_RULES: Record<string, string[]> = {
        bible: ['act', 'character', 'strand'],
        character: ['scene', 'beat'],
        act: ['sequence'],
        sequence: ['beat'],
        beat: ['scene'],
        scene: ['draft', 'question'],
        strand: ['sequence', 'scene'],
        draft: [],
        question: []
      };

      const isCompatible = 
        (COMPATIBILITY_RULES[typeA]?.includes(typeB)) || 
        (COMPATIBILITY_RULES[typeB]?.includes(typeA));

      return !!isCompatible;
    },
    [nodes]
  );

  return (
    <div className="w-full h-full bg-[#0A0A0A] relative" id="canvas-stage">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes as any}
        snapToGrid={snapToGrid}
        snapGrid={[14, 14]}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        minZoom={0.02}
        maxZoom={3.0}
        fitView
        selectionOnDrag={boxSelectionMode}
        panOnDrag={!boxSelectionMode}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1f1f23" gap={28} size={1} />
        <Controls className="!bg-zinc-950 !border !border-zinc-900 !shadow-2xl !rounded-xl overflow-hidden">
          <ControlButton onClick={() => fitView({ duration: 800 })} title="Zoom to Fit">
            <Expand size={12} className="text-zinc-400 hover:text-white" />
          </ControlButton>
          <ControlButton 
            onClick={() => {
              setBoxSelectionMode(prev => !prev);
              addToast(boxSelectionMode ? "Drag-Pan Mode activated" : "Box Selection Mode activated: Click and drag to multi-select nodes", "info");
            }} 
            title={boxSelectionMode ? "Switch to Pan Mode" : "Switch to Box Selection Mode"}
            className={boxSelectionMode ? "!bg-purple-950/80" : ""}
          >
            {boxSelectionMode ? (
              <MousePointer size={12} className="text-purple-400 font-bold" />
            ) : (
              <Hand size={12} className="text-zinc-400 hover:text-white" />
            )}
          </ControlButton>
        </Controls>
      </ReactFlow>
      
      {/* Collapsible Minimap HUD Container */}
      {isMinimapExpanded ? (
        <div className="absolute bottom-4 right-4 z-40 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 shadow-2xl rounded-2xl p-2.5 space-y-2 flex flex-col items-stretch transition-all duration-300 w-52 select-none">
          <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
            <span className="text-[8px] uppercase tracking-[0.2em] font-extrabold text-zinc-500 flex items-center gap-1.5">
              <Map size={10} className="text-zinc-400" />
              <span>Story Map</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMinimapMode(prev => prev === 'type' ? 'health' : 'type')}
                className="px-1.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[7px] uppercase font-bold text-zinc-400 hover:text-white rounded border border-zinc-850 cursor-pointer transition"
                title="Toggle Heatmap Mode"
              >
                {minimapMode === 'type' ? 'Heatmap' : 'Types'}
              </button>
              <button
                onClick={() => setIsMinimapExpanded(false)}
                className="p-0.5 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded cursor-pointer transition"
              >
                <ChevronDown size={11} />
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-zinc-900/40 w-full h-[120px] bg-zinc-950/30">
            <MiniMap 
              className="!m-0 !absolute !bottom-0 !right-0 !bg-transparent !w-full !h-full"
              nodeColor={getNodeColorMinimap}
              nodeBorderRadius={20}
              maskColor="rgba(10, 10, 12, 0.55)"
              zoomable
              pannable
            />
          </div>
          <div className="flex justify-between text-[7px] text-zinc-500 font-mono mt-0.5">
            {minimapMode === 'type' ? (
              <span>Color: Block Types</span>
            ) : (
              <div className="flex gap-2.5">
                <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-emerald-400" />Done</span>
                <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-amber-400" />Work</span>
                <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-red-500" />Orphan</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsMinimapExpanded(true)}
          className="absolute bottom-4 right-4 z-40 flex items-center justify-center w-8 h-8 bg-zinc-950/95 hover:bg-zinc-900 border border-zinc-900 rounded-full shadow-2xl text-zinc-400 hover:text-purple-400 transition-all cursor-pointer group"
          title="Expand Story Map"
        >
          <Map size={14} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {boxSelectionMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-950/90 border border-purple-900/60 text-purple-200 text-[10px] font-bold uppercase tracking-[0.12em] px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 select-none z-40">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
          <span>Box Selection Mode Active: Click & drag on background to group select blocks</span>
        </div>
      )}

      {contextMenu && (
        <div
          className="absolute bg-zinc-950/95 border border-zinc-900/80 rounded-2xl py-2 shadow-2xl z-50 min-w-[220px] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.nodeId ? (
            /* NODE CONTEXT MENU */
            <>
              <div className="px-3.5 py-1.5 border-b border-zinc-900 mb-1.5">
                <p className="text-[8px] uppercase font-bold tracking-[0.15em] text-zinc-500">Block Details</p>
                <p className="text-xs font-semibold text-zinc-200 capitalize truncate mt-0.5">
                  {nodes.find(n => n.id === contextMenu.nodeId)?.data?.name || 
                   nodes.find(n => n.id === contextMenu.nodeId)?.data?.title || 
                   nodes.find(n => n.id === contextMenu.nodeId)?.data?.slugline || 
                   `${contextMenu.nodeType} node`}
                </p>
              </div>

              {/* Inspect Block */}
              <button
                onClick={() => {
                  setContextMenu(null);
                  useSidebarStore.getState().openInspector(contextMenu.nodeId, contextMenu.nodeType);
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Search size={13} className="text-zinc-500" />
                <span className="font-medium">Inspect / Edit Block</span>
              </button>

              {/* Brainstorm AI */}
              {['bible', 'character', 'strand', 'act', 'sequence', 'scene', 'beat'].includes(contextMenu.nodeType) && (
                <button
                  onClick={async () => {
                    const targetId = contextMenu.nodeId;
                    setContextMenu(null);
                    await brainstormExpansion(
                      targetId,
                      () => {
                        addToast("Gemini is brainstorming connected story elements...", "info");
                      },
                      (count) => {
                        if (count > 0) {
                          addToast(`Added ${count} narrative brainstormed sub-elements!`, "success");
                        } else {
                          addToast("No elements generated", "info");
                        }
                      },
                      (err) => {
                        addToast(`Brainstorm failed: ${err}`, "delete");
                      }
                    );
                  }}
                  disabled={brainstormingNodeId !== null}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-purple-950/30 flex items-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={13} className="text-purple-400" />
                  <span className="font-medium">Brainstorm AI Expansion</span>
                </button>
              )}

              {/* Duplicate Block */}
              <button
                onClick={() => {
                  const node = nodes.find(n => n.id === contextMenu.nodeId);
                  setContextMenu(null);
                  if (node) {
                    const duplicateX = node.position.x + 80;
                    const duplicateY = node.position.y + 80;
                    addNode(node.type, { x: duplicateX, y: duplicateY }, node.data);
                    addToast(`Duplicated ${node.type} block`, "success");
                  }
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Copy size={13} className="text-zinc-500" />
                <span className="font-medium">Duplicate Block</span>
              </button>

              {/* Sever Connections */}
              <button
                onClick={() => {
                  setContextMenu(null);
                  const connectedEdges = edges.filter(
                    edge => edge.source === contextMenu.nodeId || edge.target === contextMenu.nodeId
                  );
                  if (connectedEdges.length > 0) {
                    if (confirm(`Sever all ${connectedEdges.length} connection line(s) to/from this node?`)) {
                      onEdgesChange(connectedEdges.map(ed => ({ id: ed.id, type: 'remove' })));
                      addToast("Severed node connections", "success");
                    }
                  } else {
                    addToast("No connection lines to sever", "info");
                  }
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Link2Off size={13} className="text-zinc-500" />
                <span className="font-medium">Sever Connections</span>
              </button>

              {/* Delete Node */}
              <div className="border-t border-zinc-900 mt-1 pt-1">
                <button
                  onClick={() => {
                    setContextMenu(null);
                    if (confirm("Delete this element from your graph? All connection lines will be severed.")) {
                      deleteNode(contextMenu.nodeId);
                      useSidebarStore.getState().closeInspector();
                      addToast("Deleted block", "delete");
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} className="text-red-400" />
                  <span className="font-semibold">Delete Block</span>
                </button>
              </div>
            </>
          ) : (
            /* PANE CONTEXT MENU */
            <>
              <div className="px-3.5 py-1.5 border-b border-zinc-900 mb-1.5">
                <p className="text-[8px] uppercase font-bold tracking-[0.15em] text-zinc-500">Canvas Stage Actions</p>
              </div>

              {/* Create Node Submenu Container */}
              <div className="px-1 py-1">
                <p className="px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider text-zinc-600">Create New Block</p>
                <div className="grid grid-cols-1 gap-0.5 mt-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {[
                    { type: 'bible', label: 'Story Bible', color: 'text-purple-400' },
                    { type: 'character', label: 'Character', color: 'text-rose-400' },
                    { type: 'strand', label: 'Subplot Strand', color: 'text-teal-400' },
                    { type: 'act', label: 'Act Outline', color: 'text-blue-400' },
                    { type: 'sequence', label: 'Sequence Outline', color: 'text-sky-400' },
                    { type: 'scene', label: 'Scene Fountain', color: 'text-amber-400' },
                    { type: 'beat', label: 'Dramatic Beat', color: 'text-indigo-400' },
                    { type: 'question', label: 'Decision Query', color: 'text-pink-400' },
                    { type: 'draft', label: 'Screenplay Draft', color: 'text-zinc-400' },
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => {
                        setContextMenu(null);
                        const pos = { x: contextMenu.flowX ?? 300, y: contextMenu.flowY ?? 300 };
                        addNode(item.type, pos);
                        addToast(`Created ${item.label} block`, "success");
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900/60 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{item.label}</span>
                      <Plus size={10} className={`${item.color}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 mt-2 pt-1.5 space-y-0.5">
                {/* Auto layout */}
                <button
                  onClick={() => {
                    setContextMenu(null);
                    autoLayout();
                    addToast("Re-aligned story elements", "info");
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Layout size={13} className="text-zinc-500" />
                  <span className="font-medium">Auto-Layout Canvas</span>
                </button>

                {/* Deselect all */}
                <button
                  onClick={() => {
                    setContextMenu(null);
                    const { nodes } = useGraphStore.getState();
                    nodes.forEach(n => { n.selected = false; });
                    addToast("Deselected all blocks", "info");
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <X size={13} className="text-zinc-500" />
                  <span className="font-medium">Deselect All Elements</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Canvas Search Bar */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <div className="bg-zinc-950/90 border border-zinc-900/60 rounded-full px-4 py-2 flex items-center gap-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-800 w-64 focus-within:w-80 group">
          <Search size={14} className="text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search script nodes..."
            className="bg-transparent text-xs text-zinc-100 placeholder-zinc-500 border-none outline-none focus:ring-0 w-full"
          />
          {searchQuery && (
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-[9px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md">
                {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Tactical Canvas Toasts */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold tracking-wide shadow-2xl animate-bounce ${
              toast.type === 'delete' 
                ? 'bg-red-950/90 text-red-200 border-red-900' 
                : toast.type === 'info'
                  ? 'bg-zinc-900/90 text-zinc-300 border-zinc-800'
                  : 'bg-emerald-950/90 text-emerald-200 border-emerald-900'
            }`}
          >
            {toast.type === 'delete' && <Trash2 size={12} className="text-red-400" />}
            {toast.type === 'info' && <HelpCircle size={12} className="text-zinc-400" />}
            {toast.type === 'success' && <Check size={12} className="text-emerald-400" />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Narrative Rules Corner Trigger Button */}
      <div className="absolute bottom-14 left-4 z-40">
        <button
          onClick={() => useSidebarStore.getState().toggleRules()}
          className="flex items-center justify-center h-8 w-8 bg-zinc-950/95 hover:bg-zinc-900 border border-zinc-900 rounded-full shadow-2xl text-zinc-400 hover:text-purple-400 transition-all cursor-pointer group animate-pulse"
          title="Narrative Steering Rules Editor (R)"
        >
          <BookOpen size={14} className="group-hover:scale-110 transition-transform text-purple-400" />
        </button>
      </div>

      {/* Keyboard Shortcuts Corner Trigger Button */}
      <div className="absolute bottom-4 left-4 z-40">
        <button
          onClick={() => setShowShortcuts(true)}
          className="flex items-center justify-center h-8 w-8 bg-zinc-950/95 hover:bg-zinc-900 border border-zinc-900 rounded-full shadow-2xl text-zinc-400 hover:text-purple-400 transition-all cursor-pointer group"
          title="Keyboard Shortcuts Guide (?)"
        >
          <HelpCircle size={15} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Keyboard Shortcuts Centered Modal Overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowShortcuts(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3.5">
              <div className="p-2 bg-purple-950/40 text-purple-400 border border-purple-900/30 rounded-xl">
                <Keyboard size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Keyboard Shortcuts Guide</h2>
                <p className="text-[10px] text-zinc-500">Boost your writing speed and narrative planning</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 text-xs text-zinc-300">
              <div className="space-y-3">
                <h3 className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">Core Actions</h3>
                
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Delete Node/Connection</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">Del / Backspace</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Delink Connections</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">Shift + D</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Deselect All</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">Esc</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Center / Frame All (Home)</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">H</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Focus Selected (Frame)</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">F</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Auto-Layout Canvas</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">L</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Toggle Properties Panel</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">I</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Toggle Narrative Rules</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">R</kbd>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
                  <span className="text-zinc-400 text-[11px]">Toggle This Modal</span>
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-850 rounded font-mono text-[9px] uppercase">? / K</kbd>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[9px] uppercase font-bold tracking-[0.15em] text-zinc-500">Instant Spawn at Cursor</h3>
                <div className="grid grid-cols-1 gap-1.5 text-zinc-400">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>1. Story Bible</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">1</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>2. Character</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">2</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>3. Subplot Strand</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">3</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>4. Act</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">4</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>5. Sequence</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">5</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>6. Scene</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">6</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>7. Beat</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">7</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>8. Decision Question</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">8</kbd>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>9. Screenplay Draft</span>
                    <kbd className="px-1.5 py-0.2 bg-zinc-900 text-zinc-500 font-mono text-[9px] rounded">9</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 text-center border-t border-zinc-900 pt-3.5 flex justify-between items-center">
              <span>Interactive Storyboard Workspace</span>
              <button
                onClick={() => setShowShortcuts(false)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
              >
                Let's Write
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Canvas() {
  return <CanvasInner />;
}
