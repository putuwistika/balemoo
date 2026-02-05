import { motion, AnimatePresence } from 'motion/react';
import { X, User, Users, Briefcase } from 'lucide-react';
import { getUserById } from '@/app/utils/users';

interface TeamViewModalProps {
  projectName?: string;
  team?: {
    manager?: string;
    staff?: string[];
    client?: string;
  };
  project?: any;
  onClose: () => void;
}

export function TeamViewModal({ projectName, team, project, onClose }: TeamViewModalProps) {
  const actualProject = project || { name: projectName, team };
  const manager = actualProject.team?.manager ? getUserById(actualProject.team.manager) : null;
  const staffMembers = actualProject.team?.staff?.map((id: string) => getUserById(id)).filter(Boolean) || [];
  const client = actualProject.team?.client ? getUserById(actualProject.team.client) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a' }}>
                    Team Lineage
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                    {actualProject.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
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
                <X className="w-5 h-5" style={{ color: '#6b6b6b' }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {/* Event Manager */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Event Manager
                </h3>
              </div>
              {manager ? (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                      {manager.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                      {manager.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                  No manager assigned
                </div>
              )}
            </div>

            {/* Staff */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" style={{ color: '#3b82f6' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Staff
                </h3>
              </div>
              {staffMembers.length > 0 ? (
                <div className="space-y-2">
                  {staffMembers.map((staff) => (
                    <div
                      key={staff?.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                          {staff?.name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                          {staff?.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                  No staff assigned
                </div>
              )}
            </div>

            {/* Client */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4" style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Client
                </h3>
              </div>
              {client ? (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                      {client.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                  No client assigned
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}