import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignStats,
  CampaignGuestFilter,
} from '@/app/types/campaign';
import type { Guest } from '@/app/types/guest';

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

interface CampaignContextType {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;

  fetchCampaigns: (projectId: string) => Promise<void>;
  getCampaignById: (id: string) => Promise<Campaign | null>;
  createCampaign: (input: CreateCampaignInput, projectId: string) => Promise<Campaign>;
  updateCampaign: (id: string, updates: UpdateCampaignInput) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;

  startCampaign: (id: string) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  resumeCampaign: (id: string) => Promise<void>;
  cancelCampaign: (id: string) => Promise<void>;

  previewGuestFilter: (projectId: string, filter: CampaignGuestFilter) => Promise<Guest[]>;
  getCampaignStats: (id: string) => Promise<CampaignStats | null>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278`;

  // Fetch campaigns from backend
  const fetchCampaigns = async (projectId: string) => {
    if (!user || !accessToken) {
      setCampaigns([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('projectId', projectId);

      const response = await fetch(`${baseUrl}/campaigns?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }

      setCampaigns(data.campaigns || []);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.message || 'Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Get single campaign by ID
  const getCampaignById = async (id: string): Promise<Campaign | null> => {
    if (!user || !accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${baseUrl}/campaigns/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaign');
      }

      return data.campaign;
    } catch (err: any) {
      console.error('Error fetching campaign:', err);
      setError(err.message || 'Failed to fetch campaign');
      return null;
    }
  };

  // Create new campaign
  const createCampaign = async (input: CreateCampaignInput, projectId: string): Promise<Campaign> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...input, projectId }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }
      const newCampaign = data.campaign;

      // Update local state
      setCampaigns(prev => [newCampaign, ...prev]);

      return newCampaign;
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign');
      throw err;
    }
  };

  // Update campaign
  const updateCampaign = async (id: string, updates: UpdateCampaignInput): Promise<Campaign> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update campaign');
      }
      const updatedCampaign = data.campaign;

      // Update local state
      setCampaigns(prev =>
        prev.map(c => (c.id === id ? updatedCampaign : c))
      );

      return updatedCampaign;
    } catch (err: any) {
      console.error('Error updating campaign:', err);
      setError(err.message || 'Failed to update campaign');
      throw err;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id: string): Promise<void> => {
    if (!user || !accessToken || user.role !== 'admin') {
      throw new Error('Only admins can delete campaigns');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete campaign');
      }

      // Update local state
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      setError(err.message || 'Failed to delete campaign');
      throw err;
    }
  };

  // Start campaign
  const startCampaign = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start campaign');
      }

      // Refresh campaign data
      const updatedCampaign = await getCampaignById(id);
      if (updatedCampaign) {
        setCampaigns(prev =>
          prev.map(c => (c.id === id ? updatedCampaign : c))
        );
      }
    } catch (err: any) {
      console.error('Error starting campaign:', err);
      setError(err.message || 'Failed to start campaign');
      throw err;
    }
  };

  // Pause campaign
  const pauseCampaign = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${id}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to pause campaign');
      }

      // Refresh campaign data
      const updatedCampaign = await getCampaignById(id);
      if (updatedCampaign) {
        setCampaigns(prev =>
          prev.map(c => (c.id === id ? updatedCampaign : c))
        );
      }
    } catch (err: any) {
      console.error('Error pausing campaign:', err);
      setError(err.message || 'Failed to pause campaign');
      throw err;
    }
  };

  // Resume campaign
  const resumeCampaign = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${id}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume campaign');
      }

      // Refresh campaign data
      const updatedCampaign = await getCampaignById(id);
      if (updatedCampaign) {
        setCampaigns(prev =>
          prev.map(c => (c.id === id ? updatedCampaign : c))
        );
      }
    } catch (err: any) {
      console.error('Error resuming campaign:', err);
      setError(err.message || 'Failed to resume campaign');
      throw err;
    }
  };

  // Cancel campaign
  const cancelCampaign = async (id: string): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel campaign');
      }

      // Refresh campaign data
      const updatedCampaign = await getCampaignById(id);
      if (updatedCampaign) {
        setCampaigns(prev =>
          prev.map(c => (c.id === id ? updatedCampaign : c))
        );
      }
    } catch (err: any) {
      console.error('Error cancelling campaign:', err);
      setError(err.message || 'Failed to cancel campaign');
      throw err;
    }
  };

  // Preview guest filter
  const previewGuestFilter = async (
    projectId: string,
    filter: CampaignGuestFilter
  ): Promise<Guest[]> => {
    if (!user || !accessToken) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`${baseUrl}/campaigns/preview-guests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, guestFilter: filter }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview guests');
      }
      return data.guests || [];
    } catch (err: any) {
      console.error('Error previewing guests:', err);
      setError(err.message || 'Failed to preview guests');
      return [];
    }
  };

  // Get campaign stats
  const getCampaignStats = async (id: string): Promise<CampaignStats | null> => {
    const campaign = await getCampaignById(id);
    return campaign?.stats || null;
  };

  const value: CampaignContextType = {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    previewGuestFilter,
    getCampaignStats,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}
