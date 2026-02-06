import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Workflow,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Radio,
} from "lucide-react";

interface KabarInLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  badge?: number;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/kabar-in",
    color: "#8b5cf6",
  },
  {
    icon: FileText,
    label: "Template Management",
    path: "/kabar-in/templates",
    color: "#06b6d4",
  },
  {
    icon: Users,
    label: "Guest List",
    path: "/kabar-in/guests",
    badge: 24,
    color: "#10b981",
  },
  {
    icon: Workflow,
    label: "Chatflow Studio",
    path: "/kabar-in/chatflow",
    color: "#f59e0b",
  },
  {
    icon: FileText,
    label: "WhatsApp Flows",
    path: "/kabar-in/whatsapp-flows",
    color: "#25D366",
  },
  {
    icon: Radio,
    label: "Operation Center",
    path: "/kabar-in/operation",
    badge: 5,
    color: "#3b82f6",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/kabar-in/messages",
    badge: 3,
    color: "#ec4899",
  },
  {
    icon: TrendingUp,
    label: "Analytics",
    path: "/kabar-in/analytics",
    color: "#6366f1",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/kabar-in/settings",
    color: "#64748b",
  },
];

export function KabarInLayout({ children }: KabarInLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/kabar-in") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        paddingTop: "80px", // Space for AppHeader
      }}
    >
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "280px",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "fixed",
          left: 0,
          top: "80px",
          bottom: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.08)",
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: isCollapsed ? "1.5rem 1rem" : "1.5rem 1.5rem",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  kabar.in
                </h2>
                <p
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "0.125rem",
                  }}
                >
                  Guest CRM Platform
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
            }}
          >
            {isCollapsed ? (
              <ChevronRight size={18} style={{ color: "#8b5cf6" }} />
            ) : (
              <ChevronLeft size={18} style={{ color: "#8b5cf6" }} />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ padding: "1rem 0.75rem", overflowY: "auto", height: "calc(100% - 100px)" }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hovered = hoveredItem === item.path;

            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: isCollapsed ? "0" : "12px",
                  padding: isCollapsed ? "12px" : "12px 16px",
                  marginBottom: "6px",
                  background: active
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)"
                    : hovered
                      ? "rgba(0, 0, 0, 0.03)"
                      : "transparent",
                  border: active
                    ? "1px solid rgba(139, 92, 246, 0.3)"
                    : "1px solid transparent",
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  transform: hovered ? "translateX(4px)" : "translateX(0)",
                }}
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "24px",
                      background: "linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)",
                      borderRadius: "0 4px 4px 0",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with color */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: active || hovered
                      ? `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                      : "transparent",
                    border: `1px solid ${item.color}${active ? "40" : "00"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={20} style={{ color: active ? item.color : "#6b7280" }} />
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flex: 1,
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: active ? 600 : 500,
                          color: active ? "#1f2937" : "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            minWidth: "24px",
                            height: "24px",
                            borderRadius: "12px",
                            background: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 8px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "#ffffff",
                            }}
                          >
                            {item.badge}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && hovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{
                      position: "absolute",
                      left: "100%",
                      marginLeft: "12px",
                      padding: "8px 16px",
                      background: "rgba(0, 0, 0, 0.9)",
                      borderRadius: "8px",
                      whiteSpace: "nowrap",
                      zIndex: 1000,
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#ffffff",
                      }}
                    >
                      {item.label}
                    </span>
                    {/* Arrow */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-4px",
                        top: "50%",
                        transform: "translateY(-50%) rotate(45deg)",
                        width: "8px",
                        height: "8px",
                        background: "rgba(0, 0, 0, 0.9)",
                      }}
                    />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: isCollapsed ? "80px" : "280px",
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: 1,
          minHeight: "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
