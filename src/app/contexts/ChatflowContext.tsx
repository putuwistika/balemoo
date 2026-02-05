import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';
import { Chatflow, CreateChatflowInput, UpdateChatflowInput } from '@/app/types/chatflow';

interface ChatflowBrowseItem {
  id: string;
  name: string;
  description: string;
  status: string;
  nodesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatflowContextType {
  chatflows: Chatflow[];
  loading: boolean;
  error: string | null;
  fetchChatflows: (filters?: { status?: string; projectId?: string }) => Promise<void>;
  getChatflowById: (id: string, projectId: string) => Promise<Chatflow | null>;
  createChatflow: (input: CreateChatflowInput) => Promise<Chatflow>;
  updateChatflow: (id: string, updates: UpdateChatflowInput, projectId: string) => Promise<Chatflow>;
  deleteChatflow: (id: string, projectId: string) => Promise<void>;
  cloneChatflow: (id: string, newName: string, targetProjectId: string, sourceProjectId?: string) => Promise<Chatflow>;
  testChatflow: (id: string, testData: any, projectId: string) => Promise<any>;
  browseChatflows: () => Promise<Record<string, ChatflowBrowseItem[]>>;
}

const ChatflowContext = createContext<ChatflowContextType | undefined>(undefined);

export function ChatflowProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [chatflows, setChatflows] = useState<Chatflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278`;

  // Fetch chatflows from backend
  const fetchChatflows = async (filters?: { status?: string; projectId?: string }) => {
    if (!user || !accessToken || user.role !== 'admin') {
      setChatflows([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.projectId) params.append('projectId', filters.projectId);

      const response = await fetch(`${baseUrl}/chatflows?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch chatflows');
      }

      const data = await response.json();
      setChatflows(data.chatflows || []);
    } catch (err: any) {
      console.error('Error fetching chatflows:', err);
      setError(err.message || 'Failed to fetch chatflows');
      setChatflows([]);
    } finally {
      setLoading(false);
    }
  };

  // Get single chatflow by ID
  const getChatflowById = async (id: string, projectId: string): Promise<Chatflow | null> => {
    if (!user || !accessToken || user.role !== 'admin') {
      return null;
    }

    if (!projectId) {
      console.error('❌ getChatflowById: projectId is required');
      return null;
    }

    console.log('🔍 getChatflowById called for ID:', id, 'projectId:', projectId);

    try {
      const response = await fetch(`${baseUrl}/chatflows/${id}?projectId=${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 getChatflowById response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ getChatflowById error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch chatflow');
      }

      const data = await response.json();
      console.log('✅ getChatflowById raw response:', data);
      console.log('✅ getChatflowById chatflow.nodes:', data.chatflow?.nodes);
      
      if (data.chatflow?.nodes) {
        console.log('✅ Nodes in response:');
        data.chatflow.nodes.forEach((node: any, idx: number) => {
          console.log(`  Node ${idx + 1}:`, {
            id: node.id,
            type: node.type,
            hasConfig: !!node.data?.config,
            config: node.data?.config
          });
        });
      }
      
      return data.chatflow;
    } catch (err: any) {
      console.error('❌ Error fetching chatflow:', err);
      return null;
    }
  };

  // Create new chatflow
  const createChatflow = async (input: CreateChatflowInput): Promise<Chatflow> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/chatflows`, {
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
        throw new Error(errorData.error || 'Failed to create chatflow');
      }

      const data = await response.json();
      const newChatflow = data.chatflow;

      // Add to local state
      setChatflows((prev) => [newChatflow, ...prev]);

      return newChatflow;
    } catch (err: any) {
      console.error('Error creating chatflow:', err);
      throw err;
    }
  };

  // Update chatflow
  const updateChatflow = async (id: string, updates: UpdateChatflowInput, projectId: string): Promise<Chatflow> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log('🌐 ChatflowContext.updateChatflow called:', {
      id,
      projectId,
      updatesKeys: Object.keys(updates),
      nodesCount: updates.nodes?.length,
      edgesCount: updates.edges?.length,
      fullUpdates: updates
    });

    try {
      // Include projectId in request body
      const requestBody = JSON.stringify({ ...updates, projectId });
      console.log('📤 Request body length:', requestBody.length, 'bytes');
      console.log('📤 Request body:', requestBody);

      const response = await fetch(`${baseUrl}/chatflows/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error response:', errorData);
        throw new Error(errorData.error || 'Failed to update chatflow');
      }

      const data = await response.json();
      const updatedChatflow = data.chatflow;
      
      console.log('✅ Updated chatflow from backend:', updatedChatflow);
      console.log('✅ Saved nodes count:', updatedChatflow.nodes?.length);
      console.log('✅ Saved nodes with config:', updatedChatflow.nodes?.filter((n: any) => n.data.config).length);

      // Update local state
      setChatflows((prev) =>
        prev.map((cf) => (cf.id === id ? updatedChatflow : cf))
      );

      return updatedChatflow;
    } catch (err: any) {
      console.error('❌ Error updating chatflow:', err);
      throw err;
    }
  };

  // Delete chatflow
  const deleteChatflow = async (id: string, projectId: string): Promise<void> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    try {
      const response = await fetch(`${baseUrl}/chatflows/${id}?projectId=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete chatflow');
      }

      // Remove from local state
      setChatflows((prev) => prev.filter((cf) => cf.id !== id));
    } catch (err: any) {
      console.error('Error deleting chatflow:', err);
      throw err;
    }
  };

  // Clone chatflow (supports cross-project cloning)
  const cloneChatflow = async (id: string, newName: string, targetProjectId: string, sourceProjectId?: string): Promise<Chatflow> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    if (!targetProjectId) {
      throw new Error('Target Project ID is required');
    }

    try {
      const response = await fetch(`${baseUrl}/chatflows/${id}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newName, 
          targetProjectId,
          sourceProjectId: sourceProjectId || targetProjectId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clone chatflow');
      }

      const data = await response.json();
      const clonedChatflow = data.chatflow;

      // Add to local state
      setChatflows((prev) => [clonedChatflow, ...prev]);

      return clonedChatflow;
    } catch (err: any) {
      console.error('Error cloning chatflow:', err);
      throw err;
    }
  };

  // Test/Simulate chatflow
  const testChatflow = async (id: string, testData: any, projectId: string): Promise<any> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    try {
      const response = await fetch(`${baseUrl}/chatflows/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...testData, projectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test chatflow');
      }

      const data = await response.json();
      return data.testResults;
    } catch (err: any) {
      console.error('Error testing chatflow:', err);
      throw err;
    }
  };

  // Browse all chatflows grouped by project (for cross-project cloning)
  const browseChatflows = async (): Promise<Record<string, ChatflowBrowseItem[]>> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`${baseUrl}/chatflows/browse`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to browse chatflows');
      }

      const data = await response.json();
      return data.chatflowsByProject || {};
    } catch (err: any) {
      console.error('Error browsing chatflows:', err);
      throw err;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchChatflows();
    }
  }, [user]);

  const value: ChatflowContextType = {
    chatflows,
    loading,
    error,
    fetchChatflows,
    getChatflowById,
    createChatflow,
    updateChatflow,
    deleteChatflow,
    cloneChatflow,
    testChatflow,
    browseChatflows,
  };

  return <ChatflowContext.Provider value={value}>{children}</ChatflowContext.Provider>;
}

export function useChatflows() {
  const context = useContext(ChatflowContext);
  if (context === undefined) {
    throw new Error('useChatflows must be used within a ChatflowProvider');
  }
  return context;
}
