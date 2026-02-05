import type {
  ChatflowNode,
  DelayConfig as DelayConfigType,
} from "@/app/types/chatflow";

interface DelayConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
}

export function DelayConfig({ node, onChange }: DelayConfigProps) {
  const config = node.data.config as DelayConfigType | null;

  const updateConfig = (updates: Partial<DelayConfigType>) => {
    const newConfig = {
      ...(config || { duration: 1, unit: "seconds" }),
      ...updates,
    } as DelayConfigType;

    console.log('📝 DelayConfig updating:', {
      nodeId: node.id,
      oldConfig: config,
      updates,
      newConfig
    });

    onChange({
      ...node,
      data: {
        ...node.data,
        config: newConfig,
      },
    });
  };

  const getDurationLabel = () => {
    const duration = config?.duration || 1;
    const unit = config?.unit || "seconds";

    if (duration === 1) {
      return `1 ${unit.slice(0, -1)}`; // Remove 's' for singular
    }

    return `${duration} ${unit}`;
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
          Duration
        </label>
        <input
          type="number"
          value={config?.duration || 1}
          onChange={(e) =>
            updateConfig({ duration: parseInt(e.target.value) || 1 })
          }
          min={1}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "0.875rem",
          }}
        />
      </div>

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
          Time Unit
        </label>
        <select
          value={config?.unit || "seconds"}
          onChange={(e) => updateConfig({ unit: e.target.value as any })}
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
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>

      <div
        style={{
          padding: "12px",
          background: "#f0fdf4",
          borderRadius: "8px",
          border: "1px solid #bbf7d0",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "#166534",
            fontWeight: 500,
          }}
        >
          Will wait for: <strong>{getDurationLabel()}</strong>
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#15803d",
            marginTop: "4px",
          }}
        >
          The flow will pause before continuing to the next node
        </p>
      </div>
    </div>
  );
}
