import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useTemplates } from "@/app/contexts/TemplateContext";
import { useAuth } from "@/app/contexts/AuthContext";
import type { WhatsAppTemplate } from "@/app/types/template";
import { TemplateList } from "./TemplateList";
import { CreateTemplateModal } from "./CreateTemplateModal";
import { TemplateDetailModal } from "./TemplateDetailModal";
import { toast } from "sonner";

export function TemplateManagement() {
  const { user } = useAuth();
  const { templates, loading, error, deleteTemplate } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const handleView = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (template: WhatsAppTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      await deleteTemplate(template.id);
      toast.success("Template deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete template");
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsCreateModalOpen(true);
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div
        style={{
          padding: "2rem",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center rounded-3xl backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "3rem",
            maxWidth: "500px",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-4"
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <FileText size={40} style={{ color: "#ef4444" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "0.5rem",
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              color: "#6b7280",
            }}
          >
            Only administrators can manage WhatsApp templates.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Template Management
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "1.125rem",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                Create and manage WhatsApp message templates
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 24px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#8b5cf6",
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "16px",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 12px 48px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
              }}
            >
              <Plus size={20} />
              Create Template
            </button>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-2xl"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "1rem 1.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                color: "#dc2626",
              }}
            >
              {error}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && templates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center rounded-3xl backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              padding: "4rem 2rem",
            }}
          >
            <div className="text-center">
              <div
                className="inline-block rounded-full mb-4"
                style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid rgba(139, 92, 246, 0.2)",
                  borderTop: "4px solid #8b5cf6",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "1rem",
                  color: "#6b7280",
                }}
              >
                Loading templates...
              </p>
            </div>
          </motion.div>
        ) : (
          // Template List
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TemplateList
              templates={templates}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedTemplate(null);
        }}
        editTemplate={selectedTemplate}
      />

      <TemplateDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
