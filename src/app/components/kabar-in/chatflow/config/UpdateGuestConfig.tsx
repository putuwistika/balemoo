import { Plus, Trash2 } from "lucide-react";
import type {
  ChatflowNode,
  UpdateGuestConfig as UpdateGuestConfigType,
  VariableMapping,
  GuestFormConfig,
} from "@/app/types/chatflow";

interface UpdateGuestConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
  allNodes?: ChatflowNode[]; // To get available variables from guest_form nodes
}

// Guest field options for mapping
const GUEST_FIELDS = [
  { value: "name", label: "Guest Name" },
  { value: "phone", label: "Phone Number" },
  { value: "email", label: "Email" },
  { value: "plus_one_count", label: "Plus One Count" },
  { value: "tags", label: "Tags (append)" },
  { value: "notes", label: "Notes" },
  { value: "rsvp_status", label: "RSVP Status" },
  { value: "table_number", label: "Table Number" },
  { value: "custom", label: "Custom Field..." },
];

export function UpdateGuestConfig({
  node,
  onChange,
  allNodes = [],
}: UpdateGuestConfigProps) {
  const config = node.data.config as UpdateGuestConfigType | null;

  // Get available variables from guest_form nodes in the flow
  const availableVariables = allNodes
    .filter((n) => n.type === "guest_form")
    .flatMap((n) => {
      const formConfig = n.data.config as GuestFormConfig | null;
      return formConfig?.questions?.map((q) => q.variableName).filter(Boolean) || [];
    });

  const updateConfig = (updates: Partial<UpdateGuestConfigType>) => {
    const newConfig = {
      ...(config || { action: "update_rsvp" }),
      ...updates,
    } as UpdateGuestConfigType;

    console.log("UpdateGuestConfig updating:", {
      nodeId: node.id,
      oldConfig: config,
      updates,
      newConfig,
    });

    onChange({
      ...node,
      data: {
        ...node.data,
        config: newConfig,
      },
    });
  };

  const addMapping = () => {
    const currentMappings = config?.variableMappings || [];
    updateConfig({
      variableMappings: [
        ...currentMappings,
        { sourceVariable: "", targetField: "name" },
      ],
    });
  };

  const updateMapping = (index: number, updates: Partial<VariableMapping>) => {
    const currentMappings = config?.variableMappings || [];
    const newMappings = [...currentMappings];
    newMappings[index] = { ...newMappings[index], ...updates };
    updateConfig({ variableMappings: newMappings });
  };

  const deleteMapping = (index: number) => {
    const currentMappings = config?.variableMappings || [];
    updateConfig({
      variableMappings: currentMappings.filter((_, i) => i !== index),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <label style={labelStyle}>Action</label>
        <select
          value={config?.action || "update_rsvp"}
          onChange={(e) => updateConfig({ action: e.target.value as any })}
          style={selectStyle}
        >
          <option value="map_from_variables">Map from Variables (Guest Form)</option>
          <option value="add_tag">Add Tag</option>
          <option value="remove_tag">Remove Tag</option>
          <option value="update_rsvp">Update RSVP Status</option>
          <option value="update_field">Update Custom Field</option>
        </select>
      </div>

      {/* ===== MAP FROM VARIABLES (NEW!) ===== */}
      {config?.action === "map_from_variables" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {availableVariables.length > 0 && (
            <div
              style={{
                padding: "12px",
                background: "#ecfdf5",
                borderRadius: "8px",
                border: "1px solid #a7f3d0",
              }}
            >
              <p style={{ fontSize: "0.75rem", color: "#065f46", margin: 0 }}>
                <strong>Available variables:</strong> {availableVariables.map((v) => `{{${v}}}`).join(", ")}
              </p>
            </div>
          )}

          {(config?.variableMappings?.length || 0) === 0 ? (
            <div
              style={{
                padding: "16px",
                background: "#f9fafb",
                borderRadius: "8px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              No mappings configured. Add mappings to save form data to guest record.
            </div>
          ) : (
            config?.variableMappings?.map((mapping, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px",
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: "4px", fontSize: "0.75rem" }}>
                    Variable
                  </label>
                  {availableVariables.length > 0 ? (
                    <select
                      value={mapping.sourceVariable}
                      onChange={(e) => updateMapping(index, { sourceVariable: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="">Select variable...</option>
                      {availableVariables.map((v) => (
                        <option key={v} value={v}>
                          {`{{${v}}}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={mapping.sourceVariable}
                      onChange={(e) => updateMapping(index, { sourceVariable: e.target.value })}
                      placeholder="variableName"
                      style={inputStyle}
                    />
                  )}
                </div>

                <div style={{ padding: "20px 8px 0", color: "#9ca3af", fontSize: "1.2rem" }}>
                  →
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: "4px", fontSize: "0.75rem" }}>
                    Guest Field
                  </label>
                  <select
                    value={mapping.targetField}
                    onChange={(e) =>
                      updateMapping(index, {
                        targetField: e.target.value as VariableMapping["targetField"],
                      })
                    }
                    style={selectStyle}
                  >
                    {GUEST_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                {mapping.targetField === "custom" && (
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, marginBottom: "4px", fontSize: "0.75rem" }}>
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={mapping.customFieldName || ""}
                      onChange={(e) => updateMapping(index, { customFieldName: e.target.value })}
                      placeholder="customField"
                      style={inputStyle}
                    />
                  </div>
                )}

                <button
                  onClick={() => deleteMapping(index)}
                  style={{
                    ...iconButtonStyle,
                    marginTop: "20px",
                  }}
                  title="Delete mapping"
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            ))
          )}

          <button
            onClick={addMapping}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "8px",
              border: "2px dashed #ec4899",
              background: "rgba(236, 72, 153, 0.05)",
              color: "#ec4899",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Plus size={18} />
            Add Mapping
          </button>
        </div>
      )}

      {/* Add Tag */}
      {config?.action === "add_tag" && (
        <div>
          <label style={labelStyle}>Tag Name</label>
          <input
            type="text"
            value={config.tagName || ""}
            onChange={(e) => updateConfig({ tagName: e.target.value })}
            placeholder="e.g., confirmed, vip, family"
            style={inputStyle}
          />
        </div>
      )}

      {/* Remove Tag */}
      {config?.action === "remove_tag" && (
        <div>
          <label style={labelStyle}>Tag Name</label>
          <input
            type="text"
            value={config.tagName || ""}
            onChange={(e) => updateConfig({ tagName: e.target.value })}
            placeholder="e.g., pending"
            style={inputStyle}
          />
        </div>
      )}

      {/* Update RSVP */}
      {config?.action === "update_rsvp" && (
        <div>
          <label style={labelStyle}>RSVP Status</label>
          <select
            value={config.rsvpStatus || ""}
            onChange={(e) => updateConfig({ rsvpStatus: e.target.value })}
            style={selectStyle}
          >
            <option value="">Select status</option>
            <option value="confirmed">Confirmed (Hadir)</option>
            <option value="declined">Declined (Tidak Hadir)</option>
            <option value="maybe">Maybe (Mungkin)</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      )}

      {/* Update Custom Field */}
      {config?.action === "update_field" && (
        <>
          <div>
            <label style={labelStyle}>Field Name</label>
            <input
              type="text"
              value={config.fieldName || ""}
              onChange={(e) => updateConfig({ fieldName: e.target.value })}
              placeholder="e.g., tableNumber, dietaryRestrictions"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Field Value</label>
            <input
              type="text"
              value={config.fieldValue || ""}
              onChange={(e) => updateConfig({ fieldValue: e.target.value })}
              placeholder="e.g., 5, vegetarian, {{userReply}}"
              style={inputStyle}
            />
            <p style={helpTextStyle}>
              You can use variables like <code>{"{{userReply}}"}</code>
            </p>
          </div>
        </>
      )}

      <div
        style={{
          padding: "12px",
          background: "#fce7f3",
          borderRadius: "8px",
          border: "1px solid #fbcfe8",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "#831843",
            fontWeight: 500,
            margin: 0,
          }}
        >
          <strong>Note:</strong> Changes will be applied to the guest record in the database
        </p>
      </div>
    </div>
  );
}

// ===== STYLES =====

const labelStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "8px",
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "0.875rem",
  background: "#fff",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "0.875rem",
  background: "#fff",
  cursor: "pointer",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#6b7280",
  marginTop: "4px",
};

const iconButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  borderRadius: "8px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  transition: "background 0.2s",
};
