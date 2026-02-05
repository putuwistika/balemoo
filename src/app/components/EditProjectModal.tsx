import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useProject, type Project } from '@/app/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
}

interface Agenda {
  id: string;
  name: string;
  date: string;
  time: string;
}

export function EditProjectModal({ project, onClose }: EditProjectModalProps) {
  const { user } = useAuth();
  const { updateProject } = useProject();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state - initialize with project data
  const [projectName, setProjectName] = useState(project.name);
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.endDate);
  const [agendas, setAgendas] = useState<Agenda[]>(project.agendas);

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
    
    // Update project via backend API
    try {
      await updateProject(project.id, {
        name: projectName.trim(),
        startDate,
        endDate,
        agendas: validAgendas.map(a => ({
          id: a.id,
          name: a.name.trim(),
          date: a.date,
          time: a.time || '00:00'
        })),
      });

      toast.success('✅ Project updated successfully!');
      setLoading(false);
      onClose();
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
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
            Edit Project
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
            <X className="w-6 h-6" style={{ color: '#6b6b6b' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#1a1a1a',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300"
              style={{
                background: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                color: '#1a1a1a',
              }}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300"
                style={{
                  background: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '1rem',
                  color: '#1a1a1a',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300"
                style={{
                  background: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '1rem',
                  color: '#1a1a1a',
                }}
              />
            </div>
          </div>

          {/* Agendas */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1a1a1a',
                }}
              >
                Agendas
              </label>
              <button
                type="button"
                onClick={handleAddAgenda}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Agenda
              </button>
            </div>

            <div className="space-y-4">
              {agendas.map((agenda, index) => (
                <div
                  key={agenda.id}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#6b6b6b',
                      }}
                    >
                      Agenda {index + 1}
                    </span>
                    {agendas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAgenda(agenda.id)}
                        className="ml-auto p-2 rounded-full transition-all duration-300"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                      >
                        <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={agenda.name}
                      onChange={(e) => handleAgendaChange(agenda.id, 'name', e.target.value)}
                      placeholder="Agenda name"
                      className="w-full px-4 py-2 rounded-lg outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '0.9375rem',
                        color: '#1a1a1a',
                      }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={agenda.date}
                        onChange={(e) => handleAgendaChange(agenda.id, 'date', e.target.value)}
                        className="px-4 py-2 rounded-lg outline-none transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.9375rem',
                          color: '#1a1a1a',
                        }}
                      />
                      <input
                        type="time"
                        value={agenda.time}
                        onChange={(e) => handleAgendaChange(agenda.id, 'time', e.target.value)}
                        className="px-4 py-2 rounded-lg outline-none transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: '0.9375rem',
                          color: '#1a1a1a',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/projects');
              }}
              className="flex-1 px-6 py-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                fontWeight: 500,
                color: '#6b6b6b',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-full transition-all duration-300"
              style={{
                background: loading ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '1rem',
                fontWeight: 500,
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#3b82f6';
                }
              }}
            >
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
