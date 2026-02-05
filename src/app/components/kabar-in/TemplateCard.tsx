import { useState } from "react";
import { motion } from "motion/react";
import { Edit, Trash2, Eye, FileText } from "lucide-react";
import type { WhatsAppTemplate } from "@/app/types/template";
import { StatusBadge } from "./StatusBadge";

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onView: (template: WhatsAppTemplate) => void;
  onEdit?: (template: WhatsAppTemplate) => void;
  onDelete?: (template: WhatsAppTemplate) => void;
}

export function TemplateCard({ template, onView, onEdit, onDelete }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if template can be edited/deleted (only DRAFT or REJECTED)
  const canModify = template.status === "DRAFT" || template.status === "REJECTED";
  
  // Get preview text (first 2 lines of body)
  const previewText = template.content.body.text.split("\n").slice(0, 2).join(" ").substring(0, 120);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(template)}
      className="relative rounded-3xl backdrop-blur-xl cursor-pointer"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: isHovered
          ? "0 20px 60px rgba(0, 0, 0, 0.15)"
          : "0 8px 32px rgba(0, 0, 0, 0.08)",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: "1.5rem",
      }}
    >
      {/* Header: Icon + Status */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <FileText size={24} style={{ color: "#8b5cf6" }} />
        </div>
        <StatusBadge status={template.status} size="sm" />
      </div>

      {/* Template Name */}
      <h3
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#1f2937",
          marginBottom: "0.5rem",
          letterSpacing: "-0.01em",
        }}
      >
        {template.name}
      </h3>

      {/* Category & Language */}
      <div className="flex items-center gap-2 mb-3">
        <span
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#6b7280",
            padding: "4px 10px",
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "8px",
          }}
        >
          {template.category}
        </span>
        <span
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#6b7280",
            padding: "4px 10px",
            background: "rgba(156, 163, 175, 0.1)",
            border: "1px solid rgba(156, 163, 175, 0.2)",
            borderRadius: "8px",
          }}
        >
          {template.language}
        </span>
      </div>

      {/* Preview Text */}
      <p
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "0.875rem",
          color: "#6b7280",
          lineHeight: "1.5",
          marginBottom: "1rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {previewText}...
      </p>

      {/* Variables Count */}
      {template.variables.length > 0 && (
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#8b5cf6",
            marginBottom: "1rem",
          }}
        >
          {template.variables.length} variable{template.variables.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Action Buttons (visible on hover) */}
      <div
        className="flex items-center gap-2 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? "auto" : "none",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(template);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "10px",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#6366f1",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
          }}
        >
          <Eye size={16} />
          View
        </button>

        {canModify && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(template);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "10px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#10b981",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
            }}
          >
            <Edit size={16} />
            Edit
          </button>
        )}

        {canModify && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "10px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#ef4444",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </div>

      {/* Created Date (bottom right) */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "1.5rem",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "0.75rem",
          color: "#9ca3af",
          opacity: isHovered ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        {new Date(template.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>
    </motion.div>
  );
}
