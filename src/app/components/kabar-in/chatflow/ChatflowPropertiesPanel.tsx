import { X, Trash2, Lock } from "lucide-react";
import { motion } from "motion/react";
import type { ChatflowNode } from "@/app/types/chatflow";
import { TriggerConfig } from "./config/TriggerConfig";
import { SendTemplateConfig } from "./config/SendTemplateConfig";
import { WaitReplyConfig } from "./config/WaitReplyConfig";
import { ConditionConfig } from "./config/ConditionConfig";
import { DelayConfig } from "./config/DelayConfig";
import { GuestFormConfig } from "./config/GuestFormConfig";
import { UpdateGuestConfig } from "./config/UpdateGuestConfig";
import { EndConfig } from "./config/EndConfig";

interface ChatflowPropertiesPanelProps {
  node: ChatflowNode;
  allNodes: ChatflowNode[];
  isLocked?: boolean;
  onUpdate: (node: ChatflowNode) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ChatflowPropertiesPanel({
  node,
  allNodes,
  isLocked = false,
  onUpdate,
  onDelete,
  onClose,
}: ChatflowPropertiesPanelProps) {
  const handleLabelChange = (newLabel: string) => {
    if (isLocked) return;
    onUpdate({
      ...node,
      data: {
        ...node.data,
        label: newLabel,
      },
    });
  };

  const nodeTypeLabels: Record<string, string> = {
    trigger: "Trigger Node",
    send_template: "Send Template Node",
    wait_reply: "Wait Reply Node",
    condition: "Condition Node",
    delay: "Delay Node",
    guest_form: "Guest Form Node",
    update_guest: "Update Guest Node",
    end: "End Node",
  };

  return (
    <div
      style={{
        width: "320px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(245, 158, 11, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h3
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Properties
          </h3>
          {isLocked && (
            <div
              title="Chatflow is locked (active)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "6px",
              }}
            >
              <Lock size={12} style={{ color: "#f59e0b" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#f59e0b" }}>Locked</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(0, 0, 0, 0.05)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} style={{ color: "#6b7280" }} />
        </button>
      </div>

      {/* Locked Warning Banner */}
      {isLocked && (
        <div
          style={{
            padding: "12px 1.5rem",
            background: "rgba(245, 158, 11, 0.1)",
            borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Lock size={14} style={{ color: "#f59e0b" }} />
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              color: "#92400e",
            }}
          >
            This chatflow is active. Unlock to edit.
          </span>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
        }}
      >
        {/* Node Type */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Node Type
          </label>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              color: "#1f2937",
              padding: "10px 12px",
              background: "rgba(245, 158, 11, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            {nodeTypeLabels[node.type] || node.type}
          </div>
        </div>

        {/* Label */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Label
          </label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            disabled={isLocked}
            style={{
              width: "100%",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              color: isLocked ? "#9ca3af" : "#1f2937",
              padding: "10px 12px",
              background: isLocked ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              outline: "none",
              cursor: isLocked ? "not-allowed" : "text",
            }}
          />
        </div>

        {/* Configuration Form */}
        <div style={{ marginBottom: "1.5rem", opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? "none" : "auto" }}>
          <label
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "12px",
            }}
          >
            Configuration
          </label>

          {node.type === "trigger" && (
            <TriggerConfig node={node} onChange={onUpdate} />
          )}

          {node.type === "send_template" && (
            <SendTemplateConfig node={node} onChange={onUpdate} />
          )}

          {node.type === "wait_reply" && (
            <WaitReplyConfig node={node} onChange={onUpdate} />
          )}

          {node.type === "condition" && (
            <ConditionConfig node={node} onChange={onUpdate} />
          )}

          {node.type === "delay" && (
            <DelayConfig node={node} onChange={onUpdate} />
          )}

          {node.type === "guest_form" && (
            <GuestFormConfig node={node} onChange={onUpdate} allNodes={allNodes} />
          )}

          {node.type === "update_guest" && (
            <UpdateGuestConfig node={node} onChange={onUpdate} allNodes={allNodes} />
          )}

          {node.type === "end" && (
            <EndConfig node={node} onChange={onUpdate} />
          )}
        </div>
      </div>

      {/* Footer - Delete Button */}
      {!isLocked && (
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDelete}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#ef4444",
              transition: "all 0.2s ease",
            }}
          >
            <Trash2 size={16} />
            Delete Node
          </motion.button>
        </div>
      )}
    </div>
  );
}
