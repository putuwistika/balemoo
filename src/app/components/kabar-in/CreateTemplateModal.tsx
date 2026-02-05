import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTemplates } from "@/app/contexts/TemplateContext";
import { useProject } from "@/app/contexts/ProjectContext";
import type {
  WhatsAppTemplate,
  CreateTemplateInput,
  TemplateCategory,
  TemplateLanguage,
  TemplateHeaderType,
  ButtonType,
} from "@/app/types/template";
import { TemplatePreview } from "./TemplatePreview";
import { toast } from "sonner";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTemplate?: WhatsAppTemplate | null;
}

export function CreateTemplateModal({ isOpen, onClose, editTemplate }: CreateTemplateModalProps) {
  const { createTemplate, updateTemplate, submitTemplate } = useTemplates();
  const { selectedProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("MARKETING");
  const [language, setLanguage] = useState<TemplateLanguage>("id");
  const [headerType, setHeaderType] = useState<TemplateHeaderType | "NONE">("NONE");
  const [headerText, setHeaderText] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [buttons, setButtons] = useState<Array<{ type: ButtonType; text: string; url?: string; phoneNumber?: string }>>([]);

  // Load edit template data
  useEffect(() => {
    if (editTemplate) {
      setName(editTemplate.name);
      setCategory(editTemplate.category);
      setLanguage(editTemplate.language);
      setHeaderType(editTemplate.content?.header?.type || "NONE");
      setHeaderText(editTemplate.content?.header?.text || "");
      setBody(editTemplate.content?.body?.text || "");
      setFooter(editTemplate.content?.footer?.text || "");
      setButtons(editTemplate.content?.buttons || []);
    } else {
      // Reset form
      setName("");
      setCategory("MARKETING");
      setLanguage("id");
      setHeaderType("NONE");
      setHeaderText("");
      setBody("");
      setFooter("");
      setButtons([]);
    }
  }, [editTemplate, isOpen]);

  // Extract variables from body and header
  const detectedVariables = useMemo(() => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();

    // Extract from header
    if (headerType === "TEXT" && headerText) {
      let match;
      while ((match = variableRegex.exec(headerText)) !== null) {
        variables.add(match[1]);
      }
    }

    // Extract from body
    if (body) {
      let match;
      while ((match = variableRegex.exec(body)) !== null) {
        variables.add(match[1]);
      }
    }

    return Array.from(variables);
  }, [headerType, headerText, body]);

  // Sample data for preview
  const sampleData = useMemo(() => {
    const data: Record<string, string> = {};
    detectedVariables.forEach((variable) => {
      // Generate sample data based on variable name
      if (variable.toLowerCase().includes("name")) {
        data[variable] = "John Doe";
      } else if (variable.toLowerCase().includes("date")) {
        data[variable] = "Feb 5, 2026";
      } else if (variable.toLowerCase().includes("time")) {
        data[variable] = "7:00 PM";
      } else if (variable.toLowerCase().includes("event")) {
        data[variable] = "Annual Gala";
      } else if (variable.toLowerCase().includes("venue")) {
        data[variable] = "Grand Ballroom";
      } else {
        data[variable] = "Sample";
      }
    });
    return data;
  }, [detectedVariables]);

  const handleAddButton = () => {
    if (buttons.length >= 3) {
      toast.error("Maximum 3 buttons allowed");
      return;
    }
    setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index: number, field: string, value: string) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setButtons(newButtons);
  };

  const validateForm = (): string | null => {
    // Name validation
    if (!name.trim()) return "Template name is required";
    if (!/^[a-z0-9_]+$/.test(name)) {
      return "Template name must be lowercase alphanumeric with underscores only";
    }

    // Body validation
    if (!body.trim()) return "Template body is required";
    if (body.length > 1024) return "Template body must be 1024 characters or less";

    // Variables validation
    if (detectedVariables.length > 10) return "Maximum 10 variables allowed";

    // Header validation
    if (headerType === "TEXT" && !headerText.trim()) {
      return "Header text is required when header type is TEXT";
    }

    // Button validation
    for (const button of buttons) {
      if (!button.text.trim()) return "All buttons must have text";
      if (button.type === "URL" && !button.url) return "URL buttons must have a URL";
      if (button.type === "PHONE_NUMBER" && !button.phoneNumber) {
        return "Phone number buttons must have a phone number";
      }
    }

    return null;
  };

  const handleSubmit = async (submitToMeta: boolean = false) => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    if (!selectedProject) {
      toast.error("No project selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateTemplateInput = {
        name,
        category,
        language,
        content: {
          header:
            headerType !== "NONE"
              ? {
                  type: headerType as TemplateHeaderType,
                  text: headerType === "TEXT" ? headerText : undefined,
                }
              : undefined,
          body: {
            text: body,
          },
          footer: footer.trim() ? {
            text: footer.trim(),
          } : undefined,
          buttons: buttons.length > 0 ? buttons : undefined,
        },
        projectId: selectedProject.id,
      };

      console.log('Sending template input:', JSON.stringify(input, null, 2));

      if (editTemplate) {
        await updateTemplate(editTemplate.id, input);
        toast.success("Template updated successfully");
      } else {
        const newTemplate = await createTemplate(input);
        toast.success("Template created successfully");
        
        // Submit to META if requested
        if (submitToMeta && newTemplate) {
          await submitTemplate(newTemplate.id);
          toast.info("Template submitted to META for approval");
        }
      }

      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          overflow: "auto",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-3xl backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            maxWidth: "1400px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1.5rem 2rem",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              {editTemplate ? "Edit Template" : "Create New Template"}
            </h2>
            <button
              onClick={onClose}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(0, 0, 0, 0.05)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)";
              }}
            >
              <X size={20} style={{ color: "#6b7280" }} />
            </button>
          </div>

          {/* Content: Split view */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              padding: "2rem",
              overflow: "auto",
              flex: 1,
            }}
          >
            {/* Left: Form */}
            <div style={{ overflow: "auto", paddingRight: "1rem" }}>
              {/* Template Name */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase())}
                  placeholder="event_invitation"
                  disabled={!!editTemplate}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    background: editTemplate ? "#f3f4f6" : "#ffffff",
                    border: "1px solid rgba(209, 213, 219, 0.5)",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                />
                <p
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "0.25rem",
                  }}
                >
                  Lowercase, alphanumeric, and underscores only
                </p>
              </div>

              {/* Category & Language */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.875rem",
                      color: "#1f2937",
                      background: "#ffffff",
                      border: "1px solid rgba(209, 213, 219, 0.5)",
                      borderRadius: "12px",
                      outline: "none",
                    }}
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Language *
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as TemplateLanguage)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.875rem",
                      color: "#1f2937",
                      background: "#ffffff",
                      border: "1px solid rgba(209, 213, 219, 0.5)",
                      borderRadius: "12px",
                      outline: "none",
                    }}
                  >
                    <option value="id">Indonesian</option>
                    <option value="en">English</option>
                    <option value="id_en">Indonesian & English</option>
                  </select>
                </div>
              </div>

              {/* Header */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Header (Optional)
                </label>
                <select
                  value={headerType}
                  onChange={(e) => setHeaderType(e.target.value as TemplateHeaderType | "NONE")}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    background: "#ffffff",
                    border: "1px solid rgba(209, 213, 219, 0.5)",
                    borderRadius: "12px",
                    outline: "none",
                    marginBottom: "0.5rem",
                  }}
                >
                  <option value="NONE">No Header</option>
                  <option value="TEXT">Text</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Document</option>
                </select>

                {headerType === "TEXT" && (
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="Enter header text (supports {{variables}})"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.875rem",
                      color: "#1f2937",
                      background: "#ffffff",
                      border: "1px solid rgba(209, 213, 219, 0.5)",
                      borderRadius: "12px",
                      outline: "none",
                    }}
                  />
                )}
              </div>

              {/* Body */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Body *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Hello {{name}}, you're invited to {{event}}!"
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    background: "#ffffff",
                    border: "1px solid rgba(209, 213, 219, 0.5)",
                    borderRadius: "12px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <p
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "0.25rem",
                  }}
                >
                  Use {'{{variable_name}}'} for dynamic content. Supports *bold*, _italic_, ~strikethrough~
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.75rem",
                    color: body.length > 1024 ? "#ef4444" : "#6b7280",
                    marginTop: "0.25rem",
                  }}
                >
                  {body.length}/1024 characters
                </p>
              </div>

              {/* Footer */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Footer (Optional)
                </label>
                <input
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="Powered by Balemoo"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    background: "#ffffff",
                    border: "1px solid rgba(209, 213, 219, 0.5)",
                    borderRadius: "12px",
                    outline: "none",
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="flex items-center justify-between mb-2">
                  <label
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Buttons (Optional, max 3)
                  </label>
                  <button
                    onClick={handleAddButton}
                    disabled={buttons.length >= 3}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: buttons.length >= 3 ? "#9ca3af" : "#8b5cf6",
                      background: buttons.length >= 3 ? "rgba(156, 163, 175, 0.1)" : "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "8px",
                      cursor: buttons.length >= 3 ? "not-allowed" : "pointer",
                    }}
                  >
                    <Plus size={14} />
                    Add Button
                  </button>
                </div>

                {buttons.map((button, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      background: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                      borderRadius: "12px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <select
                        value={button.type}
                        onChange={(e) => handleButtonChange(index, "type", e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.75rem",
                          color: "#1f2937",
                          background: "#ffffff",
                          border: "1px solid rgba(209, 213, 219, 0.5)",
                          borderRadius: "8px",
                          outline: "none",
                        }}
                      >
                        <option value="QUICK_REPLY">Quick Reply</option>
                        <option value="URL">URL</option>
                        <option value="PHONE_NUMBER">Phone Number</option>
                      </select>
                      <button
                        onClick={() => handleRemoveButton(index)}
                        style={{
                          padding: "8px",
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => handleButtonChange(index, "text", e.target.value)}
                      placeholder="Button text"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        color: "#1f2937",
                        background: "#ffffff",
                        border: "1px solid rgba(209, 213, 219, 0.5)",
                        borderRadius: "8px",
                        outline: "none",
                        marginBottom: button.type !== "QUICK_REPLY" ? "0.5rem" : "0",
                      }}
                    />
                    {button.type === "URL" && (
                      <input
                        type="url"
                        value={button.url || ""}
                        onChange={(e) => handleButtonChange(index, "url", e.target.value)}
                        placeholder="https://example.com"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.75rem",
                          color: "#1f2937",
                          background: "#ffffff",
                          border: "1px solid rgba(209, 213, 219, 0.5)",
                          borderRadius: "8px",
                          outline: "none",
                        }}
                      />
                    )}
                    {button.type === "PHONE_NUMBER" && (
                      <input
                        type="tel"
                        value={button.phoneNumber || ""}
                        onChange={(e) => handleButtonChange(index, "phoneNumber", e.target.value)}
                        placeholder="+628123456789"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.75rem",
                          color: "#1f2937",
                          background: "#ffffff",
                          border: "1px solid rgba(209, 213, 219, 0.5)",
                          borderRadius: "8px",
                          outline: "none",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Detected Variables */}
              {detectedVariables.length > 0 && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "12px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#6366f1",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Detected Variables ({detectedVariables.length}/10):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detectedVariables.map((variable) => (
                      <span
                        key={variable}
                        style={{
                          padding: "4px 10px",
                          background: "rgba(139, 92, 246, 0.15)",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          borderRadius: "8px",
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "#6366f1",
                        }}
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div
              style={{
                position: "sticky",
                top: 0,
                height: "fit-content",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "1rem",
                }}
              >
                Live Preview
              </h3>
              <TemplatePreview
                template={{
                  name,
                  category,
                  language,
                  content: {
                    header:
                      headerType !== "NONE"
                        ? {
                            type: headerType as TemplateHeaderType,
                            text: headerType === "TEXT" ? headerText : undefined,
                          }
                        : undefined,
                    body: {
                      text: body,
                    },
                    footer: footer.trim() ? {
                      text: footer.trim(),
                    } : undefined,
                    buttons: buttons.length > 0 ? buttons : undefined,
                  },
                }}
                sampleData={sampleData}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "1.5rem 2rem",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "12px 24px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#6b7280",
                background: "rgba(0, 0, 0, 0.05)",
                border: "none",
                borderRadius: "12px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              style={{
                padding: "12px 24px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#ffffff",
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                border: "none",
                borderRadius: "12px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Save as Draft
            </button>
            {!editTemplate && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                style={{
                  padding: "12px 24px",
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Save & Submit to META
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
