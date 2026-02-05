import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import type { TemplateStatus } from "@/app/types/template";

interface StatusBadgeProps {
  status: TemplateStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  DRAFT: {
    bg: "rgba(156, 163, 175, 0.1)",
    border: "rgba(156, 163, 175, 0.2)",
    text: "#6b7280",
    icon: "#9ca3af",
    label: "Draft",
    Icon: FileText,
  },
  PENDING: {
    bg: "rgba(251, 191, 36, 0.1)",
    border: "rgba(251, 191, 36, 0.2)",
    text: "#d97706",
    icon: "#f59e0b",
    label: "Pending",
    Icon: Clock,
  },
  APPROVED: {
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.2)",
    text: "#059669",
    icon: "#10b981",
    label: "Approved",
    Icon: CheckCircle2,
  },
  REJECTED: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.2)",
    text: "#dc2626",
    icon: "#ef4444",
    label: "Rejected",
    Icon: XCircle,
  },
};

const sizeConfig = {
  sm: {
    padding: "4px 10px",
    fontSize: "0.75rem",
    iconSize: 14,
    gap: "4px",
  },
  md: {
    padding: "6px 14px",
    fontSize: "0.875rem",
    iconSize: 16,
    gap: "6px",
  },
  lg: {
    padding: "8px 16px",
    fontSize: "1rem",
    iconSize: 18,
    gap: "8px",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];
  const Icon = config.Icon;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "12px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: sizeStyle.fontSize,
        fontWeight: 600,
        color: config.text,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition: "all 0.2s ease",
      }}
    >
      <Icon size={sizeStyle.iconSize} style={{ color: config.icon }} />
      <span>{config.label}</span>
    </div>
  );
}
