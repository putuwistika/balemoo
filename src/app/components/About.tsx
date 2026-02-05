import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Heart, Zap, CircleUser } from "lucide-react";
import aboutIllustration from "@/assets/balemoo-logo.png";

export function About() {
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section1InView = useInView(section1Ref, { once: true, margin: "-100px" });
  const section2InView = useInView(section2Ref, { once: true, margin: "-100px" });

  return (
    <div className="relative w-full overflow-hidden">
      {/* Soft Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 100% 80% at 20% 30%, rgba(255, 200, 180, 0.2) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 80% 60%, rgba(200, 180, 255, 0.18) 0%, transparent 50%), radial-gradient(ellipse 70% 70% at 50% 80%, rgba(180, 220, 255, 0.15) 0%, transparent 50%), linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)",
              "radial-gradient(ellipse 100% 80% at 80% 40%, rgba(255, 200, 180, 0.2) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 20% 70%, rgba(200, 180, 255, 0.18) 0%, transparent 50%), radial-gradient(ellipse 70% 70% at 60% 20%, rgba(180, 220, 255, 0.15) 0%, transparent 50%), linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)",
              "radial-gradient(ellipse 100% 80% at 20% 30%, rgba(255, 200, 180, 0.2) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 80% 60%, rgba(200, 180, 255, 0.18) 0%, transparent 50%), radial-gradient(ellipse 70% 70% at 50% 80%, rgba(180, 220, 255, 0.15) 0%, transparent 50%), linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Light noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* SECTION 1 — ABOUT BALEMOO */}
      <section ref={section1Ref} className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={section1InView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {/* Eyebrow Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={section1InView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "#8b5cf6",
                  textTransform: "uppercase",
                }}
                className="mb-4"
              >
                About BALEMOO
              </motion.p>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={section1InView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "#1a1a1a",
                  lineHeight: 1.15,
                }}
                className="mb-6"
              >
                A Digital Bale for Modern Events
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={section1InView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "clamp(1rem, 1.25vw, 1.125rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: "#4a4a4a",
                  lineHeight: 1.7,
                }}
              >
                BALEMOO is a technology platform built to welcome guests the way
                people should be welcomed — smoothly, respectfully, and with a
                smile.
                <br />
                <br />
                Inspired by the Balinese tradition of receiving guests in the
                bale, we translate that philosophy into modern event technology.
              </motion.p>
            </motion.div>

            {/* Right — 3D Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={section1InView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.9,
                delay: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={aboutIllustration}
                  alt="BALEMOO Platform Visualization"
                  className="w-full h-auto"
                  style={{
                    filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.1))",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PHILOSOPHY */}
      <section ref={section2Ref} className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Glass Panel Container */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={section2InView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              duration: 0.9,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative rounded-3xl p-12 lg:p-16"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.08), 0 10px 25px -10px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={section2InView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#1a1a1a",
                lineHeight: 1.2,
              }}
              className="mb-8"
            >
              The Philosophy Behind BALEMOO
            </motion.h2>

            {/* Paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={section2InView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "clamp(1rem, 1.2vw, 1.125rem)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: "#3a3a3a",
                lineHeight: 1.8,
              }}
              className="mb-12"
            >
              <p className="mb-6">
                In Balinese culture, a bale is more than a structure. It is a
                space of connection — where guests are welcomed, stories begin,
                and respect is shown through small details.
              </p>
              <p className="mb-6">
                BALEMOO brings this philosophy into technology. We believe great
                events start not at the stage, but at the first interaction. That
                first smile. That smooth check-in. That feeling of being
                expected.
              </p>
            </motion.div>

            {/* Highlight Points */}
            <div className="space-y-6 mb-12">
              {[
                { icon: Heart, text: "Technology that stays human" },
                { icon: Zap, text: "Speed without pressure" },
                { icon: CircleUser, text: "Systems that support, not replace, hospitality" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={section2InView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.6 + index * 0.1,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      delay: 1 + index * 0.2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(139, 92, 246, 0.1)",
                    }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                  </motion.div>
                  <p
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "1.0625rem",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "#2d2d2d",
                    }}
                  >
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Closing Line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={section2InView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)",
                fontWeight: 500,
                letterSpacing: "-0.015em",
                color: "#1a1a1a",
                lineHeight: 1.5,
              }}
              className="italic"
            >
              BALEMOO is where technology becomes the host.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
