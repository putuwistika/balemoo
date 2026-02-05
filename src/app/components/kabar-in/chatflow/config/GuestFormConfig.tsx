import { useState } from "react";
import { Plus, Trash2, GripVertical, Edit2, X, ChevronDown, ChevronUp } from "lucide-react";
import type {
  ChatflowNode,
  GuestFormConfig as GuestFormConfigType,
  FormQuestion,
  QuestionType,
} from "@/app/types/chatflow";

interface GuestFormConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
  allNodes?: ChatflowNode[]; // For jump target dropdown
}

// Default empty config
const getDefaultConfig = (): GuestFormConfigType => ({
  questions: [],
  enableConfirmation: false,
  confirmationMessage: "",
  confirmYesKeywords: ["ya", "benar", "ok", "sudah"],
  confirmNoKeywords: ["tidak", "salah", "ulang", "bukan"],
  maxQuestionRetries: 3,
  maxConfirmRetries: 3,
  onMaxRetry: {
    sendCSMessage: false,
    csMessage: "",
    action: "end",
    jumpToNodeId: undefined,
  },
});

// Default empty question
const createNewQuestion = (): FormQuestion => ({
  id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  question: "",
  type: "text",
  variableName: "",
  required: true,
  promptMessage: "",
  errorMessage: "Jawaban tidak valid. Silakan coba lagi.",
});

export function GuestFormConfig({ node, onChange, allNodes = [] }: GuestFormConfigProps) {
  const config = (node.data.config as GuestFormConfigType) || getDefaultConfig();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    questions: true,
    confirmation: false,
    retry: false,
    maxRetry: false,
  });

  const updateConfig = (updates: Partial<GuestFormConfigType>) => {
    const newConfig = {
      ...config,
      ...updates,
    };
    onChange({
      ...node,
      data: {
        ...node.data,
        config: newConfig,
      },
    });
  };

  const addQuestion = () => {
    const newQuestion = createNewQuestion();
    updateConfig({
      questions: [...config.questions, newQuestion],
    });
    setEditingQuestionId(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<FormQuestion>) => {
    updateConfig({
      questions: config.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    updateConfig({
      questions: config.questions.filter((q) => q.id !== questionId),
    });
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...config.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    updateConfig({ questions: newQuestions });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get other nodes for jump target dropdown (exclude current node and end nodes)
  const jumpTargetNodes = allNodes.filter(
    (n) => n.id !== node.id && n.type !== "end"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ===== QUESTIONS SECTION ===== */}
      <SectionHeader
        title="Questions"
        count={config.questions.length}
        expanded={expandedSections.questions}
        onToggle={() => toggleSection("questions")}
      />

      {expandedSections.questions && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {config.questions.length === 0 ? (
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
              No questions yet. Add your first question below.
            </div>
          ) : (
            config.questions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                isEditing={editingQuestionId === question.id}
                onEdit={() => setEditingQuestionId(question.id)}
                onSave={() => setEditingQuestionId(null)}
                onUpdate={(updates) => updateQuestion(question.id, updates)}
                onDelete={() => deleteQuestion(question.id)}
                onMoveUp={() => moveQuestion(index, "up")}
                onMoveDown={() => moveQuestion(index, "down")}
                canMoveUp={index > 0}
                canMoveDown={index < config.questions.length - 1}
              />
            ))
          )}

          <button
            onClick={addQuestion}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "8px",
              border: "2px dashed #10b981",
              background: "rgba(16, 185, 129, 0.05)",
              color: "#10b981",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      )}

      {/* ===== CONFIRMATION SECTION ===== */}
      <SectionHeader
        title="Confirmation"
        expanded={expandedSections.confirmation}
        onToggle={() => toggleSection("confirmation")}
        badge={config.enableConfirmation ? "ON" : "OFF"}
        badgeColor={config.enableConfirmation ? "#10b981" : "#6b7280"}
      />

      {expandedSections.confirmation && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.enableConfirmation}
              onChange={(e) => updateConfig({ enableConfirmation: e.target.checked })}
              style={{ width: "16px", height: "16px", accentColor: "#10b981" }}
            />
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
              Enable confirmation before submit
            </span>
          </label>

          {config.enableConfirmation && (
            <>
              <div>
                <label style={labelStyle}>Confirmation Message</label>
                <textarea
                  value={config.confirmationMessage || ""}
                  onChange={(e) => updateConfig({ confirmationMessage: e.target.value })}
                  placeholder="Data Anda:\n- Nama: {{nama}}\n- Jumlah: {{jumlah}} orang\n\nSudah benar? Balas 'Ya' atau 'Tidak'"
                  style={{
                    ...inputStyle,
                    minHeight: "100px",
                    resize: "vertical",
                  }}
                />
                <p style={helpTextStyle}>
                  Use {"{{variableName}}"} to include collected values
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Yes Keywords</label>
                  <input
                    type="text"
                    value={config.confirmYesKeywords?.join(", ") || ""}
                    onChange={(e) =>
                      updateConfig({
                        confirmYesKeywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="ya, benar, ok"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>No Keywords</label>
                  <input
                    type="text"
                    value={config.confirmNoKeywords?.join(", ") || ""}
                    onChange={(e) =>
                      updateConfig({
                        confirmNoKeywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="tidak, salah, ulang"
                    style={inputStyle}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== RETRY SETTINGS SECTION ===== */}
      <SectionHeader
        title="Retry Settings"
        expanded={expandedSections.retry}
        onToggle={() => toggleSection("retry")}
      />

      {expandedSections.retry && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Max Question Retries</label>
              <input
                type="number"
                min={1}
                max={10}
                value={config.maxQuestionRetries || 3}
                onChange={(e) => updateConfig({ maxQuestionRetries: parseInt(e.target.value) || 3 })}
                style={inputStyle}
              />
              <p style={helpTextStyle}>Per invalid answer</p>
            </div>
            <div>
              <label style={labelStyle}>Max Confirm Retries</label>
              <input
                type="number"
                min={1}
                max={10}
                value={config.maxConfirmRetries || 3}
                onChange={(e) => updateConfig({ maxConfirmRetries: parseInt(e.target.value) || 3 })}
                style={inputStyle}
              />
              <p style={helpTextStyle}>When answering &quot;No&quot;</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== AFTER MAX RETRY SECTION ===== */}
      <SectionHeader
        title="After Max Retries"
        expanded={expandedSections.maxRetry}
        onToggle={() => toggleSection("maxRetry")}
      />

      {expandedSections.maxRetry && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.onMaxRetry?.sendCSMessage || false}
              onChange={(e) =>
                updateConfig({
                  onMaxRetry: { ...config.onMaxRetry, sendCSMessage: e.target.checked },
                })
              }
              style={{ width: "16px", height: "16px", accentColor: "#10b981" }}
            />
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
              Send CS contact message
            </span>
          </label>

          {config.onMaxRetry?.sendCSMessage && (
            <div>
              <label style={labelStyle}>CS Message</label>
              <input
                type="text"
                value={config.onMaxRetry?.csMessage || ""}
                onChange={(e) =>
                  updateConfig({
                    onMaxRetry: { ...config.onMaxRetry, csMessage: e.target.value },
                  })
                }
                placeholder="Hubungi CS kami: +62812345678"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Then</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="maxRetryAction"
                  checked={config.onMaxRetry?.action === "end"}
                  onChange={() =>
                    updateConfig({
                      onMaxRetry: { ...config.onMaxRetry, action: "end", jumpToNodeId: undefined },
                    })
                  }
                  style={{ accentColor: "#10b981" }}
                />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>End flow</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="maxRetryAction"
                  checked={config.onMaxRetry?.action === "jump_to_node"}
                  onChange={() =>
                    updateConfig({
                      onMaxRetry: { ...config.onMaxRetry, action: "jump_to_node" },
                    })
                  }
                  style={{ accentColor: "#10b981" }}
                />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>Jump to node:</span>
              </label>

              {config.onMaxRetry?.action === "jump_to_node" && (
                <select
                  value={config.onMaxRetry?.jumpToNodeId || ""}
                  onChange={(e) =>
                    updateConfig({
                      onMaxRetry: { ...config.onMaxRetry, jumpToNodeId: e.target.value || undefined },
                    })
                  }
                  style={{ ...inputStyle, marginLeft: "24px" }}
                >
                  <option value="">Select target node...</option>
                  {jumpTargetNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.data.label || n.type} ({n.type})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              background: "#fef3c7",
              borderRadius: "8px",
              border: "1px solid #fcd34d",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "#92400e", margin: 0 }}>
              <strong>Note:</strong> Max 3 global restarts per guest to prevent infinite loops.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SUBCOMPONENTS =====

interface SectionHeaderProps {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  badgeColor?: string;
}

function SectionHeader({ title, count, expanded, onToggle, badge, badgeColor }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>{title}</span>
        {count !== undefined && (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              background: "#10b981",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {count}
          </span>
        )}
        {badge && (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              background: badgeColor || "#6b7280",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {expanded ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
    </button>
  );
}

interface QuestionItemProps {
  question: FormQuestion;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (updates: Partial<FormQuestion>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function QuestionItem({
  question,
  index,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: QuestionItemProps) {
  if (isEditing) {
    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          border: "2px solid #10b981",
          background: "rgba(16, 185, 129, 0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#10b981" }}>
            Edit Question {index + 1}
          </span>
          <button onClick={onSave} style={iconButtonStyle}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Question Text</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              placeholder="Siapa nama lengkap Anda?"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Answer Type</label>
              <select
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
                style={inputStyle}
              >
                <option value="text">Text (free input)</option>
                <option value="number">Number</option>
                <option value="choice">Choice (options)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Variable Name</label>
              <input
                type="text"
                value={question.variableName}
                onChange={(e) => onUpdate({ variableName: e.target.value.replace(/\s/g, "_") })}
                placeholder="nama"
                style={inputStyle}
              />
              <p style={helpTextStyle}>Available as {"{{" + (question.variableName || "variableName") + "}}"}</p>
            </div>
          </div>

          {question.type === "number" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Min Value</label>
                <input
                  type="number"
                  value={question.min || ""}
                  onChange={(e) => onUpdate({ min: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="1"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Max Value</label>
                <input
                  type="number"
                  value={question.max || ""}
                  onChange={(e) => onUpdate({ max: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="10"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {question.type === "choice" && (
            <div>
              <label style={labelStyle}>Options (one per line)</label>
              <textarea
                value={question.options?.join("\n") || ""}
                onChange={(e) =>
                  onUpdate({
                    options: e.target.value.split("\n").filter(Boolean),
                  })
                }
                placeholder="Halal\nVegetarian\nTidak ada"
                style={{ ...inputStyle, minHeight: "80px" }}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Custom Prompt Message (optional)</label>
            <input
              type="text"
              value={question.promptMessage || ""}
              onChange={(e) => onUpdate({ promptMessage: e.target.value })}
              placeholder="Balas dengan nama lengkap Anda ya!"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Error Message</label>
            <input
              type="text"
              value={question.errorMessage || ""}
              onChange={(e) => onUpdate({ errorMessage: e.target.value })}
              placeholder="Jawaban tidak valid. Silakan coba lagi."
              style={inputStyle}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              style={{ width: "16px", height: "16px", accentColor: "#10b981" }}
            />
            <span style={{ fontSize: "0.875rem", color: "#374151" }}>Required</span>
          </label>
        </div>
      </div>
    );
  }

  // Collapsed view
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", color: "#9ca3af" }}>
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          style={{ ...iconButtonStyle, opacity: canMoveUp ? 1 : 0.3 }}
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          style={{ ...iconButtonStyle, opacity: canMoveDown ? 1 : 0.3 }}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      <GripVertical size={16} color="#9ca3af" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1f2937", marginBottom: "2px" }}>
          Q{index + 1}: {question.question || "(no question text)"}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
          {question.type} | {"{{"}{question.variableName || "?"}{"}}"} | {question.required ? "Required" : "Optional"}
        </div>
      </div>

      <button onClick={onEdit} style={iconButtonStyle} title="Edit">
        <Edit2 size={16} color="#6b7280" />
      </button>
      <button onClick={onDelete} style={iconButtonStyle} title="Delete">
        <Trash2 size={16} color="#ef4444" />
      </button>
    </div>
  );
}

// ===== STYLES =====

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "0.875rem",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.2s",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#9ca3af",
  marginTop: "4px",
  margin: "4px 0 0 0",
};

const iconButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: "4px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  transition: "background 0.2s",
};
