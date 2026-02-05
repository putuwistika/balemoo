import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatflows } from "@/app/contexts/ChatflowContext";
import { useProject } from "@/app/contexts/ProjectContext";
import { ChatflowCanvas } from "./ChatflowCanvas";
import { ChatflowToolbar } from "./ChatflowToolbar";
import { ChatflowSidebar } from "./ChatflowSidebar";
import { ChatflowPropertiesPanel } from "./ChatflowPropertiesPanel";
import { ChatflowList } from "./ChatflowList";
import type { ChatflowNode, ChatflowEdge } from "@/app/types/chatflow";
import { validateChatflow, type ValidationResult } from "@/app/utils/chatflowValidation";

export function ChatflowStudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chatflows, getChatflowById, updateChatflow, deleteChatflow } = useChatflows();
  const { selectedProject } = useProject();

  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ChatflowNode | null>(null);

  // Canvas State
  const [nodes, setNodes] = useState<ChatflowNode[]>([]);
  const [edges, setEdges] = useState<ChatflowEdge[]>([]);

  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validation State
  const [validation, setValidation] = useState<ValidationResult>({
    valid: true,
    errors: [],
    warnings: [],
  });

  // Auto-save timer ref
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Flag to track if it's the initial load
  const isInitialLoad = useRef(true);

  // Helper function to extract variables from nodes
  const extractVariablesFromNodes = (nodes: ChatflowNode[]): string[] => {
    const variables = new Set<string>();

    nodes.forEach((node) => {
      if (node.type === "set_variable" && node.data.config?.variableName) {
        variables.add(node.data.config.variableName);
      }
    });

    return Array.from(variables);
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!id) {
      console.error("❌ No chatflow ID");
      return;
    }

    if (!selectedProject?.id) {
      console.error("❌ No project selected");
      alert("Please select a project first");
      return;
    }

    console.log('💾 ========== SAVE CHATFLOW START ==========');
    console.log('📊 Nodes count:', nodes.length);
    console.log('📊 Edges count:', edges.length);
    console.log('📊 Project ID:', selectedProject.id);
    
    // Log each node's config
    nodes.forEach((node, idx) => {
      console.log(`Node ${idx + 1}:`, {
        id: node.id,
        type: node.type,
        label: node.data.label,
        hasConfig: !!node.data.config,
        config: node.data.config
      });
    });

    try {
      setIsSaving(true);

      // Extract variables from nodes
      const variables = extractVariablesFromNodes(nodes);
      console.log('📋 Extracted variables:', variables);

      const payload = {
        nodes,
        edges,
        variables,
      };
      
      console.log('📤 Sending payload to backend:', JSON.stringify(payload, null, 2));

      const result = await updateChatflow(id, payload, selectedProject.id);
      
      console.log('✅ Backend response:', result);

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log("✅ Chatflow saved successfully");
      console.log('💾 ========== SAVE CHATFLOW END ==========');
    } catch (error) {
      console.error("❌ Save error:", error);
      alert("Failed to save chatflow");
    } finally {
      setIsSaving(false);
    }
  }, [id, nodes, edges, updateChatflow, selectedProject?.id]);

  // Update chatflow name handler
  const handleUpdateName = useCallback(async (newName: string) => {
    if (!id) {
      console.error("No chatflow ID");
      return;
    }

    if (!selectedProject?.id) {
      console.error("No project selected");
      return;
    }

    try {
      await updateChatflow(id, {
        name: newName,
      }, selectedProject.id);
      console.log("Chatflow name updated successfully");
    } catch (error) {
      console.error("Update name error:", error);
      alert("Failed to update chatflow name");
    }
  }, [id, updateChatflow, selectedProject?.id]);

  // Delete chatflow handler
  const handleDelete = useCallback(async () => {
    if (!id) {
      console.error("No chatflow ID");
      return;
    }

    if (!selectedProject?.id) {
      console.error("No project selected");
      return;
    }

    try {
      await deleteChatflow(id, selectedProject.id);
      console.log("Chatflow deleted successfully");
      navigate("/kabar-in/chatflow");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete chatflow");
    }
  }, [id, deleteChatflow, navigate, selectedProject?.id]);

  // Toggle lock/unlock handler (changes status between active and draft)
  const handleToggleLock = useCallback(async () => {
    if (!id) {
      console.error("No chatflow ID");
      return;
    }

    if (!selectedProject?.id) {
      console.error("No project selected");
      return;
    }

    const currentStatus = chatflows.find((cf) => cf.id === id)?.status;
    const newStatus = currentStatus === "active" ? "draft" : "active";

    try {
      await updateChatflow(id, {
        status: newStatus,
      }, selectedProject.id);
      console.log(`Chatflow status changed to ${newStatus}`);
    } catch (error) {
      console.error("Toggle lock error:", error);
      alert("Failed to change chatflow status");
    }
  }, [id, chatflows, updateChatflow, selectedProject?.id]);

  // Track changes to nodes/edges (skip on initial load)
  useEffect(() => {
    // Skip marking as unsaved during initial load
    if (isInitialLoad.current) {
      return;
    }

    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges]);

  // Validate on nodes/edges change
  useEffect(() => {
    const result = validateChatflow(nodes, edges);
    setValidation(result);
  }, [nodes, edges]);

  // AUTO-SAVE DISABLED - Manual save only

  // Load chatflow on mount
  useEffect(() => {
    const loadChatflow = async () => {
      if (!id) {
        setIsLoading(false);
        isInitialLoad.current = false;
        return;
      }

      if (!selectedProject?.id) {
        console.log("Waiting for project selection...");
        return;
      }

      try {
        setIsLoading(true);
        isInitialLoad.current = true; // Mark as initial load

        const chatflow = await getChatflowById(id, selectedProject.id);

        console.log('📥 ========== LOAD CHATFLOW ==========');
        console.log('🔍 Loaded chatflow:', chatflow);
        console.log('🔍 Nodes from backend:', chatflow?.nodes);
        console.log('🔍 Nodes count:', chatflow?.nodes?.length);
        
        if (chatflow?.nodes) {
          chatflow.nodes.forEach((node, idx) => {
            console.log(`Loaded Node ${idx + 1}:`, {
              id: node.id,
              type: node.type,
              label: node.data?.label,
              hasConfig: !!node.data?.config,
              config: node.data?.config
            });
          });
        }

        if (chatflow) {
          console.log('✅ Setting nodes state with:', chatflow.nodes);
          setNodes(chatflow.nodes || []);
          setEdges(chatflow.edges || []);
          setHasUnsavedChanges(false);
          setLastSaved(new Date(chatflow.updatedAt));
          console.log('✅ Nodes state set successfully');
        }
        console.log('📥 ========== LOAD CHATFLOW END ==========');
      } catch (error) {
        console.error("Load error:", error);
        alert("Failed to load chatflow");
      } finally {
        setIsLoading(false);
        // Mark initial load as complete after a small delay
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 100);
      }
    };

    loadChatflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedProject?.id]); // Depend on id and selectedProject

  // List view or canvas view
  const isListView = !id;
  
  if (isListView) {
    return <ChatflowList />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background:
            "linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid rgba(245, 158, 11, 0.2)",
              borderTopColor: "#f59e0b",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            Loading chatflow...
          </p>
        </div>
      </div>
    );
  }

  const currentChatflow = chatflows.find((cf) => cf.id === id);
  const isLocked = currentChatflow?.status === "active";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)",
      }}
    >
      {/* Toolbar */}
      <ChatflowToolbar
        chatflowId={id}
        chatflowName={currentChatflow?.name || "Untitled Flow"}
        onBack={() => navigate("/kabar-in/chatflow")}
        onSave={handleSave}
        onUpdateName={handleUpdateName}
        onDelete={handleDelete}
        onToggleLock={handleToggleLock}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        validation={validation}
        isLocked={isLocked}
        currentChatflow={
          currentChatflow
            ? {
                ...currentChatflow,
                nodes,
                edges,
              }
            : undefined
        }
      />
      
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Left Sidebar - Node Palette (hidden when locked) */}
        {!isSidebarCollapsed && !isLocked && (
          <ChatflowSidebar
            onCollapse={() => setIsSidebarCollapsed(true)}
          />
        )}
        
        {/* Center Canvas */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <ChatflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={isLocked ? () => {} : setNodes}
            onEdgesChange={isLocked ? () => {} : setEdges}
            onNodeSelect={setSelectedNode}
            isLocked={isLocked}
          />
        </div>
        
        {/* Right Panel - Properties */}
        {selectedNode && (
          <ChatflowPropertiesPanel
            node={selectedNode}
            allNodes={nodes}
            isLocked={isLocked}
            onUpdate={(updatedNode) => {
              if (isLocked) return; // Prevent updates when locked
              
              console.log('🔄 ChatflowStudio.onUpdate called:', {
                nodeId: updatedNode.id,
                nodeType: updatedNode.type,
                config: updatedNode.data.config,
                fullNode: updatedNode
              });
              
              // Update nodes array
              setNodes((nds) => {
                const updated = nds.map((n) => (n.id === updatedNode.id ? updatedNode : n));
                console.log('✅ Nodes state updated. Total nodes:', updated.length);
                console.log('✅ Updated node in array:', updated.find(n => n.id === updatedNode.id));
                return updated;
              });
              
              // Update selected node to reflect changes in properties panel
              setSelectedNode(updatedNode);
            }}
            onDelete={() => {
              setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
              setSelectedNode(null);
            }}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
