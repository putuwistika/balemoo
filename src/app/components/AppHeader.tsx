import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { ProjectSettings } from './ProjectSettings';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { selectedProject, selectedAgenda, setSelectedAgenda } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAgendaDropdown, setShowAgendaDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Don't show header on landing page or login/demo pages
  const shouldShowHeader = user && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/demo' && location.pathname !== '/projects';

  if (!shouldShowHeader) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAgendaChange = (agenda: any) => {
    setSelectedAgenda(agenda);
    setShowAgendaDropdown(false);
  };

  // Check if current route is Kabar.in section (no agenda dropdown needed)
  const isKabarInRoute = location.pathname.startsWith('/kabar-in');
  
  // Only show agenda dropdown if NOT in Kabar.in routes
  const hasMultipleAgendas = selectedProject && 
    selectedProject.agendas && 
    selectedProject.agendas.length > 1 &&
    !isKabarInRoute;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Logo/Brand + Back to Projects Button */}
          <div className="flex items-center gap-3">
            <div
              className="cursor-pointer"
              onClick={() => navigate('/dashboard')}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            >
              Balemoo
            </div>

            {/* Back to Projects Button */}
            {selectedProject && (
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#8b5cf6',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Pilih Project Lain
              </button>
            )}
          </div>

          {/* Center: Agenda Switcher */}
          <div className="flex items-center gap-3">
            {/* Agenda Switcher (only if multiple agendas) */}
            {hasMultipleAgendas && (
              <div className="relative">
                <button
                  onClick={() => setShowAgendaDropdown(!showAgendaDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: '#1a1a1a',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <span>Agenda: {selectedAgenda?.name || 'Select'}</span>
                  <ChevronDown className="w-4 h-4" style={{ color: '#6b6b6b' }} />
                </button>

                {/* Agenda Dropdown */}
                {showAgendaDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAgendaDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden z-50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        minWidth: '200px',
                      }}
                    >
                      {selectedProject?.agendas.map((agenda) => (
                        <button
                          key={agenda.id}
                          onClick={() => handleAgendaChange(agenda)}
                          className="w-full px-4 py-3 text-left transition-all duration-200"
                          style={{
                            background: selectedAgenda?.id === agenda.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '0.9375rem',
                            color: '#1a1a1a',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedAgenda?.id !== agenda.id) {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedAgenda?.id !== agenda.id) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{agenda.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                            {new Date(agenda.date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                            {agenda.time && ` • ${agenda.time}`}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: User Info & Sign Out */}
          <div className="flex items-center gap-4">
            {/* Settings Button (Admin Only) */}
            {user?.role === 'admin' && selectedProject && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
                title="Project Settings"
              >
                <Settings className="w-4 h-4" style={{ color: '#8b5cf6' }} />
              </button>
            )}

            <div className="text-right">
              <div
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: user?.role === 'admin' ? '#8b5cf6' : user?.role === 'staff' ? '#3b82f6' : '#10b981',
                  textTransform: 'uppercase',
                }}
              >
                {user?.role}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
              }}
            >
              <LogOut className="w-4 h-4" style={{ color: '#6b6b6b' }} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      {shouldShowHeader && <div style={{ height: '72px' }} />}

      {/* Project Settings Modal */}
      {showSettings && (
        <ProjectSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}