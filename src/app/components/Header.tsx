import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Name */}
          <a
            href="/"
            className="transition-opacity duration-300 hover:opacity-60"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#1a1a1a",
            }}
          >
            balemoo.com
          </a>

          {/* Navigation Menu */}
          <div className="flex items-center gap-8">
            {/* Menu Items */}
            <div className="hidden md:flex items-center gap-8">
              {["About", "Product", "Solution"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="transition-opacity duration-300 hover:opacity-50"
                  style={{
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: "#2d2d2d",
                  }}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Glassmorphism Log In Button */}
            <button
              onClick={() => navigate('/login')}
              className="group relative px-6 py-2 rounded-full transition-all duration-300"
              style={{
                background: "rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.9375rem",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: "#1a1a1a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backdropFilter = "blur(20px)";
                e.currentTarget.style.WebkitBackdropFilter = "blur(20px)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backdropFilter = "blur(10px)";
                e.currentTarget.style.WebkitBackdropFilter = "blur(10px)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
              }}
            >
              Log In
            </button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}