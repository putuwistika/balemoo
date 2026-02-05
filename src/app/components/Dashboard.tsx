import { motion } from 'motion/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, QrCode, BarChart3, Lock, Calendar, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  requiredRoles: string[];
}

const products: ProductCard[] = [
  {
    id: 'kabar-in',
    title: 'kabar.in',
    description: 'Guest CRM, personalized QR generation and management',
    icon: <MessageSquare className="w-12 h-12" />,
    route: '/kabar-in',
    requiredRoles: ['admin'],
  },
  {
    id: 'check-in',
    title: 'check.in',
    description: 'QR-based fast guest check-in system',
    icon: <QrCode className="w-12 h-12" />,
    route: '/check-in',
    requiredRoles: ['admin', 'staff'],
  },
  {
    id: 'monitor-in',
    title: 'monitor.in',
    description: 'Guest analytics and monitoring dashboard',
    icon: <BarChart3 className="w-12 h-12" />,
    route: '/monitor-in',
    requiredRoles: ['admin', 'staff', 'user'],
  },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { project, setProject } = useProject();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [shakingCard, setShakingCard] = useState<string | null>(null);

  const handleCardClick = (product: ProductCard) => {
    const hasAccess = user && product.requiredRoles.includes(user.role);
    if (hasAccess) {
      navigate(product.route);
    } else {
      // Trigger shake animation for disabled card
      setShakingCard(product.id);
      setTimeout(() => setShakingCard(null), 500);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isCardEnabled = (product: ProductCard) => {
    return user && product.requiredRoles.includes(user.role);
  };

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-6xl mb-12"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#1a1a1a',
              }}
            >
              Welcome back, {user?.name || 'User'}
            </h1>
            <p
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                fontWeight: 500,
                color: '#6b6b6b',
                marginTop: '0.5rem',
              }}
            >
              Role: <span style={{ 
                color: user?.role === 'admin' ? '#8b5cf6' : user?.role === 'staff' ? '#3b82f6' : '#10b981',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>{user?.role || 'unknown'}</span> | Email: {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 rounded-full transition-all duration-300"
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
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Product Cards Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product, index) => {
          const enabled = isCardEnabled(product);
          const isHovered = hoveredCard === product.id;
          const isShaking = shakingCard === product.id;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2 + index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => handleCardClick(product)}
              onMouseEnter={() => setHoveredCard(product.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative rounded-3xl p-8 backdrop-blur-xl transition-all duration-700"
              style={{
                background: enabled
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(200, 200, 200, 0.3)',
                border: `1px solid ${enabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(150, 150, 150, 0.2)'}`,
                boxShadow: isHovered && enabled
                  ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                  : '0 8px 32px rgba(0, 0, 0, 0.08)',
                transform: isHovered && enabled ? 'translateY(-8px)' : 'translateY(0)',
                cursor: enabled ? 'pointer' : 'not-allowed',
                opacity: enabled ? 1 : 0.5,
                filter: enabled ? 'none' : 'grayscale(1)',
                animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
              }}
            >
              {/* Lock Icon Overlay for Disabled Cards */}
              {!enabled && (
                <div className="absolute top-4 right-4">
                  <Lock
                    className="w-6 h-6"
                    style={{ color: '#9ca3af' }}
                  />
                </div>
              )}

              {/* Icon */}
              <div
                className="mb-6"
                style={{
                  color: enabled ? '#1a1a1a' : '#9ca3af',
                }}
              >
                {product.icon}
              </div>

              {/* Title */}
              <h3
                className="mb-3"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: enabled ? '#1a1a1a' : '#9ca3af',
                }}
              >
                {product.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: enabled ? '#6b6b6b' : '#9ca3af',
                }}
              >
                {product.description}
              </p>

              {/* Tooltip for Disabled Cards */}
              {!enabled && isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 rounded-lg whitespace-nowrap"
                  style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '0.875rem',
                    color: '#ffffff',
                  }}
                >
                  You do not have access to this feature
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .shake-card {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}