import { motion } from "motion/react";
import {
  Workflow,
  Mail,
  Clock,
  GitBranch,
  Timer,
  ClipboardList,
  UserCog,
  Flag,
} from "lucide-react";

interface NodeType {
  type: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  description: string;
  color: string;
}

const nodeTypes: NodeType[] = [
  {
    type: "trigger",
    icon: Workflow,
    label: "Start",
    description: "Flow starting point",
    color: "#f59e0b",
  },
  {
    type: "send_template",
    icon: Mail,
    label: "Send Template",
    description: "Send WhatsApp template",
    color: "#06b6d4",
  },
  {
    type: "wait_reply",
    icon: Clock,
    label: "Wait Reply",
    description: "Wait for user response",
    color: "#3b82f6",
  },
  {
    type: "condition",
    icon: GitBranch,
    label: "Condition",
    description: "Branch based on logic",
    color: "#8b5cf6",
  },
  {
    type: "delay",
    icon: Timer,
    label: "Delay",
    description: "Wait for duration",
    color: "#10b981",
  },
  {
    type: "guest_form",
    icon: ClipboardList,
    label: "Guest Form",
    description: "Collect guest information",
    color: "#10b981",
  },
  {
    type: "update_guest",
    icon: UserCog,
    label: "Update Guest",
    description: "Update guest data",
    color: "#ec4899",
  },
  {
    type: "end",
    icon: Flag,
    label: "End",
    description: "Flow ending point",
    color: "#64748b",
  },
];

interface ChatflowSidebarProps {
  onCollapse: () => void;
}

export function ChatflowSidebar({ onCollapse }: ChatflowSidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      style={{
        width: "280px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(245, 158, 11, 0.1)",
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
        }}
      >
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
          Node Palette
        </h3>
        <p
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.75rem",
            color: "#6b7280",
            margin: "4px 0 0 0",
          }}
        >
          Drag nodes to canvas
        </p>
      </div>

      {/* Node List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {nodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e as any, node.type)}
                whileHover={{ scale: 1.02, x: 4 }}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${node.color}15 0%, ${node.color}08 100%)`,
                  border: `1px solid ${node.color}30`,
                  cursor: "grab",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${node.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} style={{ color: node.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#1f2937",
                        marginBottom: "2px",
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                      }}
                    >
                      {node.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
