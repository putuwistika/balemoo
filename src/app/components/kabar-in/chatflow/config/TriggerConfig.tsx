import type { ChatflowNode } from "@/app/types/chatflow";

interface TriggerConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
}

export function TriggerConfig({ node }: TriggerConfigProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          padding: "16px",
          background: "#f0fdf4",
          borderRadius: "12px",
          border: "1px solid #bbf7d0",
        }}
      >
        <h4
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#166534",
            marginBottom: "8px",
          }}
        >
          Start Node
        </h4>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#15803d",
            lineHeight: "1.5",
          }}
        >
          This is the <strong>starting point</strong> of your flow. Every flow
          must have exactly one Start node.
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#15803d",
            lineHeight: "1.5",
            marginTop: "8px",
          }}
        >
          The Start node doesn't trigger anything automatically - it simply
          marks where the flow begins when executed.
        </p>
      </div>

      <div
        style={{
          padding: "12px",
          background: "#eff6ff",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "#1e40af",
            margin: 0,
          }}
        >
          💡 <strong>Tip:</strong> Connect the Start node to your first action
          (usually Send Template).
        </p>
      </div>
    </div>
  );
}
