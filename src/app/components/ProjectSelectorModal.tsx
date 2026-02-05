import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useProject } from '@/app/contexts/ProjectContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { X, Lock, Calendar, Search, Plus } from 'lucide-react';

type ProjectStatus = 'Today' | 'Upcoming' | 'Past';

interface ProjectSelectorModalProps {
  onClose: () => void;
}

export function ProjectSelectorModal({ onClose }: ProjectSelectorModalProps) {
  const { projects, setSelectedProject, isProjectAccessible, selectedProject } = useProject();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [shakingCard, setShakingCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getProjectStatus = (project: any): ProjectStatus => {
    const now = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);

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
      onClose();
    } else {
      // Trigger shake animation
      setShakingCard(project.id);
      setTimeout(() => setShakingCard(null), 500);
    }
  };

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.agendas.some((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || getProjectStatus(project) === statusFilter;
    
    return matchesSearch && matchesStatus;
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
  const upcomingProjects = filteredProjects.filter(p => 
    getProjectStatus(p) === 'Upcoming' && !priorityProjects.some(pp => pp.id === p.id)
  );
  const pastProjects = filteredProjects.filter(p => 
    getProjectStatus(p) === 'Past' && !priorityProjects.some(pp => pp.id === p.id)
  );

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '2rem',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            Select Project Event
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all duration-300"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Section - Priority Projects (3 Pricing-Style Cards) */}
        {priorityProjects.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {priorityProjects.map((project, index) => {
                const status = getProjectStatus(project);
                const accessible = isProjectAccessible(project);
                const isHovered = hoveredCard === project.id;
                const isShaking = shakingCard === project.id;
                const isSelected = selectedProject?.id === project.id;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    onClick={() => handleProjectClick(project)}
                    onMouseEnter={() => setHoveredCard(project.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="relative rounded-3xl p-6 backdrop-blur-xl transition-all duration-500"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.1) 100%)'
                        : accessible
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(200, 200, 200, 0.3)',
                      border: isSelected
                        ? '2px solid rgba(139, 92, 246, 0.5)'
                        : `1px solid ${accessible ? 'rgba(255, 255, 255, 0.3)' : 'rgba(150, 150, 150, 0.2)'}`,
                      boxShadow: isHovered && accessible
                        ? status === 'Today'
                          ? '0 12px 40px rgba(16, 185, 129, 0.2)'
                          : '0 12px 40px rgba(0, 0, 0, 0.15)'
                        : '0 8px 32px rgba(0, 0, 0, 0.08)',
                      transform: isHovered && accessible ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                      cursor: accessible ? 'pointer' : 'not-allowed',
                      opacity: accessible ? 1 : 0.5,
                      filter: accessible ? 'none' : 'grayscale(1)',
                      animation: isShaking ? 'shake 0.5s ease-in-out' : 'none',
                    }}
                  >
                    {/* Lock Icon */}
                    {!accessible && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-5 h-5" style={{ color: '#9ca3af' }} />
                      </div>
                    )}

                    {/* Disabled Badge */}
                    {project.isActive === false && (
                      <div 
                        className="absolute top-4 left-4 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          backdropFilter: 'blur(8px)',
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

                    {/* Status Badge */}
                    <div
                      className="inline-block px-3 py-1 rounded-full mb-4"
                      style={{
                        background: `${getStatusColor(status)}20`,
                        color: getStatusColor(status),
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {status}
                    </div>

                    {/* Project Name */}
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: accessible ? '#1a1a1a' : '#9ca3af',
                      }}
                    >
                      {project.name}
                    </h3>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4" style={{ color: accessible ? '#6b6b6b' : '#9ca3af' }} />
                      <span
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.8125rem',
                          color: accessible ? '#6b6b6b' : '#9ca3af',
                        }}
                      >
                        {formatDateRange(project.startDate, project.endDate)}
                      </span>
                    </div>

                    {/* Agenda Summary */}
                    <p
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: accessible ? '#6b6b6b' : '#9ca3af',
                        lineHeight: 1.5,
                      }}
                    >
                      {project.agendas.length} agenda{project.agendas.length > 1 ? 's' : ''}: {project.agendas.map((a: any) => a.name).join(', ')}
                    </p>

                    {/* Tooltip */}
                    {!accessible && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg whitespace-nowrap"
                        style={{
                          background: 'rgba(0, 0, 0, 0.9)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.8125rem',
                          color: '#ffffff',
                        }}
                      >
                        You are not assigned to this project
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Section - List View */}
        <div className="space-y-6">
          {/* Upcoming Projects */}
          {upcomingProjects.length > 0 && (
            <div>
              <h3
                className="mb-3 flex items-center gap-2"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#6b6b6b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <div style={{ width: '3px', height: '16px', background: '#3b82f6', borderRadius: '2px' }} />
                Upcoming Projects
              </h3>
              <div className="space-y-2">
                {upcomingProjects.map((project) => {
                  const accessible = isProjectAccessible(project);
                  const isSelected = selectedProject?.id === project.id;

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300"
                      style={{
                        background: isSelected 
                          ? 'rgba(59, 130, 246, 0.1)'
                          : accessible
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(200, 200, 200, 0.2)',
                        border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.06)'}`,
                        cursor: accessible ? 'pointer' : 'not-allowed',
                        opacity: accessible ? 1 : 0.5,
                      }}
                      onMouseEnter={(e) => {
                        if (accessible && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (accessible && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {!accessible && <Lock className="w-4 h-4" style={{ color: '#9ca3af' }} />}
                        {project.isActive === false && (
                          <div 
                            className="px-2 py-0.5 rounded-md flex items-center gap-1"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            <Lock className="w-2.5 h-2.5" style={{ color: '#ef4444' }} />
                            <span 
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                color: '#ef4444',
                                textTransform: 'uppercase',
                              }}
                            >
                              Disabled
                            </span>
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: '0.9375rem',
                              fontWeight: 600,
                              color: accessible ? '#1a1a1a' : '#9ca3af',
                            }}
                          >
                            {project.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: '0.8125rem',
                              color: accessible ? '#6b6b6b' : '#9ca3af',
                              marginTop: '2px',
                            }}
                          >
                            {formatDateRange(project.startDate, project.endDate)} • {project.agendas.length} agenda{project.agendas.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Projects */}
          {pastProjects.length > 0 && (
            <div>
              <h3
                className="mb-3 flex items-center gap-2"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#6b6b6b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <div style={{ width: '3px', height: '16px', background: '#9ca3af', borderRadius: '2px' }} />
                Past Projects
              </h3>
              <div className="space-y-2">
                {pastProjects.map((project) => {
                  const accessible = isProjectAccessible(project);
                  const isSelected = selectedProject?.id === project.id;

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className="flex items-center justify-between p-4 rounded-xl transition-all duration-300"
                      style={{
                        background: isSelected
                          ? 'rgba(156, 163, 175, 0.1)'
                          : accessible
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(200, 200, 200, 0.2)',
                        border: `1px solid ${isSelected ? 'rgba(156, 163, 175, 0.3)' : 'rgba(0, 0, 0, 0.06)'}`,
                        cursor: accessible ? 'pointer' : 'not-allowed',
                        opacity: accessible ? 1 : 0.5,
                      }}
                      onMouseEnter={(e) => {
                        if (accessible && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (accessible && !isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {!accessible && <Lock className="w-4 h-4" style={{ color: '#9ca3af' }} />}
                        {project.isActive === false && (
                          <div 
                            className="px-2 py-0.5 rounded-md flex items-center gap-1"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            <Lock className="w-2.5 h-2.5" style={{ color: '#ef4444' }} />
                            <span 
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                color: '#ef4444',
                                textTransform: 'uppercase',
                              }}
                            >
                              Disabled
                            </span>
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: '0.9375rem',
                              fontWeight: 600,
                              color: accessible ? '#1a1a1a' : '#9ca3af',
                            }}
                          >
                            {project.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                              fontSize: '0.8125rem',
                              color: accessible ? '#6b6b6b' : '#9ca3af',
                              marginTop: '2px',
                            }}
                          >
                            {formatDateRange(project.startDate, project.endDate)} • {project.agendas.length} agenda{project.agendas.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter (Bottom) */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search projects by name or agenda"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
            className="px-4 py-2 rounded-xl transition-all duration-300"
            style={{
              background: 'rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '0.875rem',
              outline: 'none',
            }}
          >
            <option value="All">All Status</option>
            <option value="Today">Today</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Past">Past</option>
          </select>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <p
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                color: '#9ca3af',
              }}
            >
              No projects found
            </p>
          </div>
        )}

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}
