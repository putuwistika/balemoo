import { useTemplates } from "@/app/contexts/TemplateContext";
import { TemplatePreview } from "@/app/components/kabar-in/TemplatePreview";
import type {
  ChatflowNode,
  SendTemplateConfig as SendTemplateConfigType,
} from "@/app/types/chatflow";

interface SendTemplateConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
}

export function SendTemplateConfig({
  node,
  onChange,
}: SendTemplateConfigProps) {
  const { templates } = useTemplates();
  const config = node.data.config as SendTemplateConfigType | null;

  // Filter only APPROVED templates
  const approvedTemplates = templates.filter((t) => t.status === "APPROVED");

  // Get selected template
  const selectedTemplate = approvedTemplates.find(
    (t) => t.id === config?.templateId
  );

  // Extract variables from template
  const extractVariables = (text: string): string[] => {
    if (!text) return [];
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.matchAll(regex);
    const variables = new Set<string>();
    for (const match of matches) {
      variables.add(match[1]);
    }
    return Array.from(variables);
  };

  const variables = selectedTemplate
    ? extractVariables(selectedTemplate.content.body.text)
    : [];

  const updateConfig = (updates: Partial<SendTemplateConfigType>) => {
    const newConfig = {
      ...(config || { templateId: "", templateName: "" }),
      ...updates,
    } as SendTemplateConfigType;

    console.log('📝 SendTemplateConfig updating:', {
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

  const updateVariable = (varName: string, value: string) => {
    const newVariables = {
      ...(config?.variables || {}),
      [varName]: value,
    };
    updateConfig({ variables: newVariables });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Template Selection */}
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
          WhatsApp Template
        </label>
        <select
          value={config?.templateId || ""}
          onChange={(e) => {
            const template = approvedTemplates.find(
              (t) => t.id === e.target.value
            );
            // Update config AND label
            onChange({
              ...node,
              data: {
                ...node.data,
                label: template?.name || "Send Template",
                config: {
                  ...(config || { templateId: "", templateName: "" }),
                  templateId: e.target.value,
                  templateName: template?.name || "",
                } as SendTemplateConfigType,
              },
            });
          }}
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
          <option value="">Select Template</option>
          {approvedTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.category})
            </option>
          ))}
        </select>
        {approvedTemplates.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#dc2626",
              marginTop: "4px",
            }}
          >
            No approved templates available. Create and approve a template
            first.
          </p>
        )}
      </div>

      {/* Template Preview */}
      {selectedTemplate && (
        <div
          style={{
            padding: "16px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Preview
          </h4>
          <TemplatePreview
            template={selectedTemplate}
            sampleData={Object.fromEntries(
              variables.map((v) => [v, config?.variables?.[v] || `[${v}]`])
            )}
          />
        </div>
      )}

      {/* Variable Mapping */}
      {variables.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Variable Mapping
          </h4>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginBottom: "12px",
            }}
          >
            Map template variables to guest fields or flow variables
          </p>
          {variables.map((varName) => {
            const value = config?.variables?.[varName] || "";
            return (
              <div key={varName} style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "#6b7280",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  {`{{${varName}}}`}
                </label>
                <select
                  value={value}
                  onChange={(e) => updateVariable(varName, e.target.value)}
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
                  <option value="">Select source</option>
                  <optgroup label="Guest Fields">
                    <option value="{{guest.name}}">Guest Name</option>
                    <option value="{{guest.phone}}">Guest Phone</option>
                    <option value="{{guest.email}}">Guest Email</option>
                    <option value="{{guest.table}}">Table Number</option>
                    <option value="{{guest.rsvpStatus}}">RSVP Status</option>
                  </optgroup>
                  <optgroup label="Event Fields">
                    <option value="{{event.name}}">Event Name</option>
                    <option value="{{event.date}}">Event Date</option>
                    <option value="{{event.venue}}">Event Venue</option>
                  </optgroup>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
