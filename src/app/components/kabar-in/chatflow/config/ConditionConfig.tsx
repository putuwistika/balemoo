import type {
  ChatflowNode,
  ConditionConfig as ConditionConfigType,
} from "@/app/types/chatflow";

interface ConditionConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
}

export function ConditionConfig({ node, onChange }: ConditionConfigProps) {
  const config = node.data.config as ConditionConfigType | null;

  const updateConfig = (updates: Partial<ConditionConfigType>) => {
    const newConfig = {
      ...(config || { variable: "", operator: "equals", value: "" }),
      ...updates,
    } as ConditionConfigType;

    console.log('📝 ConditionConfig updating:', { 
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
          Variable to Check
        </label>
        <input
          type="text"
          value={config?.variable || ""}
          onChange={(e) => updateConfig({ variable: e.target.value })}
          placeholder="e.g., userReply, rsvpStatus"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "0.875rem",
          }}
        />
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "4px",
          }}
        >
          Variable name from wait_reply or set_variable nodes
        </p>
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
          Operator
        </label>
        <select
          value={config?.operator || "equals"}
          onChange={(e) => updateConfig({ operator: e.target.value as any })}
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
          <option value="equals">Equals</option>
          <option value="not_equals">Not Equals</option>
          <option value="contains">Contains</option>
          <option value="matches">Matches (regex)</option>
        </select>
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
          Value to Compare
        </label>
        <input
          type="text"
          value={config?.value || ""}
          onChange={(e) => updateConfig({ value: e.target.value })}
          placeholder="e.g., yes, confirm, hadir"
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
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={config?.caseSensitive || false}
            onChange={(e) => updateConfig({ caseSensitive: e.target.checked })}
            style={{
              width: "16px",
              height: "16px",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Case sensitive
          </span>
        </label>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "4px",
            marginLeft: "24px",
          }}
        >
          If unchecked, "YES" and "yes" will be treated as the same
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
            fontWeight: 500,
          }}
        >
          <strong>Note:</strong> Connect two edges from this node:
        </p>
        <ul
          style={{
            fontSize: "0.75rem",
            color: "#1e40af",
            marginTop: "4px",
            paddingLeft: "20px",
          }}
        >
          <li>True path: When condition matches</li>
          <li>False path: When condition doesn't match</li>
        </ul>
      </div>
    </div>
  );
}
