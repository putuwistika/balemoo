import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

interface CreateProjectModalProps {
  onClose: () => void;
}

interface Agenda {
  id: string;
  name: string;
  date: string;
  time: string;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const { user } = useAuth();
  const { createProject } = useProject();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agendas, setAgendas] = useState<Agenda[]>([
    { id: crypto.randomUUID(), name: '', date: '', time: '' }
  ]);

  // Demo scenarios
  const scenarios = [
    {
      id: 1,
      title: '1 Project + 1 Agenda',
      description: 'Simple event with single agenda',
      icon: '📅',
      data: {
        name: 'Tech Meetup 2026',
        startDate: '2026-02-15',
        endDate: '2026-02-15',
        agendas: [
          { id: crypto.randomUUID(), name: 'Networking Session', date: '2026-02-15', time: '18:00' }
        ]
      }
    },
    {
      id: 2,
      title: '1 Project + 2 Agendas',
      description: 'Event with multiple sessions',
      icon: '📋',
      data: {
        name: 'Workshop Series',
        startDate: '2026-03-10',
        endDate: '2026-03-11',
        agendas: [
          { id: crypto.randomUUID(), name: 'Morning Workshop', date: '2026-03-10', time: '09:00' },
          { id: crypto.randomUUID(), name: 'Afternoon Session', date: '2026-03-11', time: '14:00' }
        ]
      }
    }
  ];

  const handleScenarioSelect = (scenarioId: number) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenarioId);
      setProjectName(scenario.data.name);
      setStartDate(scenario.data.startDate);
      setEndDate(scenario.data.endDate);
      setAgendas(scenario.data.agendas);
    }
  };

  const handleAddAgenda = () => {
    setAgendas([...agendas, { id: crypto.randomUUID(), name: '', date: '', time: '' }]);
  };

  const handleRemoveAgenda = (id: string) => {
    if (agendas.length > 1) {
      setAgendas(agendas.filter(a => a.id !== id));
    }
  };

  const handleAgendaChange = (id: string, field: keyof Agenda, value: string) => {
    setAgendas(agendas.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }
    
    // Validate agendas
    const validAgendas = agendas.filter(a => a.name.trim() && a.date);
    if (validAgendas.length === 0) {
      toast.error('Please add at least one agenda with name and date');
      return;
    }
    
    setLoading(true);
    
    // Create project via backend API
    try {
      await createProject({
        name: projectName.trim(),
        startDate,
        endDate,
        agendas: validAgendas.map(a => ({
          id: a.id,
          name: a.name.trim(),
          date: a.date,
          time: a.time || '00:00'
        })),
        assignedUsers: [user?.id || ''],
        createdBy: user?.id || '',
      });

      toast.success('🎉 Project created successfully!');
      setLoading(false);
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
      setLoading(false);
    }
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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '2rem',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            Create New Project
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demo Scenarios */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {scenarios.map((scenario) => (
              <motion.button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioSelect(scenario.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl text-left transition-all duration-300"
                style={{
                  background: selectedScenario === scenario.id 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                    : 'rgba(139, 92, 246, 0.05)',
                  border: selectedScenario === scenario.id
                    ? '2px solid #8b5cf6'
                    : '2px solid rgba(139, 92, 246, 0.1)',
                  color: selectedScenario === scenario.id ? '#ffffff' : '#1a1a1a',
                }}
              >
                <div className="text-3xl mb-3">{scenario.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: selectedScenario === scenario.id ? '#ffffff' : '#1a1a1a',
                  }}
                >
                  {scenario.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '0.875rem',
                    color: selectedScenario === scenario.id ? 'rgba(255,255,255,0.8)' : '#6b7280',
                  }}
                >
                  {scenario.description}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Project Name */}
          <div>
            <label
              className="block mb-2"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            >
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Wedding Reception 2026"
              className="w-full px-4 py-3 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.03)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
              }}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block mb-2"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                Start Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: '#9ca3af' }}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                  }}
                />
              </div>
            </div>
            
            <div>
              <label
                className="block mb-2"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                End Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: '#9ca3af' }}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Agendas Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                Event Agendas * (minimum 1)
              </label>
              <button
                type="button"
                onClick={handleAddAgenda}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#8b5cf6',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Agenda
              </button>
            </div>

            <div className="space-y-3">
              {agendas.map((agenda, index) => (
                <motion.div
                  key={agenda.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={agenda.name}
                        onChange={(e) => handleAgendaChange(agenda.id, 'name', e.target.value)}
                        placeholder="Agenda name"
                        className="px-3 py-2 rounded-lg transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.875rem',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        }}
                      />
                      <input
                        type="date"
                        value={agenda.date}
                        onChange={(e) => handleAgendaChange(agenda.id, 'date', e.target.value)}
                        className="px-3 py-2 rounded-lg transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.875rem',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        }}
                      />
                      <input
                        type="time"
                        value={agenda.time}
                        onChange={(e) => handleAgendaChange(agenda.id, 'time', e.target.value)}
                        className="px-3 py-2 rounded-lg transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.875rem',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        }}
                      />
                    </div>
                    {agendas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAgenda(agenda.id)}
                        className="p-2 rounded-lg transition-all duration-300"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/projects');
              }}
              className="flex-1 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: 'rgba(0, 0, 0, 0.04)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1a1a1a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl transition-all duration-300"
              style={{
                background: loading 
                  ? 'rgba(139, 92, 246, 0.5)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(139, 92, 246, 0.3)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}