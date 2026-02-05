import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';
import type { ChatflowExecution, BulkExecutionResult } from '@/app/types/execution';
import type { MessageLog } from '@/app/types/message';

// Helper function to safely parse JSON responses
async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid JSON response from server');
  }
}

interface ExecutionContextType {
  executions: ChatflowExecution[];
  loading: boolean;
  error: string | null;

  fetchExecutions: (campaignId: string) => Promise<void>;
  getExecutionById: (id: string) => Promise<ChatflowExecution | null>;
  getExecutionMessages: (id: string) => Promise<MessageLog[]>;

  retryExecution: (id: string) => Promise<void>;
  pauseExecution: (id: string) => Promise<void>;
  resumeExecution: (id: string) => Promise<void>;

  bulkRetryExecutions: (campaignId: string, executionIds: string[]) => Promise<BulkExecutionResult>;
  bulkPauseExecutions: (executionIds: string[]) => Promise<BulkExecutionResult>;
  bulkResumeExecutions: (campaignId: string, executionIds: string[]) => Promise<BulkExecutionResult>;
  bulkCancelExecutions: (executionIds: string[]) => Promise<BulkExecutionResult>;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [executions, setExecutions] = useState<ChatflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278`;

  // Fetch executions for a campaign
  const fetchExecutions = async (campaignId: string) => {
    if (!user || !accessToken) {
      setExecutions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${campaignId}/executions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch executions');
      }
      setExecutions(data.executions || []);
    } catch (err: any) {
      console.error('Error fetching executions:', err);
      setError(err.message || 'Failed to fetch executions');
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Get single execution by ID
  const getExecutionById = async (id: string): Promise<ChatflowExecution | null> => {
    if (!user || !accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${baseUrl}/executions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch execution');
      }
      return data.execution;
    } catch (err: any) {
      console.error('Error fetching execution:', err);
      setError(err.message || 'Failed to fetch execution');
      return null;
    }
  };

  // Get execution messages
  const getExecutionMessages = async (id: string): Promise<MessageLog[]> => {
    if (!user || !accessToken) {
      return [];
    }

    try {
      const response = await fetch(`${baseUrl}/executions/${id}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }
      return data.messages || [];
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages');
      return [];
    }
  };

  // Retry execution
  const retryExecution = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/${id}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry execution');
      }

      // Refresh execution data
      const updatedExecution = await getExecutionById(id);
      if (updatedExecution) {
        setExecutions(prev =>
          prev.map(e => (e.id === id ? updatedExecution : e))
        );
      }
    } catch (err: any) {
      console.error('Error retrying execution:', err);
      setError(err.message || 'Failed to retry execution');
      throw err;
    }
  };

  // Pause execution
  const pauseExecution = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/${id}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to pause execution');
      }

      // Update local state
      setExecutions(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, status: 'paused', paused_at: new Date().toISOString() }
            : e
        )
      );
    } catch (err: any) {
      console.error('Error pausing execution:', err);
      setError(err.message || 'Failed to pause execution');
      throw err;
    }
  };

  // Resume execution
  const resumeExecution = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/${id}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume execution');
      }

      // Refresh execution data
      const updatedExecution = await getExecutionById(id);
      if (updatedExecution) {
        setExecutions(prev =>
          prev.map(e => (e.id === id ? updatedExecution : e))
        );
      }
    } catch (err: any) {
      console.error('Error resuming execution:', err);
      setError(err.message || 'Failed to resume execution');
      throw err;
    }
  };

  // Bulk retry executions
  const bulkRetryExecutions = async (
    campaignId: string,
    executionIds: string[]
  ): Promise<BulkExecutionResult> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/bulk-retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ execution_ids: executionIds, campaign_id: campaignId }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk retry executions');
      }

      // Refresh executions
      await fetchExecutions(campaignId);

      return data.result;
    } catch (err: any) {
      console.error('Error bulk retrying executions:', err);
      setError(err.message || 'Failed to bulk retry executions');
      throw err;
    }
  };

  // Bulk pause executions
  const bulkPauseExecutions = async (executionIds: string[]): Promise<BulkExecutionResult> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/bulk-pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ execution_ids: executionIds }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk pause executions');
      }

      // Update local state
      const now = new Date().toISOString();
      setExecutions(prev =>
        prev.map(e =>
          data.result.succeeded.includes(e.id)
            ? { ...e, status: 'paused', paused_at: now }
            : e
        )
      );

      return data.result;
    } catch (err: any) {
      console.error('Error bulk pausing executions:', err);
      setError(err.message || 'Failed to bulk pause executions');
      throw err;
    }
  };

  // Bulk resume executions
  const bulkResumeExecutions = async (
    campaignId: string,
    executionIds: string[]
  ): Promise<BulkExecutionResult> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/bulk-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ execution_ids: executionIds, campaign_id: campaignId }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk resume executions');
      }

      // Refresh executions
      await fetchExecutions(campaignId);

      return data.result;
    } catch (err: any) {
      console.error('Error bulk resuming executions:', err);
      setError(err.message || 'Failed to bulk resume executions');
      throw err;
    }
  };

  // Bulk cancel executions
  const bulkCancelExecutions = async (executionIds: string[]): Promise<BulkExecutionResult> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/executions/bulk-cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ execution_ids: executionIds }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to bulk cancel executions');
      }

      // Update local state
      setExecutions(prev =>
        prev.map(e =>
          data.result.succeeded.includes(e.id)
            ? { ...e, status: 'cancelled' }
            : e
        )
      );

      return data.result;
    } catch (err: any) {
      console.error('Error bulk cancelling executions:', err);
      setError(err.message || 'Failed to bulk cancel executions');
      throw err;
    }
  };

  const value: ExecutionContextType = {
    executions,
    loading,
    error,
    fetchExecutions,
    getExecutionById,
    getExecutionMessages,
    retryExecution,
    pauseExecution,
    resumeExecution,
    bulkRetryExecutions,
    bulkPauseExecutions,
    bulkResumeExecutions,
    bulkCancelExecutions,
  };

  return (
    <ExecutionContext.Provider value={value}>
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecutions() {
  const context = useContext(ExecutionContext);
  if (context === undefined) {
    throw new Error('useExecutions must be used within an ExecutionProvider');
  }
  return context;
}
