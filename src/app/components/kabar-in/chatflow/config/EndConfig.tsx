import type { ChatflowNode } from "@/app/types/chatflow";

interface EndConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
}

export function EndConfig({ node, onChange }: EndConfigProps) {
  const config = node.data.config as { reason?: string } | null;

  const updateConfig = (reason: string) => {
    console.log('📝 EndConfig updating:', {
      nodeId: node.id,
      oldConfig: config,
      newReason: reason
    });

    onChange({
      ...node,
      data: {
        ...node.data,
        config: { reason },
      },
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "8px",
            display: "block",
          }}
        >
          End Reason
        </label>
        <select
          value={config?.reason || "completed"}
          onChange={(e) => updateConfig(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "0.875rem",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="completed">Flow Completed</option>
          <option value="user_declined">User Declined</option>
          <option value="timeout">Timeout</option>
          <option value="error">Error Occurred</option>
          <option value="custom">Custom Reason</option>
        </select>
      </div>

      {config?.reason === "custom" && (
        <div>
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Custom Reason
          </label>
          <textarea
            value={(config as any)?.customReason || ""}
            onChange={(e) =>
              onChange({
                ...node,
                data: {
                  ...node.data,
                  config: {
                    reason: "custom",
                    customReason: e.target.value,
                  },
                },
              })
            }
            placeholder="Describe why the flow ended"
            rows={3}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "0.875rem",
              resize: "vertical",
            }}
          />
        </div>
      )}

      <div
        style={{
          padding: "12px",
          background: "#f3f4f6",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "#374151",
            fontWeight: 500,
          }}
        >
          End Node
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "4px",
          }}
        >
          This node marks the end of the conversation flow. No further nodes
          will be executed after this point.
        </p>
      </div>

      <div
        style={{
          padding: "12px",
          background: "#dbeafe",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "#1e40af",
            fontWeight: 500,
          }}
        >
          <strong>Best Practice:</strong> Always provide at least one end node
          in your flow to properly terminate the conversation.
        </p>
      </div>
    </div>
  );
}
