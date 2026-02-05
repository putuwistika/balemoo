import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import type {
  ChatflowNode,
  WaitReplyConfig as WaitReplyConfigType,
} from "@/app/types/chatflow";

interface WaitReplyConfigProps {
  node: ChatflowNode;
  onChange: (updatedNode: ChatflowNode) => void;
}

export function WaitReplyConfig({ node, onChange }: WaitReplyConfigProps) {
  const config = node.data.config as WaitReplyConfigType | null;
  const [inputValue, setInputValue] = useState("");

  const updateConfig = (updates: Partial<WaitReplyConfigType>) => {
    const newConfig = {
      ...(config || {}),
      ...updates,
    } as WaitReplyConfigType;

    console.log('📝 WaitReplyConfig updating:', {
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

  // Expected values as array
  const expectedValues = config?.expectedValues || [];

  const addExpectedValue = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !expectedValues.includes(trimmed)) {
      updateConfig({ expectedValues: [...expectedValues, trimmed] });
    }
    setInputValue("");
  };

  const removeExpectedValue = (valueToRemove: string) => {
    updateConfig({
      expectedValues: expectedValues.filter((v) => v !== valueToRemove),
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ";") {
      e.preventDefault();
      addExpectedValue(inputValue);
    } else if (e.key === "Backspace" && !inputValue && expectedValues.length > 0) {
      // Remove last tag if input is empty
      removeExpectedValue(expectedValues[expectedValues.length - 1]);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addExpectedValue(inputValue);
    }
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
          Timeout (seconds)
        </label>
        <input
          type="number"
          value={config?.timeout || 300}
          onChange={(e) =>
            updateConfig({ timeout: parseInt(e.target.value) || 300 })
          }
          min={0}
          placeholder="300"
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
          How long to wait for a user reply (default: 300 seconds = 5 minutes)
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
          Timeout Action
        </label>
        <select
          value={config?.timeoutAction || "continue"}
          onChange={(e) =>
            updateConfig({ timeoutAction: e.target.value as any })
          }
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
          <option value="continue">Continue to next node</option>
          <option value="end">End flow</option>
        </select>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "4px",
          }}
        >
          What to do when timeout is reached
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
          Save Reply As Variable
        </label>
        <input
          type="text"
          value={config?.saveAs || ""}
          onChange={(e) => updateConfig({ saveAs: e.target.value })}
          placeholder="e.g., userReply, rsvpResponse"
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
          Store the user's reply in a variable for later use
        </p>
      </div>

      {/* Validation Section */}
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
            marginBottom: "12px",
          }}
        >
          Input Validation (Optional)
        </h4>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Expected Values
          </label>
          
          {/* Tags/Chips Container */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#fff",
              minHeight: "42px",
              alignItems: "center",
            }}
          >
            {expectedValues.map((value, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  borderRadius: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "#166534",
                }}
              >
                <span>{value}</span>
                <button
                  type="button"
                  onClick={() => removeExpectedValue(value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "16px",
                    height: "16px",
                    padding: 0,
                    background: "rgba(22, 101, 52, 0.1)",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(22, 101, 52, 0.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(22, 101, 52, 0.1)")}
                >
                  <X size={12} style={{ color: "#166534" }} />
                </button>
              </div>
            ))}
            
            {/* Input for new value */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              placeholder={expectedValues.length === 0 ? "Type and press Enter or ;" : "Add more..."}
              style={{
                flex: 1,
                minWidth: "100px",
                padding: "4px",
                border: "none",
                outline: "none",
                fontSize: "0.875rem",
                background: "transparent",
              }}
            />
          </div>
          
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginTop: "4px",
            }}
          >
            Type a value and press <kbd style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px", border: "1px solid #d1d5db" }}>Enter</kbd> or <kbd style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px", border: "1px solid #d1d5db" }}>;</kbd> to add. Leave empty to accept any input.
          </p>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Retry Message
          </label>
          <textarea
            value={config?.retryMessage || ""}
            onChange={(e) => updateConfig({ retryMessage: e.target.value })}
            placeholder="e.g., Maaf, mohon jawab dengan 'yes' atau 'no' saja."
            rows={3}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginTop: "4px",
            }}
          >
            Message to send when user input is invalid
          </p>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Max Retries
          </label>
          <input
            type="number"
            value={config?.maxRetries || 3}
            onChange={(e) =>
              updateConfig({ maxRetries: parseInt(e.target.value) || 3 })
            }
            min={1}
            max={10}
            placeholder="3"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
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
            Maximum number of retry attempts (default: 3)
          </p>
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
              Case sensitive validation
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
            If checked, "YES" and "yes" will be treated as different
          </p>
        </div>

        {/* Fallback Action Section */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "2px solid #bbf7d0",
          }}
        >
          <h4
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#166534",
              marginBottom: "12px",
            }}
          >
            After Max Retries
          </h4>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Fallback Action
            </label>
            <select
              value={config?.fallbackAction || "end"}
              onChange={(e) =>
                updateConfig({ fallbackAction: e.target.value as "continue" | "end" | "wait_again" })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="end">End flow (stop execution)</option>
              <option value="continue">Continue to next node</option>
              <option value="wait_again">Wait for reply again (unlimited retries)</option>
            </select>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "4px",
              }}
            >
              What to do after max retry attempts reached
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
              Fallback Message
            </label>
            <textarea
              value={config?.fallbackMessage || ""}
              onChange={(e) => updateConfig({ fallbackMessage: e.target.value })}
              placeholder="e.g., Maaf kami tidak dapat memproses jawaban Anda. Silakan hubungi CS kami di +6281234567890"
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "4px",
              }}
            >
              Message to send before {config?.fallbackAction === "continue" ? "continuing" : "ending"} the flow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
