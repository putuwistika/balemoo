import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  color: string;
}

export function ComingSoonPage({ icon: Icon, title, description, features, color }: ComingSoonPageProps) {
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
        transition={{ duration: 0.5 }}
        className="text-center"
        style={{
          maxWidth: "600px",
        }}
      >
        {/* Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center mx-auto mb-6"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "30px",
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            border: `2px solid ${color}40`,
            position: "relative",
          }}
        >
          {/* Animated Background Circle */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "30px",
              background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
            }}
          />
          <Icon size={60} style={{ color, position: "relative", zIndex: 1 }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "1rem",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: "1.125rem",
            color: "rgba(255, 255, 255, 0.9)",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          {description}
        </motion.p>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-block rounded-full mb-3"
          style={{
            padding: "12px 32px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1rem",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🚀 Coming Soon
          </span>
        </motion.div>

        {/* Features List */}
        {features && features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-3xl backdrop-blur-xl mt-8"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              padding: "2rem",
              textAlign: "left",
            }}
          >
            <h3
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "1rem",
              }}
            >
              Planned Features:
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: index < features.length - 1 ? "1px solid rgba(0, 0, 0, 0.06)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "0.9375rem",
                      color: "#6b7280",
                    }}
                  >
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.8)",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  // Simple color adjustment (this is a basic implementation)
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
