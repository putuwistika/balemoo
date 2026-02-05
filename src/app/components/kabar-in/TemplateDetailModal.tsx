import { useState } from "react";
import { X, Edit, Trash2, Send, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTemplates } from "@/app/contexts/TemplateContext";
import type { WhatsAppTemplate } from "@/app/types/template";
import { StatusBadge } from "./StatusBadge";
import { TemplatePreview } from "./TemplatePreview";
import { toast } from "sonner";

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WhatsAppTemplate | null;
  onEdit?: (template: WhatsAppTemplate) => void;
  onDelete?: (template: WhatsAppTemplate) => void;
}

export function TemplateDetailModal({
  isOpen,
  onClose,
  template,
  onEdit,
  onDelete,
}: TemplateDetailModalProps) {
  const { submitTemplate, simulateReject } = useTemplates();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!isOpen || !template) return null;

  const canModify = template.status === "DRAFT" || template.status === "REJECTED";
  const canSubmit = template.status === "DRAFT";

  // Generate sample data for preview
  const sampleData: Record<string, string> = {};
  template.variables.forEach((variable) => {
    if (variable.toLowerCase().includes("name")) {
      sampleData[variable] = "John Doe";
    } else if (variable.toLowerCase().includes("date")) {
      sampleData[variable] = "Feb 5, 2026";
    } else if (variable.toLowerCase().includes("time")) {
      sampleData[variable] = "7:00 PM";
    } else if (variable.toLowerCase().includes("event")) {
      sampleData[variable] = "Annual Gala";
    } else if (variable.toLowerCase().includes("venue")) {
      sampleData[variable] = "Grand Ballroom";
    } else {
      sampleData[variable] = "Sample";
    }
  });

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await submitTemplate(template.id);
      toast.success("Template submitted to META for approval");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await simulateReject(template.id, rejectReason);
      toast.info("Template rejected (simulation)");
      setShowRejectInput(false);
      setRejectReason("");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject template");
    }
  };

  const handleEdit = () => {
    if (canModify && onEdit) {
      onEdit(template);
      onClose();
    }
  };

  const handleDelete = () => {
    if (canModify && onDelete) {
      onDelete(template);
      onClose();
    }
  };

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
            maxWidth: "1200px",
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
            <div className="flex items-center gap-3">
              <h2
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                {template.name}
              </h2>
              <StatusBadge status={template.status} size="md" />
            </div>
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
            {/* Left: Details */}
            <div style={{ overflow: "auto", paddingRight: "1rem" }}>
              {/* Basic Info */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "1rem",
                  }}
                >
                  Template Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Category
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.875rem",
                        color: "#1f2937",
                      }}
                    >
                      {template.category}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Language
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.875rem",
                        color: "#1f2937",
                      }}
                    >
                      {template.language}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Created
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.875rem",
                        color: "#1f2937",
                      }}
                    >
                      {new Date(template.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Last Updated
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.875rem",
                        color: "#1f2937",
                      }}
                    >
                      {new Date(template.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variables */}
              {template.variables.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "1rem",
                    }}
                  >
                    Variables ({template.variables.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        style={{
                          padding: "6px 12px",
                          background: "rgba(139, 92, 246, 0.1)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          borderRadius: "10px",
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.875rem",
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

              {/* Submission History */}
              {(template.submittedAt || template.approvedAt || template.rejectedAt) && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "1rem",
                    }}
                  >
                    Submission History
                  </h3>

                  <div className="space-y-3">
                    {template.submittedAt && (
                      <div className="flex items-center gap-3">
                        <Clock size={18} style={{ color: "#f59e0b" }} />
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Submitted to META
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.75rem",
                              color: "#6b7280",
                            }}
                          >
                            {new Date(template.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {template.approvedAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} style={{ color: "#10b981" }} />
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Approved by META
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.75rem",
                              color: "#6b7280",
                            }}
                          >
                            {new Date(template.approvedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {template.rejectedAt && (
                      <div className="flex items-start gap-3">
                        <XCircle size={18} style={{ color: "#ef4444", marginTop: "2px" }} />
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Rejected by META
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {new Date(template.rejectedAt).toLocaleString()}
                          </p>
                          {template.rejectionReason && (
                            <div
                              style={{
                                padding: "8px 12px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: "8px",
                              }}
                            >
                              <p
                                style={{
                                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                  fontSize: "0.875rem",
                                  color: "#dc2626",
                                }}
                              >
                                {template.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dev: Simulate Reject */}
              {template.status === "PENDING" && (
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#dc2626",
                      marginBottom: "0.5rem",
                    }}
                  >
                    🛠️ DEV TOOL: Simulate Rejection
                  </p>
                  {!showRejectInput ? (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      style={{
                        padding: "8px 16px",
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#ffffff",
                        background: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Simulate Rejection
                    </button>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Rejection reason..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.75rem",
                          color: "#1f2937",
                          background: "#ffffff",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "8px",
                          outline: "none",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSimulateReject}
                          style={{
                            padding: "6px 12px",
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#ffffff",
                            background: "#ef4444",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectInput(false);
                            setRejectReason("");
                          }}
                          style={{
                            padding: "6px 12px",
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#6b7280",
                            background: "rgba(0, 0, 0, 0.05)",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
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
                Preview
              </h3>
              <TemplatePreview template={template} sampleData={sampleData} />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "1.5rem 2rem",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="flex gap-2">
              {canModify && onEdit && (
                <button
                  onClick={handleEdit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#10b981",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}

              {canModify && onDelete && (
                <button
                  onClick={handleDelete}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#ef4444",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {canSubmit && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    border: "none",
                    borderRadius: "12px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  <Send size={16} />
                  {isSubmitting ? "Submitting..." : "Submit to META"}
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: "12px 24px",
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  background: "rgba(0, 0, 0, 0.05)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
