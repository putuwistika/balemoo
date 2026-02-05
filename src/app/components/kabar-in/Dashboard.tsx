import React from "react";
import { motion } from "motion/react";
import {
  Users,
  MessageSquare,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
  Eye,
  Zap,
} from "lucide-react";
import { useTemplates } from "@/app/contexts/TemplateContext";
import { useGuests } from "@/app/contexts/GuestContext";
import { useAuth } from "@/app/contexts/AuthContext";

interface StatCardProps {
  icon: typeof Users;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, change, changeType, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-3xl backdrop-blur-xl"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "120px",
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderRadius: "0 0 0 100%",
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: "0.5rem",
            }}
          >
            {label}
          </p>
          <h3
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </h3>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                size={14}
                style={{
                  color:
                    changeType === "positive"
                      ? "#10b981"
                      : changeType === "negative"
                      ? "#ef4444"
                      : "#6b7280",
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color:
                    changeType === "positive"
                      ? "#10b981"
                      : changeType === "negative"
                      ? "#ef4444"
                      : "#6b7280",
                }}
              >
                {change}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={28} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

interface ActivityItemProps {
  icon: typeof Send;
  title: string;
  description: string;
  time: string;
  color: string;
}

function ActivityItem({ icon: Icon, title, description, time, color }: ActivityItemProps) {
  return (
    <div
      className="flex items-start gap-3 pb-4 mb-4"
      style={{
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#1f2937",
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          {description}
        </p>
      </div>
      <span
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "0.75rem",
          color: "#9ca3af",
          whiteSpace: "nowrap",
        }}
      >
        {time}
      </span>
    </div>
  );
}

export function Dashboard() {
  const { templates } = useTemplates();
  const { stats: guestStats } = useGuests();
  const { user } = useAuth();

  // Calculate stats
  const totalTemplates = templates.length;
  const approvedTemplates = templates.filter((t) => t.status === "APPROVED").length;
  const pendingTemplates = templates.filter((t) => t.status === "PENDING").length;
  const draftTemplates = templates.filter((t) => t.status === "DRAFT").length;
  
  // Guest stats
  const totalGuests = guestStats?.total || 0;
  const confirmedGuests = guestStats?.confirmed || 0;

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100%",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back, {user?.name || "Admin"}! 👋
          </h1>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            Here's what's happening with your WhatsApp CRM today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            icon={MessageSquare}
            label="Total Templates"
            value={totalTemplates}
            change="+12% from last month"
            changeType="positive"
            color="#8b5cf6"
            delay={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="Approved"
            value={approvedTemplates}
            change="+8% from last month"
            changeType="positive"
            color="#10b981"
            delay={0.1}
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={pendingTemplates}
            change={pendingTemplates > 0 ? "Awaiting META approval" : "All clear"}
            changeType="neutral"
            color="#f59e0b"
            delay={0.2}
          />
          <StatCard
            icon={Users}
            label="Total Guests"
            value={totalGuests}
            change={confirmedGuests > 0 ? `${confirmedGuests} confirmed` : "No guests yet"}
            changeType={confirmedGuests > 0 ? "positive" : "neutral"}
            color="#06b6d4"
            delay={0.3}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-3xl backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "1.5rem",
              }}
            >
              Recent Activity
            </h2>

            <ActivityItem
              icon={CheckCircle2}
              title="Template Approved"
              description="'event_invitation' approved by META"
              time="2 hours ago"
              color="#10b981"
            />
            <ActivityItem
              icon={Send}
              title="Message Sent"
              description="124 WhatsApp messages delivered successfully"
              time="5 hours ago"
              color="#06b6d4"
            />
            <ActivityItem
              icon={Users}
              title="New Guests Added"
              description="42 guests imported from CSV"
              time="1 day ago"
              color="#8b5cf6"
            />
            <ActivityItem
              icon={Zap}
              title="Chatflow Activated"
              description="'Welcome Flow' automation started"
              time="2 days ago"
              color="#f59e0b"
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-3xl backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "1.5rem",
              }}
            >
              Quick Actions
            </h2>

            <div className="space-y-3">
              <QuickActionButton
                icon={MessageSquare}
                label="Create New Template"
                description="Design a WhatsApp message template"
                color="#8b5cf6"
                onClick={() => window.location.href = "/kabar-in/templates"}
              />
              <QuickActionButton
                icon={Users}
                label="Add Guests"
                description="Import or add new guests to your list"
                color="#10b981"
                onClick={() => window.location.href = "/kabar-in/guests"}
              />
              <QuickActionButton
                icon={Zap}
                label="Build Chatflow"
                description="Create automated conversation flows"
                color="#f59e0b"
                onClick={() => window.location.href = "/kabar-in/chatflow"}
              />
              <QuickActionButton
                icon={Eye}
                label="View Analytics"
                description="Check your campaign performance"
                color="#06b6d4"
                onClick={() => window.location.href = "/kabar-in/analytics"}
              />
            </div>
          </motion.div>
        </div>

        {/* Template Status Overview */}
        {draftTemplates > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 rounded-3xl backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              padding: "1.5rem",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#1f2937",
                    marginBottom: "0.25rem",
                  }}
                >
                  You have {draftTemplates} draft template{draftTemplates !== 1 ? "s" : ""}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  Complete and submit them to start using in your campaigns
                </p>
              </div>
              <button
                onClick={() => window.location.href = "/kabar-in/templates"}
                style={{
                  padding: "12px 24px",
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#ffffff",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Review Drafts
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: typeof MessageSquare;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

function QuickActionButton({ icon: Icon, label, description, color, onClick }: QuickActionButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        background: isHovered ? "rgba(0, 0, 0, 0.02)" : "transparent",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#1f2937",
            marginBottom: "0.125rem",
          }}
        >
          {label}
        </h4>
        <p
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "0.75rem",
            color: "#6b7280",
          }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
