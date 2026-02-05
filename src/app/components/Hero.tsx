import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import heroIllustration from "@/assets/balemoo-logo.png";
import balemooLogo from "@/assets/balemoo-logo.png";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen w-full relative flex items-center justify-center px-6 py-32 overflow-hidden">
      {/* Soft iOS-style ambient gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 20%, rgba(200, 180, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 80% 60%, rgba(255, 200, 180, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 20% 70%, rgba(180, 220, 255, 0.1) 0%, transparent 50%),
            linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)
          `,
        }}
      />

      <div className="max-w-6xl mx-auto w-full">
        {/* Text Content Container */}
        <div className="text-center mb-12">
          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mb-6 flex justify-center"
          >
            <img 
              src={balemooLogo} 
              alt="Balemoo"
              style={{
                height: "clamp(8rem, 15vw, 14rem)",
                width: "auto",
              }}
            />
          </motion.h1>

          {/* Headline / Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mb-5"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#2d2d2d",
              lineHeight: 1.3,
            }}
          >
            Smart Smiles for Your Event
          </motion.h2>

          {/* Subtagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="max-w-2xl mx-auto"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(1rem, 1.25vw, 1.125rem)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              color: "#6b6b6b",
              lineHeight: 1.6,
            }}
          >
            Technology-powered solutions that create seamless and welcoming event
            experiences.
          </motion.p>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 1.0,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-8"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 rounded-full transition-all duration-700"
              style={{
                background: 'rgba(0, 0, 0, 0.85)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Started
            </button>
          </motion.div>
        </div>

        {/* 3D Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.9,
            delay: 1.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="relative max-w-2xl mx-auto"
        >
          <img
            src={heroIllustration}
            alt="Balemoo 3D Product Illustration"
            className="w-full h-auto"
            style={{
              filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.08))",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}