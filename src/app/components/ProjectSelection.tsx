import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useProject } from '@/app/contexts/ProjectContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Calendar, Search, Plus, LogOut, Sparkles, Users, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProjectModal } from './CreateProjectModal';
import { EditProjectModal } from './EditProjectModal';
import { TeamViewModal } from './TeamViewModal';

type ProjectStatus = 'Today' | 'Upcoming' | 'Past';

export function ProjectSelection() {
  const { projects, setSelectedProject, isProjectAccessible, selectedProject, loading, deleteProject } = useProject();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [shakingCard, setShakingCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showTeamViewModal, setShowTeamViewModal] = useState(false);
  const [teamViewProject, setTeamViewProject] = useState<any>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const getProjectStatus = (project: any): ProjectStatus => {
    const now = new Date();
    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);
    
    const start = new Date(project.startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(project.endDate);
    end.setHours(0, 0, 0, 0);

    if (now >= start && now <= end) {
      return 'Today';
    } else if (now < start) {
      return 'Upcoming';
    } else {
      return 'Past';
    }
  };

  const handleProjectClick = (project: any) => {
    if (isProjectAccessible(project)) {
      setSelectedProject(project);
      // Navigate to dashboard after selection
      navigate('/dashboard');
    } else {
      // Trigger shake animation
      setShakingCard(project.id);
      setTimeout(() => setShakingCard(null), 500);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEditProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    
    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingProjectId(projectId);
    
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setDeletingProjectId(null);
    }
  };

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.agendas.some((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Priority logic for top section (max 3 cards)
  const getPriorityProjects = () => {
    const today = filteredProjects.filter(p => getProjectStatus(p) === 'Today');
    const upcoming = filteredProjects.filter(p => getProjectStatus(p) === 'Upcoming')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const past = filteredProjects.filter(p => getProjectStatus(p) === 'Past')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    const priority: any[] = [];
    
    // Add up to 3 today projects
    priority.push(...today.slice(0, 3));
    
    // Fill with upcoming if less than 3
    if (priority.length < 3) {
      priority.push(...upcoming.slice(0, 3 - priority.length));
    }
    
    // Fill with past if still less than 3
    if (priority.length < 3) {
      priority.push(...past.slice(0, 3 - priority.length));
    }
    
    return priority.slice(0, 3);
  };

  const priorityProjects = getPriorityProjects();
  const remainingProjects = filteredProjects.filter(p => 
    !priorityProjects.some(pp => pp.id === p.id)
  ).sort((a, b) => {
    // Sort remaining: Upcoming first (by date), then Past (by date desc)
    const statusA = getProjectStatus(a);
    const statusB = getProjectStatus(b);
    
    if (statusA === 'Upcoming' && statusB === 'Past') return -1;
    if (statusA === 'Past' && statusB === 'Upcoming') return 1;
    
    if (statusA === 'Upcoming' && statusB === 'Upcoming') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    
    if (statusA === 'Past' && statusB === 'Past') {
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
    
    return 0;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Today':
        return '#10b981';
      case 'Upcoming':
        return '#3b82f6';
      case 'Past':
        return '#9ca3af';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '1rem',
            color: '#6b6b6b',
          }}
        >
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full px-6 py-12"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 20%, rgba(200, 180, 255, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 80% 60%, rgba(255, 200, 180, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 20% 70%, rgba(180, 220, 255, 0.1) 0%, transparent 50%),
          linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)
        `,
      }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto mb-12 flex justify-end items-center"
      >
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#ffffff',
                border: 'none',
              }}
            >
              <Plus className="w-5 h-5" />
              Create Project
            </motion.button>
          )}
          
          <button
            onClick={handleSignOut}
            className="p-3 rounded-2xl transition-all duration-300"
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
            <LogOut className="w-5 h-5" style={{ color: '#6b6b6b' }} />
          </button>
        </div>
      </motion.div>

      {/* Priority Projects - Podium Style */}
      {priorityProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-7xl mx-auto mb-16"
        >
          {/* Podium Layout: 2nd | 1st (larger) | 3rd */}
          <div className="flex items-end justify-center gap-6">
            {/* Render in podium order: 2nd, 1st, 3rd */}
            {[1, 0, 2].map((podiumIndex) => {
              const project = priorityProjects[podiumIndex];
              if (!project) return null;
              
              const index = podiumIndex; // Keep original index for delays
              const status = getProjectStatus(project);
              const accessible = isProjectAccessible(project);
              const isHovered = hoveredCard === project.id;
              const isShaking = shakingCard === project.id;
              const isPrimary = podiumIndex === 0; // 1st place

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.15,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  onClick={() => handleProjectClick(project)}
                  onMouseEnter={() => setHoveredCard(project.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="relative rounded-3xl backdrop-blur-xl transition-all duration-700"
                  style={{
                    // Podium sizing
                    width: isPrimary ? '380px' : '320px',
                    padding: isPrimary ? '2.5rem' : '2rem',
                    
                    background: accessible
                      ? status === 'Today'
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.8)'
                      : 'rgba(200, 200, 200, 0.3)',
                    border: accessible
                      ? status === 'Today'
                        ? '2px solid rgba(16, 185, 129, 0.3)'
                        : isPrimary
                        ? '2px solid rgba(139, 92, 246, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.5)'
                      : '1px solid rgba(150, 150, 150, 0.2)',
                    boxShadow: isHovered && accessible
                      ? isPrimary
                        ? '0 30px 80px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)'
                        : status === 'Today'
                        ? '0 20px 60px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)'
                        : '0 20px 60px rgba(0, 0, 0, 0.15)'
                      : isPrimary && accessible
                      ? '0 20px 60px rgba(139, 92, 246, 0.2)'
                      : status === 'Today' && accessible
                      ? '0 12px 40px rgba(16, 185, 129, 0.15)'
                      : '0 12px 40px rgba(0, 0, 0, 0.08)',
                    transform: isHovered && accessible 
                      ? isPrimary
                        ? 'translateY(-16px) scale(1.03)' 
                        : 'translateY(-12px) scale(1.02)' 
                      : 'translateY(0) scale(1)',
                    cursor: accessible ? 'pointer' : 'not-allowed',
                    opacity: accessible ? 1 : 0.5,
                    filter: accessible ? 'none' : 'grayscale(1)',
                    animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
                  }}
                >
                  {/* Glow Effect - Primary gets purple, Today gets green */}
                  {accessible && (isPrimary || status === 'Today') && (
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-700"
                      style={{
                        background: isPrimary 
                          ? 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
                          : 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                        opacity: isHovered ? 1 : 0,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Lock Icon (if not accessible) */}
                  {!accessible && (
                    <div className="absolute top-6 right-6">
                      <Lock className="w-6 h-6" style={{ color: '#9ca3af' }} />
                    </div>
                  )}

                  {/* Disabled Badge (if project.isActive === false) */}
                  {project.isActive === false && (
                    <div 
                      className="absolute top-6 left-6 px-3 py-1.5 rounded-lg flex items-center gap-2"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                      <span 
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#ef4444',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Disabled
                      </span>
                    </div>
                  )}

                  {/* Top Bar - Status Badge & Team Button */}
                  <div className="flex justify-between items-start mb-6">
                    {/* Status Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        background: `${getStatusColor(status)}15`,
                        border: `1.5px solid ${getStatusColor(status)}40`,
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: getStatusColor(status),
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {status === 'Today' && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: getStatusColor(status) }} />}
                      {status}
                    </div>

                    {/* Team Icon */}
                    {accessible && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamViewProject(project);
                          setShowTeamViewModal(true);
                        }}
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
                        title="View Team"
                      >
                        <Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                      </button>
                    )}
                  </div>

                  {/* Project Name */}
                  <h3
                    className="mb-4"
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: accessible ? '#1a1a1a' : '#9ca3af',
                      lineHeight: 1.3,
                    }}
                  >
                    {project.name}
                  </h3>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4" style={{ color: accessible ? '#6b6b6b' : '#9ca3af' }} />
                    <span
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: accessible ? '#6b6b6b' : '#9ca3af',
                      }}
                    >
                      {formatDateRange(project.startDate, project.endDate)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div
                    className="mb-4"
                    style={{
                      height: '1px',
                      background: accessible ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    }}
                  />

                  {/* Agendas */}
                  <div>
                    <p
                      className="mb-2"
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: accessible ? '#6b6b6b' : '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {project.agendas.length} Agenda{project.agendas.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {project.agendas.slice(0, 2).map((agenda: any) => (
                        <div
                          key={agenda.id}
                          className="flex items-center gap-2"
                        >
                          <div
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: accessible ? '#6b6b6b' : '#9ca3af',
                            }}
                          />
                          <span
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: '0.875rem',
                              color: accessible ? '#1a1a1a' : '#9ca3af',
                            }}
                          >
                            {agenda.name}
                          </span>
                        </div>
                      ))}
                      {project.agendas.length > 2 && (
                        <p
                          style={{
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '0.8125rem',
                            fontStyle: 'italic',
                            color: accessible ? '#6b6b6b' : '#9ca3af',
                            marginLeft: '12px',
                          }}
                        >
                          +{project.agendas.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Bottom (Admin Only) */}
                  {user?.role === 'admin' && accessible && (
                    <div className="mt-6 pt-4 flex gap-3" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                      <button
                        onClick={(e) => handleEditProject(e, project)}
                        className="flex-1 px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#3b82f6',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        disabled={deletingProjectId === project.id}
                        className="flex-1 px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#ef4444',
                          opacity: deletingProjectId === project.id ? 0.5 : 1,
                          cursor: deletingProjectId === project.id ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (deletingProjectId !== project.id) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingProjectId !== project.id) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}

                  {/* Tooltip */}
                  {!accessible && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 rounded-xl whitespace-nowrap"
                      style={{
                        background: 'rgba(0, 0, 0, 0.9)',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      You are not assigned to this project
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Remaining Projects - Compact List */}
      {remainingProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <h2
            className="mb-6 flex items-center gap-3"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            <div style={{ width: '4px', height: '24px', background: '#8b5cf6', borderRadius: '2px' }} />
            Other Projects
          </h2>
          <div className="space-y-3">
            {remainingProjects.map((project, index) => {
              const status = getProjectStatus(project);
              const accessible = isProjectAccessible(project);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.6 + index * 0.05,
                  }}
                  onClick={() => handleProjectClick(project)}
                  className="flex items-center justify-between p-5 rounded-2xl backdrop-blur-xl transition-all duration-300"
                  style={{
                    background: accessible ? 'rgba(255, 255, 255, 0.7)' : 'rgba(200, 200, 200, 0.3)',
                    border: `1px solid ${accessible ? 'rgba(0, 0, 0, 0.08)' : 'rgba(150, 150, 150, 0.15)'}`,
                    cursor: accessible ? 'pointer' : 'not-allowed',
                    opacity: accessible ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (accessible) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (accessible) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {!accessible && <Lock className="w-5 h-5" style={{ color: '#9ca3af' }} />}
                    {project.isActive === false && (
                      <div 
                        className="px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <Lock className="w-3 h-3" style={{ color: '#ef4444' }} />
                        <span 
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: '#ef4444',
                            textTransform: 'uppercase',
                          }}
                        >
                          Disabled
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4
                          style={{
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: accessible ? '#1a1a1a' : '#9ca3af',
                          }}
                        >
                          {project.name}
                        </h4>
                        <div
                          className="px-3 py-1 rounded-full"
                          style={{
                            background: `${getStatusColor(status)}15`,
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: getStatusColor(status),
                            textTransform: 'uppercase',
                          }}
                        >
                          {status}
                        </div>
                      </div>
                      <p
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.8125rem',
                          color: accessible ? '#6b6b6b' : '#9ca3af',
                        }}
                      >
                        {formatDateRange(project.startDate, project.endDate)} • {project.agendas.length} agenda{project.agendas.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Search Bar at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="max-w-7xl mx-auto"
      >
        <div className="relative">
          <Search
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5"
            style={{ color: '#9ca3af' }}
          />
          <input
            type="text"
            placeholder="Search projects by name or agenda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 rounded-2xl backdrop-blur-xl transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
            }}
          />
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-7xl mx-auto text-center py-20"
        >
          <Calendar className="w-20 h-20 mx-auto mb-6" style={{ color: '#d1d5db' }} />
          <h3
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#9ca3af',
              marginBottom: '0.5rem',
            }}
          >
            No projects found
          </h3>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '1rem',
              color: '#9ca3af',
            }}
          >
            {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first project'}
          </p>
        </motion.div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <EditProjectModal 
          project={editingProject} 
          onClose={() => {
            setShowEditModal(false);
            setEditingProject(null);
          }} 
        />
      )}

      {/* Team View Modal */}
      {showTeamViewModal && (
        <TeamViewModal onClose={() => setShowTeamViewModal(false)} project={teamViewProject} />
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}