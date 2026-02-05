import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializingDemo, setInitializingDemo] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleInitDemoUsers = async () => {
    setError('');
    setSuccessMessage('');
    setInitializingDemo(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-deeab278/init-demo-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const createdCount = data.results.filter((r: any) => r.status === 'created').length;
        const existingCount = data.results.filter((r: any) => r.status === 'already_exists').length;
        
        if (createdCount > 0) {
          setSuccessMessage(`✓ ${createdCount} demo account(s) created successfully! You can now sign in or use Quick Demo Access.`);
        } else if (existingCount > 0) {
          setSuccessMessage(`✓ Demo accounts already exist! You can sign in with demo credentials or use Quick Demo Access.`);
        }
      } else {
        throw new Error(data.error || 'Failed to initialize demo users');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo accounts');
    } finally {
      setInitializingDemo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      navigate('/projects');
    } catch (err: any) {
      let errorMessage = err.message || 'Authentication failed';
      
      // Provide helpful guidance for common errors
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid credentials. Please check your email and password, or create a new account.';
      } else if (errorMessage.includes('already been registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
        // Auto-switch to sign in mode
        setTimeout(() => {
          setIsSignUp(false);
          setError('');
        }, 2000);
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before signing in.';
      }
      
      setError(errorMessage);
      // Add shake animation on error
      const form = document.querySelector('form');
      form?.classList.add('shake');
      setTimeout(() => form?.classList.remove('shake'), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6"
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
        className="w-full max-w-md"
      >
        {/* Card with glassmorphism */}
        <div
          className="rounded-3xl p-8 backdrop-blur-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '2rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#1a1a1a',
              }}
            >
              Balemoo
            </h1>
            <p
              className="mt-2"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 400,
                color: '#6b6b6b',
              }}
            >
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg"
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

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  color: '#22c55e',
                }}
              >
                {successMessage}
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#1a1a1a',
                  }}
                  className="block mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '0.9375rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1a1a1a',
                }}
                className="block mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#1a1a1a',
                }}
                className="block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-full transition-all duration-700"
              style={{
                background: loading ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.85)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#ffffff',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="transition-opacity duration-300 hover:opacity-60"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#6b6b6b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo Access Link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/demo')}
              className="transition-opacity duration-300 hover:opacity-60"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#8b5cf6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try Quick Demo Access →
            </button>
          </div>

          {/* Initialize Demo Users Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleInitDemoUsers}
              disabled={initializingDemo}
              className="transition-opacity duration-300 hover:opacity-60"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#8b5cf6',
                background: 'none',
                border: 'none',
                cursor: initializingDemo ? 'not-allowed' : 'pointer',
              }}
            >
              {initializingDemo ? 'Initializing...' : 'Initialize Demo Users'}
            </button>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}