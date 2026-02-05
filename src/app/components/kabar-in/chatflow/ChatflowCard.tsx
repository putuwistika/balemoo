import { useState } from "react";
import { motion } from "motion/react";
import { Workflow, Trash2, Lock } from "lucide-react";
import type { Chatflow } from "@/app/types/chatflow";

interface ChatflowCardProps {
  chatflow: Chatflow;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export function ChatflowCard({ chatflow, onClick, onDelete }: ChatflowCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: "rgba(100, 116, 139, 0.1)", text: "#64748b" },
    active: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981" },
    paused: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b" },
    archived: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" },
  };

  const statusColor = statusColors[chatflow.status] || statusColors.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        position: "relative",
        padding: "1.5rem",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(245, 158, 11, 0.2)",
        borderRadius: "24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: isHovered
          ? "0 20px 60px rgba(245, 158, 11, 0.2)"
          : "0 8px 32px rgba(0, 0, 0, 0.08)",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Workflow size={24} style={{ color: "#f59e0b" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Lock indicator for active status */}
          {chatflow.status === "active" && (
            <div
              title="Locked - Active chatflow"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={14} style={{ color: "#f59e0b" }} />
            </div>
          )}

          {/* Delete button */}
          {onDelete && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                title="Delete chatflow"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Trash2 size={14} style={{ color: "#ef4444" }} />
              </button>

              {/* Delete Confirmation Popup */}
              {showDeleteConfirm && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "36px",
                    right: "0",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    minWidth: "260px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", fontWeight: 600, color: "#1f2937" }}>
                    Delete "{chatflow.name}"?
                  </h4>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#6b7280" }}>
                    This action cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteConfirm(false);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        color: "#374151",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteConfirm(false);
                        onDelete(chatflow.id);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              padding: "4px 12px",
              background: statusColor.bg,
              border: `1px solid ${statusColor.text}30`,
              borderRadius: "8px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: statusColor.text,
              textTransform: "capitalize",
            }}
          >
            {chatflow.status}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#1f2937",
          marginBottom: "0.5rem",
        }}
      >
        {chatflow.name}
      </h3>

      {/* Description */}
      {chatflow.description && (
        <p
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.875rem",
            color: "#6b7280",
            marginBottom: "1rem",
            lineHeight: "1.5",
          }}
        >
          {chatflow.description}
        </p>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
        <div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginBottom: "2px",
            }}
          >
            Nodes
          </div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#1f2937",
            }}
          >
            {chatflow.nodes.length}
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              color: "#9ca3af",
              marginBottom: "2px",
            }}
          >
            Variables
          </div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#1f2937",
            }}
          >
            {chatflow.variables.length}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "0.75rem",
          color: "#9ca3af",
        }}
      >
        Updated {new Date(chatflow.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>
    </motion.div>
  );
}
