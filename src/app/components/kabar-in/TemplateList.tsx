import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { WhatsAppTemplate, TemplateStatus } from "@/app/types/template";
import { TemplateCard } from "./TemplateCard";

interface TemplateListProps {
  templates: WhatsAppTemplate[];
  onView: (template: WhatsAppTemplate) => void;
  onEdit?: (template: WhatsAppTemplate) => void;
  onDelete?: (template: WhatsAppTemplate) => void;
}

export function TemplateList({ templates, onView, onEdit, onDelete }: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.body.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [templates, searchQuery, statusFilter, sortBy]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      ALL: templates.length,
      DRAFT: templates.filter((t) => t.status === "DRAFT").length,
      PENDING: templates.filter((t) => t.status === "PENDING").length,
      APPROVED: templates.filter((t) => t.status === "APPROVED").length,
      REJECTED: templates.filter((t) => t.status === "REJECTED").length,
    };
  }, [templates]);

  return (
    <div>
      {/* Filters Bar */}
      <div
        className="mb-8 rounded-3xl backdrop-blur-xl"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          padding: "1.5rem",
        }}
      >
        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 48px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              color: "#1f2937",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(209, 213, 219, 0.5)",
              borderRadius: "16px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#8b5cf6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(209, 213, 219, 0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {(["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: "8px 16px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: statusFilter === status ? "#ffffff" : "#6b7280",
                background:
                  statusFilter === status
                    ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                    : "rgba(156, 163, 175, 0.1)",
                border:
                  statusFilter === status
                    ? "1px solid rgba(139, 92, 246, 0.3)"
                    : "1px solid rgba(156, 163, 175, 0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (statusFilter !== status) {
                  e.currentTarget.style.background = "rgba(156, 163, 175, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (statusFilter !== status) {
                  e.currentTarget.style.background = "rgba(156, 163, 175, 0.1)";
                }
              }}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} style={{ color: "#6b7280" }} />
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              color: "#6b7280",
              marginRight: "8px",
            }}
          >
            Sort by:
          </span>
          <button
            onClick={() => setSortBy("date")}
            style={{
              padding: "6px 12px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: sortBy === "date" ? 600 : 500,
              color: sortBy === "date" ? "#8b5cf6" : "#6b7280",
              background: sortBy === "date" ? "rgba(139, 92, 246, 0.1)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Date
          </button>
          <button
            onClick={() => setSortBy("name")}
            style={{
              padding: "6px 12px",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: sortBy === "name" ? 600 : 500,
              color: sortBy === "name" ? "#8b5cf6" : "#6b7280",
              background: sortBy === "name" ? "rgba(139, 92, 246, 0.1)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Name
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "0.875rem",
          color: "#6b7280",
          marginBottom: "1.5rem",
        }}
      >
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div
          className="flex flex-col items-center justify-center rounded-3xl backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full mb-4"
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(156, 163, 175, 0.1)",
              border: "1px solid rgba(156, 163, 175, 0.2)",
            }}
          >
            <Search size={40} style={{ color: "#9ca3af" }} />
          </div>
          <h3
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "0.5rem",
            }}
          >
            No templates found
          </h3>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Create your first template to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
