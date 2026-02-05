import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ChatflowNode, ChatflowEdge, GuestFormConfig } from '@/app/types/chatflow';

// Import custom nodes
import { TriggerNode } from './nodes/TriggerNode';
import { SendTemplateNode } from './nodes/SendTemplateNode';
import { WaitReplyNode } from './nodes/WaitReplyNode';
import { ConditionNode } from './nodes/ConditionNode';
import { DelayNode } from './nodes/DelayNode';
import { GuestFormNode } from './nodes/GuestFormNode';
import { UpdateGuestNode } from './nodes/UpdateGuestNode';
import { EndNode } from './nodes/EndNode';

const nodeTypes = {
  trigger: TriggerNode,
  send_template: SendTemplateNode,
  wait_reply: WaitReplyNode,
  condition: ConditionNode,
  delay: DelayNode,
  guest_form: GuestFormNode,
  update_guest: UpdateGuestNode,
  end: EndNode,
};

interface ChatflowCanvasProps {
  nodes: ChatflowNode[];
  edges: ChatflowEdge[];
  onNodesChange: (nodes: ChatflowNode[]) => void;
  onEdgesChange: (edges: ChatflowEdge[]) => void;
  onNodeSelect: (node: ChatflowNode | null) => void;
  isLocked?: boolean;
}

export function ChatflowCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  isLocked = false,
}: ChatflowCanvasProps) {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges as Edge[]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Generate ghost edges from guest_form nodes with jump configurations
  const ghostEdges = useMemo(() => {
    const jumps: Edge[] = [];
    
    initialNodes.forEach((node) => {
      if (node.type === 'guest_form') {
        const config = node.data.config as GuestFormConfig | null;
        if (config?.onMaxRetry?.action === 'jump_to_node' && config.onMaxRetry.jumpToNodeId) {
          // Check if target node exists
          const targetExists = initialNodes.some(n => n.id === config.onMaxRetry.jumpToNodeId);
          if (targetExists) {
            jumps.push({
              id: `ghost_${node.id}_${config.onMaxRetry.jumpToNodeId}`,
              source: node.id,
              target: config.onMaxRetry.jumpToNodeId!,
              sourceHandle: 'max_retry',
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: '#f59e0b', 
                strokeWidth: 2,
                strokeDasharray: '5,5',
                opacity: 0.7,
              },
              label: 'Max Retry',
              labelStyle: { 
                fontSize: 10, 
                fill: '#f59e0b',
                fontWeight: 600,
              },
              labelBgStyle: {
                fill: 'rgba(255, 255, 255, 0.9)',
              },
              selectable: false,
              deletable: false,
              data: { isGhost: true },
            });
          }
        }
      }
    });
    
    return jumps;
  }, [initialNodes]);

  // Sync ReactFlow internal state with parent state changes
  useEffect(() => {
    setNodes(initialNodes as Node[]);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges as Edge[]);
  }, [initialEdges, setEdges]);

  // Handle keyboard delete for edges
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't allow delete when locked
      if (isLocked) return;
      
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeId) {
        // Don't delete ghost edges
        if (selectedEdgeId.startsWith('ghost_')) {
          return;
        }
        
        const newEdges = edges.filter((e) => e.id !== selectedEdgeId);
        setEdges(newEdges);
        onEdgesChange(newEdges as ChatflowEdge[]);
        setSelectedEdgeId(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, edges, setEdges, onEdgesChange, isLocked]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Don't allow connections when locked
      if (isLocked) return;
      
      const newEdges = addEdge(
        {
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'rgba(139, 92, 246, 0.6)', strokeWidth: 2 },
        },
        edges
      );
      
      setEdges(newEdges);
      onEdgesChange(newEdges as ChatflowEdge[]);
    },
    [edges, setEdges, onEdgesChange, isLocked]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedEdgeId(null); // Deselect edge when clicking node
      onNodeSelect(node as ChatflowNode);
    },
    [onNodeSelect]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      // Don't select ghost edges
      if (edge.id.startsWith('ghost_')) {
        return;
      }
      setSelectedEdgeId(edge.id);
      onNodeSelect(null); // Deselect node when clicking edge
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Handle drag and drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    if (isLocked) return; // Don't allow drag over when locked
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, [isLocked]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      // Don't allow drop when locked
      if (isLocked) return;
      
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      // Create appropriate label based on type
      const labelMap: Record<string, string> = {
        trigger: 'Start',
        send_template: 'Send Template',
        wait_reply: 'Wait Reply',
        condition: 'Condition',
        delay: 'Delay',
        guest_form: 'Guest Form',
        update_guest: 'Update Guest',
        end: 'End',
      };

      const newNode: ChatflowNode = {
        id: `${type}_${Date.now()}`,
        type: type as any,
        position,
        data: {
          label: labelMap[type] || `New ${type.replace('_', ' ')}`,
          config: null,
        },
      };

      const updatedNodes = [...nodes, newNode as Node];
      setNodes(updatedNodes);
      onNodesChange(updatedNodes as ChatflowNode[]);
    },
    [nodes, setNodes, onNodesChange, isLocked]
  );

  // Combine real edges with ghost edges, applying selection styling
  const displayEdges = useMemo(() => {
    const styledEdges = edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: selectedEdgeId === edge.id ? '#ef4444' : 'rgba(139, 92, 246, 0.6)',
        strokeWidth: selectedEdgeId === edge.id ? 3 : 2,
      },
    }));
    
    return [...styledEdges, ...ghostEdges];
  }, [edges, ghostEdges, selectedEdgeId]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Edge delete hint */}
      {selectedEdgeId && !selectedEdgeId.startsWith('ghost_') && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            padding: '8px 16px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          Press <strong>Delete</strong> or <strong>Backspace</strong> to remove connection
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        onNodesChange={(changes) => {
          handleNodesChange(changes);
          // Get updated nodes after changes
          setNodes((nds) => {
            onNodesChange(nds as ChatflowNode[]);
            return nds;
          });
        }}
        onEdgesChange={(changes) => {
          // Filter out changes for ghost edges
          const filteredChanges = changes.filter((change) => {
            if ('id' in change && typeof change.id === 'string') {
              return !change.id.startsWith('ghost_');
            }
            return true;
          });
          handleEdgesChange(filteredChanges);
          onEdgesChange(edges as ChatflowEdge[]);
        }}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={null} // We handle delete manually
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(245, 158, 11, 0.15)"
        />
        <Controls
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        />
        <MiniMap
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              trigger: '#f59e0b',
              send_template: '#06b6d4',
              wait_reply: '#3b82f6',
              condition: '#8b5cf6',
              delay: '#10b981',
              guest_form: '#10b981',
              update_guest: '#ec4899',
              end: '#64748b',
            };
            return colors[node.type || 'default'] || '#999';
          }}
        />
      </ReactFlow>
    </div>
  );
}
