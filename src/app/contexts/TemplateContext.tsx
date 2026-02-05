import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';
import { WhatsAppTemplate, CreateTemplateInput, UpdateTemplateInput } from '@/app/types/template';

interface TemplateContextType {
  templates: WhatsAppTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: (filters?: { status?: string; projectId?: string }) => Promise<void>;
  getTemplateById: (id: string) => Promise<WhatsAppTemplate | null>;
  createTemplate: (input: CreateTemplateInput) => Promise<WhatsAppTemplate>;
  updateTemplate: (id: string, updates: UpdateTemplateInput) => Promise<WhatsAppTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  submitTemplate: (id: string) => Promise<WhatsAppTemplate>;
  simulateReject: (id: string, reason: string) => Promise<WhatsAppTemplate>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278`;

  // Fetch templates from backend
  const fetchTemplates = async (filters?: { status?: string; projectId?: string }) => {
    if (!user || !accessToken || user.role !== 'admin') {
      setTemplates([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.projectId) params.append('projectId', filters.projectId);

      const response = await fetch(`${baseUrl}/templates?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to fetch templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Get single template by ID
  const getTemplateById = async (id: string): Promise<WhatsAppTemplate | null> => {
    if (!user || !accessToken || user.role !== 'admin') {
      return null;
    }

    try {
      const response = await fetch(`${baseUrl}/templates/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch template');
      }

      const data = await response.json();
      return data.template;
    } catch (err: any) {
      console.error('Error fetching template:', err);
      return null;
    }
  };

  // Create new template
  const createTemplate = async (input: CreateTemplateInput): Promise<WhatsAppTemplate> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      console.log('Creating template with input:', input);
      
      const response = await fetch(`${baseUrl}/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend validation errors:', errorData);
        const errorMsg = errorData.errors 
          ? `Validation failed: ${errorData.errors.join(', ')}`
          : (errorData.error || 'Failed to create template');
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Refresh templates list
      await fetchTemplates();
      
      return data.template;
    } catch (err: any) {
      console.error('Error creating template:', err);
      throw err;
    }
  };

  // Update existing template
  const updateTemplate = async (id: string, updates: UpdateTemplateInput): Promise<WhatsAppTemplate> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      const data = await response.json();
      
      // Refresh templates list
      await fetchTemplates();
      
      return data.template;
    } catch (err: any) {
      console.error('Error updating template:', err);
      throw err;
    }
  };

  // Delete template
  const deleteTemplate = async (id: string): Promise<void> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      // Refresh templates list
      await fetchTemplates();
    } catch (err: any) {
      console.error('Error deleting template:', err);
      throw err;
    }
  };

  // Submit template to META (dummy)
  const submitTemplate = async (id: string): Promise<WhatsAppTemplate> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/templates/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit template');
      }

      const data = await response.json();
      
      // Start polling for status updates
      startPollingTemplate(id);
      
      return data.template;
    } catch (err: any) {
      console.error('Error submitting template:', err);
      throw err;
    }
  };

  // Simulate rejection (for testing)
  const simulateReject = async (id: string, reason: string): Promise<WhatsAppTemplate> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/templates/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject template');
      }

      const data = await response.json();
      
      // Refresh templates list
      await fetchTemplates();
      
      return data.template;
    } catch (err: any) {
      console.error('Error rejecting template:', err);
      throw err;
    }
  };

  // Polling for template status updates (when PENDING)
  const startPollingTemplate = (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const template = await getTemplateById(id);
        if (!template) {
          clearInterval(pollInterval);
          return;
        }

        // Update template in list
        setTemplates(prev => 
          prev.map(t => t.id === id ? template : t)
        );

        // Stop polling if status changed from PENDING
        if (template.status !== 'PENDING') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling template:', err);
        clearInterval(pollInterval);
      }
    }, 1000); // Poll every 1 second (DEMO: instant approval)

    // Auto-stop after 10 seconds (DEMO mode)
    setTimeout(() => clearInterval(pollInterval), 10000);
  };

  // Load templates when user logs in
  useEffect(() => {
    if (user && accessToken && user.role === 'admin') {
      fetchTemplates();
    } else {
      setTemplates([]);
    }
  }, [user, accessToken]);

  return (
    <TemplateContext.Provider
      value={{
        templates,
        loading,
        error,
        fetchTemplates,
        getTemplateById,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        submitTemplate,
        simulateReject,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}
