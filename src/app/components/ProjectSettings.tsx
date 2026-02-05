import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, MessageSquare, QrCode, BarChart3, AlertTriangle, Lock, Unlock, Users, User, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProject } from '@/app/contexts/ProjectContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';

interface ProjectSettingsProps {
  onClose: () => void;
}

interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
}

export function ProjectSettings({ onClose }: ProjectSettingsProps) {
  const { user, accessToken } = useAuth();
  const { selectedProject, updateProject, updateAgenda } = useProject();
  const [showWarning, setShowWarning] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [allUsers, setAllUsers] = useState<BackendUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Local team state
  const [selectedManager, setSelectedManager] = useState<string | undefined>(selectedProject?.team?.manager);
  const [selectedStaff, setSelectedStaff] = useState<string[]>(selectedProject?.team?.staff || []);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(selectedProject?.team?.client);
  
  // Local project active state
  const [projectIsActive, setProjectIsActive] = useState<boolean>(selectedProject?.isActive !== false);

  // Sync local state with selectedProject when it changes
  useEffect(() => {
    if (selectedProject) {
      setProjectIsActive(selectedProject.isActive !== false);
      setSelectedManager(selectedProject.team?.manager);
      setSelectedStaff(selectedProject.team?.staff || []);
      setSelectedClient(selectedProject.team?.client);
    }
  }, [selectedProject]);

  // Fetch all users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !accessToken || user.role !== 'admin') {
        setUsersLoading(false);
        return;
      }
      
      try {
        setUsersLoading(true);
        const response = await fetch(
          `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278/users`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'X-User-Token': accessToken,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users || []);
          console.log('Loaded users from backend:', data.users);
          
          // Clean up invalid IDs from selected team members
          const validUserIds = (data.users || []).map((u: BackendUser) => u.id);
          
          // Filter out invalid staff IDs
          setSelectedStaff(prev => prev.filter(id => validUserIds.includes(id)));
          
          // Clear invalid manager/client IDs
          if (selectedManager && !validUserIds.includes(selectedManager)) {
            setSelectedManager(undefined);
          }
          if (selectedClient && !validUserIds.includes(selectedClient)) {
            setSelectedClient(undefined);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, accessToken]);

  // Only admin can access settings
  if (user?.role !== 'admin' || !selectedProject) {
    return null;
  }

  const features = selectedProject.features || {
    qr_scan: true,
    analytics: true,
  };

  // Get available users by role
  const availableAdmins = allUsers.filter(u => u.role === 'admin');
  const availableStaff = allUsers.filter(u => u.role === 'staff');
  const availableClients = allUsers.filter(u => u.role === 'user');
  
  const getUserById = (userId: string): BackendUser | undefined => {
    const foundUser = allUsers.find(u => u.id === userId);
    if (!foundUser) {
      console.warn('User not found for ID:', userId, 'Available users:', allUsers.length);
    }
    return foundUser;
  };

  const handleConfirmChanges = async () => {
    // Save all changes
    console.log('=== SAVING TEAM CHANGES ===');
    console.log('Project ID:', selectedProject.id);
    console.log('Manager:', selectedManager);
    console.log('Staff:', selectedStaff);
    console.log('Client:', selectedClient);
    
    try {
      await updateProject(selectedProject.id, {
        team: {
          manager: selectedManager,
          staff: selectedStaff,
          client: selectedClient,
        },
      });
      console.log('Team changes saved successfully!');
      setShowConfirmModal(false);
      setIsLocked(true);
    } catch (error) {
      console.error('Error saving team changes:', error);
      alert('Failed to save team changes: ' + (error as Error).message);
    }
  };

  const handleUnlock = () => {
    if (isLocked) {
      setIsLocked(false);
    } else {
      // When locking, check if there are changes
      const hasTeamChanges = 
        selectedManager !== selectedProject.team?.manager ||
        JSON.stringify(selectedStaff) !== JSON.stringify(selectedProject.team?.staff || []) ||
        selectedClient !== selectedProject.team?.client;
      
      if (hasTeamChanges) {
        setShowConfirmModal(true);
      } else {
        setIsLocked(true);
      }
    }
  };

  const handleProjectActiveToggle = async () => {
    if (isLocked) return;
    if (projectIsActive) {
      setShowWarning(true);
    } else {
      // Enable project
      try {
        await updateProject(selectedProject.id, { isActive: true });
        setProjectIsActive(true);
        setShowWarning(false);
      } catch (error) {
        console.error('Error enabling project:', error);
        alert('Failed to enable project: ' + (error as Error).message);
      }
    }
  };

  const confirmDisableProject = async () => {
    try {
      await updateProject(selectedProject.id, { isActive: false });
      setProjectIsActive(false);
      setShowWarning(false);
    } catch (error) {
      console.error('Error disabling project:', error);
      alert('Failed to disable project: ' + (error as Error).message);
    }
  };

  const handleFeatureToggle = (featureKey: 'qr_scan' | 'analytics') => {
    if (isLocked) return;
    updateProject(selectedProject.id, {
      features: {
        ...features,
        [featureKey]: !features[featureKey],
      },
    });
  };

  const handleAgendaToggle = (agendaId: string, currentStatus: boolean | undefined) => {
    if (isLocked) return;
    const newStatus = currentStatus !== false;
    updateAgenda(selectedProject.id, agendaId, { isActive: !newStatus });
  };

  const handleAddStaff = (staffId: string) => {
    if (!selectedStaff.includes(staffId)) {
      setSelectedStaff([...selectedStaff, staffId]);
    }
  };

  const handleRemoveStaff = (staffId: string) => {
    setSelectedStaff(selectedStaff.filter(id => id !== staffId));
  };

  const UserCard = ({ user: cardUser, onRemove }: { user: BackendUser | undefined; onRemove?: () => void }) => {
    // If user not found, don't render
    if (!cardUser) {
      return null;
    }
    
    const roleColor = 
      cardUser.role === 'admin' ? '#8b5cf6' : 
      cardUser.role === 'staff' ? '#3b82f6' : 
      '#10b981';
    
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{
          background: `rgba(${cardUser.role === 'admin' ? '139, 92, 246' : cardUser.role === 'staff' ? '59, 130, 246' : '16, 185, 129'}, 0.05)`,
          border: `1px solid rgba(${cardUser.role === 'admin' ? '139, 92, 246' : cardUser.role === 'staff' ? '59, 130, 246' : '16, 185, 129'}, 0.1)`,
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%)`,
          }}
        >
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
            {cardUser.name}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
            {cardUser.email}
          </div>
        </div>
        {onRemove && !isLocked && (
          <button
            onClick={onRemove}
            className="p-2 rounded-lg transition-all duration-300"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
          </button>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!showConfirmModal) onClose();
          }}
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
        />

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-8 py-6 border-b border-gray-100"
            style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>
                  Project Settings
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Lock/Unlock Button */}
                <button
                  onClick={handleUnlock}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                  style={{
                    background: isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: `1px solid ${isLocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                  }}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-4 h-4" style={{ color: '#ef4444' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>
                        Locked
                      </span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" style={{ color: '#22c55e' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#22c55e' }}>
                        Unlocked
                      </span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <X className="w-5 h-5" style={{ color: '#6b6b6b' }} />
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginTop: '8px' }}>
              {selectedProject.name}
            </p>
            {isLocked && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <p style={{ fontSize: '0.8125rem', color: '#6b6b6b' }}>
                  <Lock className="w-3.5 h-3.5 inline mr-1.5" style={{ color: '#ef4444' }} />
                  Settings are locked. Click "Locked" to make changes.
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8" style={{ opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}>
            {/* Loading state */}
            {usersLoading && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b6b6b', textAlign: 'center' }}>
                  Loading users...
                </p>
              </div>
            )}
            
            {/* Team Section */}
            <div style={{ opacity: usersLoading ? 0.5 : 1 }}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a' }}>
                  Team
                </h3>
              </div>

              {/* Event Manager */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Event Manager
                  </h4>
                </div>
                <select
                  value={selectedManager || ''}
                  onChange={(e) => setSelectedManager(e.target.value || undefined)}
                  disabled={isLocked}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9375rem',
                    color: '#1a1a1a',
                  }}
                >
                  <option value="">Select Manager</option>
                  {availableAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                  ))}
                </select>
                {selectedManager && getUserById(selectedManager) && (
                  <div className="mt-2">
                    <UserCard user={getUserById(selectedManager)} />
                  </div>
                )}
              </div>

              {/* Staff */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: '#3b82f6' }} />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Staff
                  </h4>
                </div>
                {!isLocked && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddStaff(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl mb-3 transition-all duration-300"
                    style={{
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.9375rem',
                      color: '#1a1a1a',
                    }}
                  >
                    <option value="">Add Staff Member</option>
                    {availableStaff.filter(s => !selectedStaff.includes(s.id)).map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name} ({staff.email})</option>
                    ))}
                  </select>
                )}
                <div className="space-y-2">
                  {selectedStaff.length > 0 ? (
                    selectedStaff.map(staffId => {
                      const staff = getUserById(staffId);
                      return staff ? (
                        <UserCard key={staffId} user={staff} onRemove={() => handleRemoveStaff(staffId)} />
                      ) : null;
                    })
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>
                      No staff assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Client */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4" style={{ color: '#10b981' }} />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Client
                  </h4>
                </div>
                <select
                  value={selectedClient || ''}
                  onChange={(e) => setSelectedClient(e.target.value || undefined)}
                  disabled={isLocked}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9375rem',
                    color: '#1a1a1a',
                  }}
                >
                  <option value="">Select Client</option>
                  {availableClients.map(client => (
                    <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                  ))}
                </select>
                {selectedClient && getUserById(selectedClient) && (
                  <div className="mt-2">
                    <UserCard user={getUserById(selectedClient)} />
                  </div>
                )}
              </div>
            </div>

            {/* Project Settings */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                Project Settings
              </h3>
              
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
              >
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                    Project Active
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '4px' }}>
                    Enable or disable this project for Staff and Users
                  </div>
                </div>
                <button
                  onClick={handleProjectActiveToggle}
                  className="relative w-14 h-7 rounded-full transition-all duration-300"
                  style={{
                    background: projectIsActive ? '#8b5cf6' : '#d1d5db',
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{ left: projectIsActive ? '30px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Warning Dialog */}
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#ef4444' }} />
                    <div className="flex-1">
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                        Disable Project?
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '4px' }}>
                        This project will become inaccessible to Staff and Users. Are you sure?
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={confirmDisableProject}
                          className="px-4 py-2 rounded-xl"
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          Yes, Disable
                        </button>
                        <button
                          onClick={() => setShowWarning(false)}
                          className="px-4 py-2 rounded-xl"
                          style={{
                            background: 'rgba(0, 0, 0, 0.05)',
                            color: '#1a1a1a',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agenda Settings */}
            {selectedProject.agendas && selectedProject.agendas.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                  Agenda Settings
                </h3>
                <div className="space-y-3">
                  {selectedProject.agendas.map((agenda) => {
                    const agendaIsActive = agenda.isActive !== false;
                    return (
                      <div
                        key={agenda.id}
                        className="flex items-center justify-between p-4 rounded-2xl"
                        style={{
                          background: agendaIsActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          border: `1px solid ${agendaIsActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                          opacity: agendaIsActive ? 1 : 0.6,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                            {agenda.name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '4px' }}>
                            {new Date(agenda.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            {agenda.time && ` • ${agenda.time}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAgendaToggle(agenda.id, agenda.isActive)}
                          className="relative w-14 h-7 rounded-full"
                          style={{
                            background: agendaIsActive ? '#3b82f6' : '#d1d5db',
                          }}
                        >
                          <motion.div
                            className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                            animate={{ left: agendaIsActive ? '30px' : '2px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feature Settings */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
                Feature Settings
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '16px' }}>
                Enable or disable features for this project
              </p>
              
              <div className="space-y-3">
                {/* QR Code Scan */}
                <div
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{
                    background: features.qr_scan ? 'rgba(59, 130, 246, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${features.qr_scan ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5" style={{ color: features.qr_scan ? '#3b82f6' : '#9ca3af' }} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                        QR Code Scan
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                        Enable QR-based guest check-in
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFeatureToggle('qr_scan')}
                    className="relative w-14 h-7 rounded-full"
                    style={{
                      background: features.qr_scan ? '#3b82f6' : '#d1d5db',
                    }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ left: features.qr_scan ? '30px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Analytics */}
                <div
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{
                    background: features.analytics ? 'rgba(139, 92, 246, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${features.analytics ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" style={{ color: features.analytics ? '#8b5cf6' : '#9ca3af' }} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>
                        Analytics Dashboard
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b6b6b', marginTop: '2px' }}>
                        Enable guest analytics and monitoring
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFeatureToggle('analytics')}
                    className="relative w-14 h-7 rounded-full"
                    style={{
                      background: features.analytics ? '#8b5cf6' : '#d1d5db',
                    }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ left: features.analytics ? '30px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 flex items-center justify-center"
          >
            <div
              className="absolute inset-0"
              onClick={() => setShowConfirmModal(false)}
              style={{ background: 'rgba(0, 0, 0, 0.6)' }}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative bg-white rounded-3xl p-6 max-w-md mx-4"
              style={{
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 mt-1" style={{ color: '#f59e0b' }} />
                <div className="flex-1">
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                    Save Changes?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b6b6b', marginBottom: '20px' }}>
                    You have unsaved changes to the team configuration. Do you want to save these changes?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmChanges}
                      className="flex-1 px-4 py-2 rounded-xl"
                      style={{
                        background: '#8b5cf6',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        // Discard changes
                        setSelectedManager(selectedProject.team?.manager);
                        setSelectedStaff(selectedProject.team?.staff || []);
                        setSelectedClient(selectedProject.team?.client);
                        setShowConfirmModal(false);
                        setIsLocked(true);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl"
                      style={{
                        background: 'rgba(0, 0, 0, 0.05)',
                        color: '#1a1a1a',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
