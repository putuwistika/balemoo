import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';

export function CheckIn() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 20%, rgba(200, 180, 255, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 80% 60%, rgba(255, 200, 180, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 70%, rgba(180, 220, 255, 0.1) 0%, transparent 50%),
          linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-4xl"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
          style={{
            background: 'rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: '#1a1a1a',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Content Card */}
        <div
          className="rounded-3xl p-12 backdrop-blur-xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <QrCode
            className="w-20 h-20 mx-auto mb-6"
            style={{ color: '#1a1a1a' }}
          />

          <h1
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#1a1a1a',
              marginBottom: '1rem',
            }}
          >
            check.in
          </h1>

          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1.25rem',
              fontWeight: 400,
              color: '#6b6b6b',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Lightning-fast QR-based guest check-in system that makes event entry seamless and efficient.
          </p>

          <div
            className="mt-8 inline-block px-6 py-3 rounded-full"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            Coming Soon
          </div>
        </div>
      </motion.div>
    </div>
  );
}
