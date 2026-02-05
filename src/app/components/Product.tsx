import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  QrCode,
  UserCheck,
  Gift,
  ShieldCheck,
  Activity,
  TrendingUp,
  Download,
} from "lucide-react";
import productIllustration from "@/assets/balemoo-logo.png";

export function Product() {
  const sectionRef = useRef(null);
  const flowRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const flowInView = useInView(flowRef, { once: true, margin: "-100px" });

  const products = [
    {
      id: "kabar",
      title: "kabar.in",
      tagline: "Smart Invitations, Made Effortless",
      description:
        "Send personalized event invitations through WhatsApp Official Business, complete with RSVP and unique QR codes for every guest.",
      features: [
        { icon: MessageCircle, text: "WhatsApp Official Business integration" },
        { icon: Send, text: "Personalized invitations" },
        { icon: Activity, text: "RSVP tracking" },
        { icon: QrCode, text: "Auto-generated QR per guest" },
      ],
      emphasized: false,
    },
    {
      id: "checkin",
      title: "check.in",
      tagline: "Check In Less Than 10 Seconds.",
      description:
        "A lightning-fast QR-based check-in system designed for high-scale events. From access control to guest identification, check.in turns arrival into a smooth experience.",
      features: [
        { icon: QrCode, text: "QR scan check-in under 10 seconds" },
        { icon: UserCheck, text: "Optional badge printing & guest identification" },
        { icon: Gift, text: "Gift / angpao / access tagging" },
        { icon: ShieldCheck, text: "Custom guest data stored securely per event" },
      ],
      emphasized: true,
    },
    {
      id: "monitor",
      title: "monitor.in",
      tagline: "Real-Time Guest Visibility.",
      description:
        "Monitor attendance, arrivals, and guest flow in real time through a simple web dashboard.",
      features: [
        { icon: Activity, text: "Live attendance updates" },
        { icon: TrendingUp, text: "Guest arrival analytics" },
        { icon: Download, text: "Exportable reports" },
        { icon: ShieldCheck, text: "Accessible anywhere" },
      ],
      emphasized: false,
    },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Cooler Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 100% 80% at 30% 20%, rgba(200, 180, 255, 0.22) 0%, transparent 50%), radial-gradient(ellipse 80% 70% at 70% 60%, rgba(180, 220, 255, 0.2) 0%, transparent 50%), radial-gradient(ellipse 70% 60% at 50% 90%, rgba(150, 230, 255, 0.18) 0%, transparent 50%), linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)",
              "radial-gradient(ellipse 100% 80% at 70% 30%, rgba(200, 180, 255, 0.22) 0%, transparent 50%), radial-gradient(ellipse 80% 70% at 30% 70%, rgba(180, 220, 255, 0.2) 0%, transparent 50%), radial-gradient(ellipse 70% 60% at 60% 10%, rgba(150, 230, 255, 0.18) 0%, transparent 50%), linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)",
              "radial-gradient(ellipse 100% 80% at 30% 20%, rgba(200, 180, 255, 0.22) 0%, transparent 50%), radial-gradient(ellipse 80% 70% at 70% 60%, rgba(180, 220, 255, 0.2) 0%, transparent 50%), radial-gradient(ellipse 70% 60% at 50% 90%, rgba(150, 230, 255, 0.18) 0%, transparent 50%), linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)",
            ],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Light noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* SECTION HEADER */}
      <section ref={sectionRef} className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#6366f1",
              textTransform: "uppercase",
            }}
            className="mb-4"
          >
            Our Product
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.1,
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
            One Platform. Three Connected Experiences.
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: "clamp(1rem, 1.25vw, 1.125rem)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              color: "#4a4a4a",
              lineHeight: 1.6,
            }}
            className="max-w-3xl mx-auto mb-12"
          >
            From invitation to check-in to real-time insights — BALEMOO powers
            every guest interaction with technology.
          </motion.p>

          {/* Soft Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={sectionInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="h-px max-w-xs mx-auto"
            style={{
              background: "linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3), transparent)",
            }}
          />
        </div>
      </section>

      {/* PRODUCT CARDS */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                illustration={productIllustration}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT FLOW CONNECTOR */}
      <section ref={flowRef} className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Flow Line Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={flowInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative"
          >
            {/* Product Names with Connection Lines */}
            <div className="flex items-center justify-between gap-4 mb-8">
              {/* kabar.in */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={flowInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex-1 text-center"
              >
                <div
                  className="inline-block px-6 py-3 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#1a1a1a",
                    }}
                  >
                    kabar.in
                  </p>
                </div>
              </motion.div>

              {/* Arrow Line 1 */}
              <div className="flex-1 relative h-0.5 mx-2">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(99, 102, 241, 0.15)",
                  }}
                />
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={flowInView ? { scaleX: 1 } : {}}
                  transition={{
                    duration: 1.2,
                    delay: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, #6366f1, #8b5cf6)",
                  }}
                />
                
                {/* Moving Dot 1 */}
                <motion.div
                  initial={{ left: "0%" }}
                  animate={
                    flowInView
                      ? {
                          left: ["0%", "100%"],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    delay: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
                  }}
                />

                {/* Arrow Head */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={flowInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: 1.7,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid #8b5cf6",
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                  }}
                />
              </div>

              {/* check.in */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={flowInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.4,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex-1 text-center"
              >
                <div
                  className="inline-block px-6 py-3 rounded-full"
                  style={{
                    background: "rgba(99, 102, 241, 0.15)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1.5px solid rgba(99, 102, 241, 0.4)",
                    boxShadow: "0 10px 30px -8px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#6366f1",
                    }}
                  >
                    check.in
                  </p>
                </div>
              </motion.div>

              {/* Arrow Line 2 */}
              <div className="flex-1 relative h-0.5 mx-2">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(99, 102, 241, 0.15)",
                  }}
                />
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={flowInView ? { scaleX: 1 } : {}}
                  transition={{
                    duration: 1.2,
                    delay: 0.7,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, #8b5cf6, #6366f1)",
                  }}
                />
                
                {/* Moving Dot 2 */}
                <motion.div
                  initial={{ left: "0%" }}
                  animate={
                    flowInView
                      ? {
                          left: ["0%", "100%"],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    delay: 1.7,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    boxShadow: "0 0 8px rgba(139, 92, 246, 0.6)",
                  }}
                />

                {/* Arrow Head */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={flowInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: 1.9,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid #6366f1",
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                  }}
                />
              </div>

              {/* monitor.in */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={flowInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex-1 text-center"
              >
                <div
                  className="inline-block px-6 py-3 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#1a1a1a",
                    }}
                  >
                    monitor.in
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Caption */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={flowInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "1rem",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: "#6b6b6b",
                textAlign: "center",
              }}
            >
              A single connected system, built to work seamlessly.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ProductCard Component
function ProductCard({
  product,
  index,
  illustration,
}: {
  product: any;
  index: number;
  illustration: string;
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const cardInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={cardInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-3xl p-8 ${
        product.emphasized ? "lg:scale-105 lg:-my-4" : ""
      }`}
      style={{
        background: product.emphasized
          ? "rgba(255, 255, 255, 0.85)"
          : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: product.emphasized
          ? "1.5px solid rgba(99, 102, 241, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow: product.emphasized
          ? "0 30px 70px -20px rgba(99, 102, 241, 0.2), 0 15px 35px -15px rgba(0, 0, 0, 0.08)"
          : "0 25px 60px -15px rgba(0, 0, 0, 0.08), 0 10px 25px -10px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Glow Effect on Hover */}
      {product.emphasized && (
        <motion.div
          className="absolute inset-0 rounded-3xl -z-10"
          animate={{
            opacity: isHovered ? 0.6 : 0.3,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.2), transparent 70%)",
          }}
        />
      )}

      {/* Illustration */}
      <motion.div
        className="mb-6 relative h-48 flex items-center justify-center"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5,
        }}
      >
        <img
          src={illustration}
          alt={product.title}
          className="h-full w-auto object-contain"
          style={{
            filter: "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.1))",
          }}
        />
        
        {/* QR Scan Pulse for check.in */}
        {product.id === "checkin" && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <QrCode className="w-12 h-12 text-indigo-500 opacity-20" />
          </motion.div>
        )}
      </motion.div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: product.emphasized ? "1.75rem" : "1.5rem",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "#1a1a1a",
          lineHeight: 1.2,
        }}
        className="mb-3"
      >
        {product.title}
      </h3>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: product.emphasized ? "1.125rem" : "1rem",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: product.emphasized ? "#6366f1" : "#6b6b6b",
          lineHeight: 1.4,
        }}
        className="mb-4"
      >
        {product.tagline}
      </p>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: "0.9375rem",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: "#4a4a4a",
          lineHeight: 1.6,
        }}
        className="mb-6"
      >
        {product.description}
      </p>

      {/* Features */}
      <div className="space-y-3">
        {product.features.map((feature: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={cardInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: 0.3 + index * 0.15 + idx * 0.05,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="flex items-start gap-3"
          >
            <motion.div
              animate={
                isHovered
                  ? {
                      scale: [1, 1.15, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.4,
                delay: idx * 0.05,
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background: product.emphasized
                  ? "rgba(99, 102, 241, 0.12)"
                  : "rgba(0, 0, 0, 0.04)",
              }}
            >
              <feature.icon
                className="w-4 h-4"
                style={{
                  color: product.emphasized ? "#6366f1" : "#6b6b6b",
                }}
              />
            </motion.div>
            <p
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: "#3a3a3a",
                lineHeight: 1.5,
              }}
            >
              {feature.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}