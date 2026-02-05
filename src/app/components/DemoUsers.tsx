import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { UserCog, Users, User, ArrowLeft } from 'lucide-react';

const demoRoles = [
  {
    role: 'admin',
    icon: <UserCog className="w-8 h-8" />,
    title: 'Admin',
    description: 'Full access to all features',
    access: ['kabar.in', 'check.in', 'monitor.in'],
    color: '#8b5cf6',
  },
  {
    role: 'staff',
    icon: <Users className="w-8 h-8" />,
    title: 'Staff',
    description: 'Access to check-in and monitoring',
    access: ['check.in', 'monitor.in'],
    color: '#3b82f6',
  },
  {
    role: 'user',
    icon: <User className="w-8 h-8" />,
    title: 'User',
    description: 'Monitoring access only',
    access: ['monitor.in'],
    color: '#10b981',
  },
];

export function DemoUsers() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleQuickSignUp = async (role: string) => {
    setError('');
    setLoading(role);
    
    try {
      const timestamp = Date.now();
      const email = `demo-${role}@balemoo.com`;
      const password = 'demo12345';
      const name = `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`;

      await signUp(email, password, name, role);
      navigate('/projects');
    } catch (err: any) {
      // If user already exists, try to sign in instead
      if (err.message.includes('already') || err.message.includes('exist') || err.message.includes('User')) {
        try {
          // Attempt to sign in with existing credentials
          const email = `demo-${role}@balemoo.com`;
          const password = 'demo12345';
          await signIn(email, password);
          navigate('/projects');
        } catch (signInErr) {
          setError(`Demo ${role} account exists but sign in failed. Try manual login.`);
        }
      } else {
        setError(err.message || 'Failed to create demo account');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-12"
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
        className="w-full max-w-5xl"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
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
          Back to Login
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 'clamp(2rem, 3vw, 2.5rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#1a1a1a',
              marginBottom: '0.5rem',
            }}
          >
            Quick Demo Access
          </h1>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1rem',
              fontWeight: 400,
              color: '#6b6b6b',
            }}
          >
            Create a demo account with different role permissions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-xl text-center"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.875rem',
                color: '#dc2626',
              }}
            >
              {error}
            </p>
          </motion.div>
        )}

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoRoles.map((roleData, index) => (
            <motion.div
              key={roleData.role}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2 + index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="rounded-3xl p-8 backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Icon */}
              <div
                className="mb-4"
                style={{ color: roleData.color }}
              >
                {roleData.icon}
              </div>

              {/* Title */}
              <h3
                className="mb-2"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: '#1a1a1a',
                }}
              >
                {roleData.title}
              </h3>

              {/* Description */}
              <p
                className="mb-4"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  color: '#6b6b6b',
                  lineHeight: 1.5,
                }}
              >
                {roleData.description}
              </p>

              {/* Access List */}
              <div className="mb-6 space-y-2">
                {roleData.access.map((feature) => (
                  <div
                    key={feature}
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{
                      background: 'rgba(0, 0, 0, 0.03)',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#2d2d2d',
                    }}
                  >
                    ✓ {feature}
                  </div>
                ))}
              </div>

              {/* Sign Up Button */}
              <button
                onClick={() => handleQuickSignUp(roleData.role)}
                disabled={loading !== null}
                className="w-full px-6 py-3 rounded-full transition-all duration-700"
                style={{
                  background: loading === roleData.role
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(0, 0, 0, 0.85)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  border: 'none',
                  cursor: loading !== null ? 'not-allowed' : 'pointer',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (loading === null) {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading === roleData.role ? 'Creating...' : `Try as ${roleData.title}`}
              </button>

              {/* Credentials Note */}
              <p
                className="mt-3 text-center"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                }}
              >
                demo-{roleData.role}@balemoo.com
              </p>
            </motion.div>
          ))}
        </div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '0.875rem',
              color: '#6b6b6b',
            }}
          >
            All demo accounts use password: <strong>demo12345</strong>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}