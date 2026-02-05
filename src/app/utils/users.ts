// Demo users database
export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
}

// Map demo user emails to their actual Supabase IDs
// These IDs should be loaded from localStorage after login
function getRealUserId(email: string): string {
  // Try to get real IDs from localStorage first
  const demoUserIds = JSON.parse(localStorage.getItem('balemoo_demo_user_ids') || '{}');
  
  // Map email to role
  const emailToRole: Record<string, string> = {
    'demo-admin@balemoo.com': 'admin',
    'demo-staff@balemoo.com': 'staff',
    'staff-a@balemoo.com': 'staff',
    'staff-b@balemoo.com': 'staff',
    'demo-user@balemoo.com': 'user',
    'client-a@balemoo.com': 'user',
  };
  
  const role = emailToRole[email];
  
  // If we have a real ID for this role, use it
  // Note: This is a simplified approach. In production, you'd want a proper user management system
  if (role && demoUserIds[role]) {
    return demoUserIds[role];
  }
  
  // Fallback to dummy ID (for UI display purposes)
  return `user_${email.split('@')[0].replace(/[.-]/g, '_')}`;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: getRealUserId('demo-admin@balemoo.com'),
    email: 'demo-admin@balemoo.com',
    name: 'Admin Balemoo',
    role: 'admin',
  },
  {
    id: getRealUserId('demo-staff@balemoo.com'),
    email: 'demo-staff@balemoo.com',
    name: 'Staff Balemoo',
    role: 'staff',
  },
  {
    id: getRealUserId('staff-a@balemoo.com'),
    email: 'staff-a@balemoo.com',
    name: 'Kadek Arya',
    role: 'staff',
  },
  {
    id: getRealUserId('staff-b@balemoo.com'),
    email: 'staff-b@balemoo.com',
    name: 'Made Sari',
    role: 'staff',
  },
  {
    id: getRealUserId('demo-user@balemoo.com'),
    email: 'demo-user@balemoo.com',
    name: 'User Balemoo',
    role: 'user',
  },
  {
    id: getRealUserId('client-a@balemoo.com'),
    email: 'client-a@balemoo.com',
    name: 'Wayan Santika',
    role: 'user',
  },
];

export function getUserById(userId: string): DemoUser | undefined {
  return DEMO_USERS.find(u => u.id === userId);
}

export function getUsersByRole(role: 'admin' | 'staff' | 'user'): DemoUser[] {
  return DEMO_USERS.filter(u => u.role === role);
}

export function getAllUsers(): DemoUser[] {
  return DEMO_USERS;
}
