import React, { useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import useGraphStore from '../store/graphStore.js';
import { ChevronRight, Layout, User, Layers, ListOrdered, Film, Sparkles, HelpCircle, FileText, GitBranch } from 'lucide-react';

export default function BreadcrumbTrail() {
  const { nodes, edges } = useGraphStore();
  const { fitView } = useReactFlow();

  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);

  // Compute the path of ancestors for a single selected node
  const breadcrumbPath = useMemo(() => {
    if (selectedNodes.length !== 1) return [];

    const pathNodes: any[] = [];
    const activeNode = selectedNodes[0];
    pathNodes.push(activeNode);

    const visited = new Set<string>();
    visited.add(activeNode.id);

    let currentId = activeNode.id;
    let foundParent = true;

    while (foundParent) {
      foundParent = false;
      // Look for any incoming edge
      // To match standard hierarchy, prefer incoming edges from structurally higher types
      const incomingEdges = edges.filter(e => e.target === currentId);
      
      if (incomingEdges.length > 0) {
        // Find the first parent node that exists in the nodes list and hasn't been visited
        for (const edge of incomingEdges) {
          const parent = nodes.find(n => n.id === edge.source);
          if (parent && !visited.has(parent.id)) {
            pathNodes.push(parent);
            visited.add(parent.id);
            currentId = parent.id;
            foundParent = true;
            break;
          }
        }
      }
    }

    // Reverse path so it goes from root parent to selected leaf node
    return pathNodes.reverse();
  }, [selectedNodes, nodes, edges]);

  const handleBreadcrumbClick = (node: any) => {
    try {
      fitView({
        nodes: [node],
        duration: 800,
        padding: 0.5
      });
    } catch (err) {
      console.warn('Could not fit view on breadcrumb click:', err);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'bible': return <Layout size={12} className="text-purple-400" />;
      case 'character': return <User size={12} className="text-rose-400" />;
      case 'strand': return <GitBranch size={12} className="text-teal-400" />;
      case 'act': return <Layers size={12} className="text-blue-400" />;
      case 'sequence': return <ListOrdered size={12} className="text-sky-400" />;
      case 'scene': return <Film size={12} className="text-amber-400" />;
      case 'beat': return <Sparkles size={12} className="text-indigo-400" />;
      case 'question': return <HelpCircle size={12} className="text-pink-400" />;
      case 'draft': return <FileText size={12} className="text-emerald-400" />;
      default: return <FileText size={12} className="text-zinc-400" />;
    }
  };

  const getNodeLabel = (node: any) => {
    const d = node.data || {};
    if (node.type === 'bible') return d.title || 'Story Bible';
    if (node.type === 'character') return d.name || 'Character';
    if (node.type === 'scene') return d.slugline || 'Scene Slugline';
    if (node.type === 'act') return `Act ${d.actNumber || 'I'}: ${d.title || 'Summary'}`;
    if (node.type === 'sequence') return d.name || 'Sequence';
    if (node.type === 'beat') return d.headline || `Beat ${d.order || '1'}`;
    if (node.type === 'draft') return 'Screenplay Draft';
    if (node.type === 'strand') return d.name || 'Subplot Strand';
    if (node.type === 'question') return 'Decision Query';
    return d.name || d.title || 'Block';
  };

  return (
    <div className="bg-[#0C0C0E] border-b border-zinc-900/80 px-6 py-2 flex items-center justify-between text-xs font-sans h-10 select-none">
      
      {/* Path Breadcrumbs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold shrink-0 mr-1">Hierarchy Path:</span>
        
        {selectedNodes.length === 0 ? (
          <span className="text-zinc-500 font-light italic text-[11px]">Select any screenplay block on the canvas to trace its parent structural chain...</span>
        ) : selectedNodes.length > 1 ? (
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-medium">
            <Layers size={12} className="text-purple-400" />
            <span>Multiple Selection:</span>
            <span className="bg-purple-950/40 text-purple-300 px-2 py-0.5 border border-purple-900/30 rounded-full font-mono text-[10px] font-bold">
              {selectedNodes.length} blocks selected
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {breadcrumbPath.map((node, index) => {
              const isLast = index === breadcrumbPath.length - 1;
              return (
                <React.Fragment key={node.id}>
                  {index > 0 && <ChevronRight size={12} className="text-zinc-600 shrink-0" />}
                  <button
                    onClick={() => handleBreadcrumbClick(node)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-zinc-900 shrink-0 cursor-pointer ${
                      isLast 
                        ? 'text-white font-semibold bg-zinc-900/40 border border-zinc-850' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {getNodeIcon(node.type)}
                    <span className="max-w-[130px] truncate font-sans text-[11px]">{getNodeLabel(node)}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual orientation info */}
      <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
        <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse" />
        <span>Hierarchy Tracing Enabled</span>
      </div>

    </div>
  );
}
