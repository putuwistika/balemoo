import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { publicAnonKey } from '/utils/supabase/info';
import type {
  Guest,
  CreateGuestInput,
  UpdateGuestInput,
  GuestStats,
  GuestFilterOptions,
  GuestSortOptions,
} from '../types/guest';

const API_BASE = 'https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278';

interface GuestContextType {
  guests: Guest[];
  loading: boolean;
  error: string | null;
  stats: GuestStats | null;
  
  // CRUD operations
  fetchGuests: () => Promise<void>;
  fetchGuestStats: () => Promise<void>;
  createGuest: (input: CreateGuestInput) => Promise<Guest>;
  updateGuest: (id: string, updates: UpdateGuestInput) => Promise<Guest>;
  deleteGuest: (id: string) => Promise<void>;
  bulkImportGuests: (guests: CreateGuestInput[]) => Promise<{
    success: Guest[];
    failed: Array<{ input: CreateGuestInput; error: string }>;
  }>;
  checkInGuest: (id: string) => Promise<Guest>;
  seedSampleGuests: (clearFirst?: boolean) => Promise<Guest[]>;
  
  // Filtering and sorting
  filteredGuests: Guest[];
  setFilters: (filters: GuestFilterOptions) => void;
  setSortOptions: (sort: GuestSortOptions) => void;
  filters: GuestFilterOptions;
  sortOptions: GuestSortOptions;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const useGuests = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuests must be used within a GuestProvider');
  }
  return context;
};

interface GuestProviderProps {
  children: ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {
  const { user, accessToken } = useAuth();
  const { selectedProject } = useProject();
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GuestStats | null>(null);
  
  const [filters, setFilters] = useState<GuestFilterOptions>({
    search: '',
    category: 'all',
    rsvp_status: 'all',
    invitation_type: 'all',
  });
  
  const [sortOptions, setSortOptions] = useState<GuestSortOptions>({
    field: 'created_at',
    direction: 'desc',
  });

  // Fetch guests from API
  const fetchGuests = async () => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      setGuests([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE}/guests?projectId=${selectedProject.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch guests');
      }

      const data = await response.json();
      setGuests(data.guests || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch guests';
      setError(message);
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch guest statistics
  const fetchGuestStats = async () => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      setStats(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/guests/stats?projectId=${selectedProject.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch guest statistics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching guest stats:', err);
    }
  };

  // Create new guest
  const createGuest = async (input: CreateGuestInput): Promise<Guest> => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
        ...input,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create guest');
    }

    const data = await response.json();
    const newGuest = data.guest;
    
    setGuests((prev) => [...prev, newGuest]);
    await fetchGuestStats(); // Refresh stats
    
    return newGuest;
  };

  // Update guest
  const updateGuest = async (id: string, updates: UpdateGuestInput): Promise<Guest> => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
        ...updates,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update guest');
    }

    const data = await response.json();
    const updatedGuest = data.guest;
    
    setGuests((prev) => prev.map((g) => (g.id === id ? updatedGuest : g)));
    await fetchGuestStats(); // Refresh stats
    
    return updatedGuest;
  };

  // Delete guest
  const deleteGuest = async (id: string): Promise<void> => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(
      `${API_BASE}/guests/${id}?projectId=${selectedProject.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete guest');
    }

    setGuests((prev) => prev.filter((g) => g.id !== id));
    await fetchGuestStats(); // Refresh stats
  };

  // Bulk import guests
  const bulkImportGuests = async (
    guestInputs: CreateGuestInput[]
  ): Promise<{ success: Guest[]; failed: Array<{ input: CreateGuestInput; error: string }> }> => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${API_BASE}/guests/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
        guests: guestInputs,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import guests');
    }

    const data = await response.json();
    
    // Add successful imports to state
    if (data.success && data.success.length > 0) {
      setGuests((prev) => [...prev, ...data.success]);
      await fetchGuestStats(); // Refresh stats
    }
    
    return {
      success: data.success || [],
      failed: data.failed || [],
    };
  };

  // Check-in guest
  const checkInGuest = async (id: string): Promise<Guest> => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${API_BASE}/guests/${id}/checkin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check in guest');
    }

    const data = await response.json();
    const checkedInGuest = data.guest;
    
    setGuests((prev) => prev.map((g) => (g.id === id ? checkedInGuest : g)));
    await fetchGuestStats(); // Refresh stats
    
    return checkedInGuest;
  };

  // Seed sample guests for testing/demo
  const seedSampleGuests = async (clearFirst: boolean = false): Promise<Guest[]> => {
    if (!user || user.role !== 'admin' || !selectedProject || !accessToken) {
      throw new Error('Unauthorized');
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE}/guests/seed?projectId=${selectedProject.id}${clearFirst ? '&clear=true' : ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to seed guests');
      }

      const data = await response.json();
      const seededGuests = data.guests || [];
      
      // Refresh the guests list
      await fetchGuests();
      await fetchGuestStats();
      
      return seededGuests;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to seed guests';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting to guests
  const filteredGuests = React.useMemo(() => {
    let result = [...guests];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchLower) ||
          g.phone.includes(searchLower) ||
          g.email?.toLowerCase().includes(searchLower) ||
          g.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((g) => g.category === filters.category);
    }

    // Apply RSVP status filter
    if (filters.rsvp_status && filters.rsvp_status !== 'all') {
      result = result.filter((g) => g.rsvp_status === filters.rsvp_status);
    }

    // Apply invitation type filter
    if (filters.invitation_type && filters.invitation_type !== 'all') {
      result = result.filter((g) => g.invitation_type === filters.invitation_type);
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((g) =>
        filters.tags!.some((tag) => g.tags.includes(tag))
      );
    }

    // Apply plus one filter
    if (filters.has_plus_one !== undefined) {
      result = result.filter((g) => g.plus_one === filters.has_plus_one);
    }

    // Apply checked in filter
    if (filters.checked_in !== undefined) {
      result = result.filter((g) =>
        filters.checked_in ? !!g.checked_in_at : !g.checked_in_at
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'rsvp_at':
          aValue = a.rsvp_at ? new Date(a.rsvp_at).getTime() : 0;
          bValue = b.rsvp_at ? new Date(b.rsvp_at).getTime() : 0;
          break;
        case 'table_number':
          aValue = a.table_number || '';
          bValue = b.table_number || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [guests, filters, sortOptions]);

  // Auto-fetch guests when user is admin and project is selected
  useEffect(() => {
    if (user && user.role === 'admin' && selectedProject && accessToken) {
      fetchGuests();
      fetchGuestStats();
    } else {
      setGuests([]);
      setStats(null);
    }
  }, [user, selectedProject, accessToken]);

  const value: GuestContextType = {
    guests,
    loading,
    error,
    stats,
    fetchGuests,
    fetchGuestStats,
    createGuest,
    updateGuest,
    deleteGuest,
    bulkImportGuests,
    checkInGuest,
    seedSampleGuests,
    filteredGuests,
    setFilters,
    setSortOptions,
    filters,
    sortOptions,
  };

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
};
