import { ArrowLeft, Save, Play, Settings, Loader2, AlertCircle, CheckCircle2, XCircle, AlertTriangle, Edit2, Check, X as XIcon, Trash2, Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef } from "react";
import type { ValidationResult } from "@/app/utils/chatflowValidation";
import type { Chatflow } from "@/app/types/chatflow";
import { ChatflowSimulator } from "./ChatflowSimulator";

interface ChatflowToolbarProps {
  chatflowId?: string;
  chatflowName: string;
  onBack: () => void;
  onSave?: () => void;
  onTest?: () => void;
  onUpdateName?: (newName: string) => void;
  onDelete?: () => void;
  onToggleLock?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
  validation?: ValidationResult;
  currentChatflow?: Chatflow;
  isLocked?: boolean;
}

export function ChatflowToolbar({
  chatflowName,
  onBack,
  onSave,
  onTest,
  onUpdateName,
  onDelete,
  onToggleLock,
  isSaving = false,
  hasUnsavedChanges = false,
  lastSaved = null,
  validation,
  currentChatflow,
  isLocked = false,
}: ChatflowToolbarProps) {
  const [showValidation, setShowValidation] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(chatflowName);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const validationRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Close validation panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (validationRef.current && !validationRef.current.contains(event.target as Node)) {
        setShowValidation(false);
      }
    };

    if (showValidation) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showValidation]);

  // Auto-focus input when editing name
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Update edited name when chatflow name changes
  useEffect(() => {
    setEditedName(chatflowName);
  }, [chatflowName]);

  const handleStartEditName = () => {
    setIsEditingName(true);
    setEditedName(chatflowName);
  };

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== chatflowName) {
      onUpdateName?.(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditedName(chatflowName);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEditName();
    }
  };
  return (
    <div
      style={{
        height: "70px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(245, 158, 11, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Left - Back & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <ArrowLeft size={20} style={{ color: "#f59e0b" }} />
        </motion.button>

        <div>
          <div
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "2px",
            }}
          >
            Chatflow Studio
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isEditingName ? (
              <>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#1f2937",
                    padding: "4px 8px",
                    border: "2px solid #f59e0b",
                    borderRadius: "6px",
                    outline: "none",
                    minWidth: "200px",
                  }}
                />
                <button
                  onClick={handleSaveName}
                  style={{
                    padding: "4px",
                    background: "#10b981",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Check size={16} style={{ color: "#fff" }} />
                </button>
                <button
                  onClick={handleCancelEditName}
                  style={{
                    padding: "4px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <XIcon size={16} style={{ color: "#fff" }} />
                </button>
              </>
            ) : (
              <>
                <h1
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  {chatflowName}
                </h1>
                {onUpdateName && (
                  <button
                    onClick={handleStartEditName}
                    style={{
                      padding: "4px",
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                    title="Edit chatflow name"
                  >
                    <Edit2 size={14} style={{ color: "#f59e0b" }} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Save Status Indicator */}
        <div
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "16px",
          }}
        >
          {isSaving && (
            <>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              <span>Saving...</span>
            </>
          )}
          {!isSaving && hasUnsavedChanges && <span>Unsaved changes</span>}
          {!isSaving && !hasUnsavedChanges && lastSaved && (
            <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
        {/* Validation Indicator */}
        {validation && !validation.valid && (
          <div
            onClick={() => setShowValidation(!showValidation)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              background: "#fee2e2",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <AlertCircle size={16} style={{ color: "#dc2626" }} />
            <span style={{ fontSize: "0.875rem", color: "#dc2626", fontWeight: 500 }}>
              {validation.errors.length} error(s)
            </span>
          </div>
        )}

        {validation && validation.valid && validation.warnings.length > 0 && (
          <div
            onClick={() => setShowValidation(!showValidation)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              background: "#fef3c7",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
            <span style={{ fontSize: "0.875rem", color: "#92400e", fontWeight: 500 }}>
              {validation.warnings.length} warning(s)
            </span>
          </div>
        )}

        {/* Validation Panel */}
        {showValidation && validation && (
          <div
            ref={validationRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              minWidth: "350px",
              maxWidth: "450px",
              maxHeight: "400px",
              overflow: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                Validation Results
              </h3>
              <button onClick={() => setShowValidation(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <XCircle size={20} style={{ color: "#6b7280" }} />
              </button>
            </div>

            {/* Errors */}
            {validation.errors.map((error, i) => (
              <div
                key={`error-${i}`}
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "10px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <XCircle size={16} style={{ color: "#dc2626", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.875rem", color: "#dc2626", flex: 1 }}>
                  {error}
                </span>
              </div>
            ))}

            {/* Warnings */}
            {validation.warnings.map((warning, i) => (
              <div
                key={`warning-${i}`}
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "10px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <AlertTriangle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.875rem", color: "#92400e", flex: 1 }}>
                  {warning}
                </span>
              </div>
            ))}

            {/* Success */}
            {validation.valid && validation.warnings.length === 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "10px",
                  background: "#d1fae5",
                  borderRadius: "8px",
                }}
              >
                <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", color: "#065f46" }}>
                  Flow is valid
                </span>
              </div>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: isSaving || !hasUnsavedChanges ? 1 : 1.05 }}
          whileTap={{ scale: isSaving || !hasUnsavedChanges ? 1 : 0.95 }}
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            background:
              hasUnsavedChanges && !isSaving
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(156, 163, 175, 0.1)",
            border:
              hasUnsavedChanges && !isSaving
                ? "1px solid rgba(16, 185, 129, 0.2)"
                : "1px solid rgba(156, 163, 175, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: isSaving || !hasUnsavedChanges ? "not-allowed" : "pointer",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: hasUnsavedChanges && !isSaving ? "#10b981" : "#9ca3af",
            transition: "all 0.2s ease",
            opacity: isSaving || !hasUnsavedChanges ? 0.6 : 1,
          }}
        >
          {isSaving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          Save
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSimulator(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#ffffff",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
          }}
        >
          <Play size={16} />
          Test Flow
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(100, 116, 139, 0.1)",
            border: "1px solid rgba(100, 116, 139, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Settings size={18} style={{ color: "#64748b" }} />
        </motion.button>

        {/* Lock/Unlock Button */}
        {onToggleLock && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleLock}
            title={isLocked ? "Unlock chatflow for editing" : "Lock chatflow (set to active)"}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: isLocked ? "rgba(245, 158, 11, 0.1)" : "rgba(100, 116, 139, 0.1)",
              border: isLocked ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(100, 116, 139, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {isLocked ? (
              <Lock size={18} style={{ color: "#f59e0b" }} />
            ) : (
              <Unlock size={18} style={{ color: "#64748b" }} />
            )}
          </motion.button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <div style={{ position: "relative" }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              title="Delete chatflow"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Trash2 size={18} style={{ color: "#ef4444" }} />
            </motion.button>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  minWidth: "280px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                }}
              >
                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 600, color: "#1f2937" }}>
                  Delete Chatflow?
                </h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  This action cannot be undone. The chatflow "{chatflowName}" will be permanently deleted.
                </p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: "#374151",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                      onDelete();
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulator Modal */}
      {showSimulator && currentChatflow && (
        <ChatflowSimulator
          chatflow={currentChatflow}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}
