import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Search, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatflows } from "@/app/contexts/ChatflowContext";
import { useProject } from "@/app/contexts/ProjectContext";
import { ChatflowCard } from "./ChatflowCard";
import { CloneChatflowModal } from "./CloneChatflowModal";
import { toast } from "sonner";

export function ChatflowList() {
  const navigate = useNavigate();
  const { chatflows, createChatflow, deleteChatflow, loading } = useChatflows();
  const { selectedProject } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

  const handleCreateChatflow = async () => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    setIsCreating(true);
    try {
      const newChatflow = await createChatflow({
        name: `Untitled Flow ${chatflows.length + 1}`,
        description: "New chatflow",
        projectId: selectedProject.id,
      });
      toast.success("Chatflow created successfully");
      navigate(`/kabar-in/chatflow/${newChatflow.id}`);
    } catch (error) {
      toast.error("Failed to create chatflow");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteChatflow = async (id: string) => {
    if (!selectedProject?.id) {
      toast.error("Please select a project first");
      return;
    }

    try {
      await deleteChatflow(id, selectedProject.id);
      toast.success("Chatflow deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chatflow");
    }
  };

  const filteredChatflows = chatflows.filter((cf) =>
    cf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "0.5rem",
            }}
          >
            Chatflow Studio
          </h1>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              color: "#6b7280",
            }}
          >
            Design automated conversation flows with visual drag-and-drop builder
          </p>
        </div>

        {/* Search & Create */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              placeholder="Search chatflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                color: "#1f2937",
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                outline: "none",
              }}
            />
          </div>

          {/* Clone from Other Project Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCloneModalOpen(true)}
            style={{
              padding: "12px 24px",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#f59e0b",
            }}
          >
            <Copy size={18} />
            Clone from Project
          </motion.button>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateChatflow}
            disabled={isCreating}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              border: "none",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: isCreating ? "not-allowed" : "pointer",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            <Plus size={18} />
            Create Chatflow
          </motion.button>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1rem",
                color: "#6b7280",
              }}
            >
              Loading chatflows...
            </div>
          </div>
        ) : filteredChatflows.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: "24px",
              border: "2px dashed rgba(245, 158, 11, 0.2)",
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              {searchQuery ? "No chatflows found" : "No chatflows yet"}
            </div>
            <div
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              {searchQuery
                ? "Try a different search term"
                : "Create your first chatflow to get started"}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredChatflows.map((chatflow) => (
              <ChatflowCard
                key={chatflow.id}
                chatflow={chatflow}
                onClick={() => navigate(`/kabar-in/chatflow/${chatflow.id}`)}
                onDelete={handleDeleteChatflow}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clone from Other Project Modal */}
      <CloneChatflowModal
        open={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onSuccess={() => {
          // Just close modal and stay in list - don't navigate to editor
          setIsCloneModalOpen(false);
        }}
      />
    </div>
  );
}
