import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Create supabase client directly here to avoid circular imports
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>; // Alias for login
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // Alias for logout
  refreshSession: () => Promise<string | null>; // Add refresh function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    checkUser();
    
    // Set up auth state listener to refresh token automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        console.log('Token refreshed or user signed in, updating token');
        if (session?.access_token) {
          await fetchUserRole(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        await fetchUserRole(session.access_token);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (token: string) => {
    try {
      console.log('=== FRONTEND: Fetching user role ===');
      console.log('Token length:', token?.length);
      console.log('Token preview:', token?.substring(0, 20) + '...');
      
      // First, try to get user data directly from Supabase client
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser(token);
      
      if (supabaseUser && !userError) {
        console.log('=== FRONTEND: Got user from Supabase directly ===');
        console.log('User ID:', supabaseUser.id);
        console.log('User email:', supabaseUser.email);
        console.log('User metadata:', supabaseUser.user_metadata);
        console.log('Role from metadata:', supabaseUser.user_metadata?.role);
        
        const userRole = supabaseUser.user_metadata?.role || 'user';
        
        // Save user ID to localStorage for demo project assignment
        const demoUserIds = JSON.parse(localStorage.getItem('balemoo_demo_user_ids') || '{}');
        demoUserIds[userRole] = supabaseUser.id;
        localStorage.setItem('balemoo_demo_user_ids', JSON.stringify(demoUserIds));
        
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: userRole as 'admin' | 'staff' | 'user',
          name: supabaseUser.user_metadata?.name,
        });
        setAccessToken(token);
        return; // Success! No need to call server
      }
      
      // Fallback: call server endpoint if direct method fails
      console.log('Falling back to server endpoint...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-deeab278/user/role`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('=== FRONTEND: User data received from server ===');
        console.log('Full response:', userData);
        console.log('Role:', userData.role);
        console.log('Email:', userData.email);
        console.log('Name:', userData.name);
        
        // Save user ID to localStorage for demo project assignment
        const demoUserIds = JSON.parse(localStorage.getItem('balemoo_demo_user_ids') || '{}');
        demoUserIds[userData.role] = userData.userId;
        localStorage.setItem('balemoo_demo_user_ids', JSON.stringify(demoUserIds));
        
        setUser({
          id: userData.userId,
          email: userData.email,
          role: userData.role,
          name: userData.name,
        });
        setAccessToken(token);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch user role, status:', response.status);
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.access_token) {
        await fetchUserRole(data.session.access_token);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  // Alias for login (for backward compatibility)
  const signIn = login;

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      if (data.session?.access_token) {
        await fetchUserRole(data.session.access_token);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Alias for logout (for backward compatibility)
  const signOut = logout;

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session?.access_token) {
        await fetchUserRole(data.session.access_token);
        return data.session.access_token;
      }
    } catch (error: any) {
      console.error('Refresh session error:', error);
      throw new Error(error.message || 'Failed to refresh session');
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, signIn, signUp, logout, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}