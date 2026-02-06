import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as templateHelpers from "./template_helpers.ts";
import * as chatflowHelpers from "./chatflow_helpers.ts";
import * as campaignHelpers from "./campaign_helpers.ts";
import * as executionHelpers from "./execution_helpers.ts";
import * as reminderHelpers from "./reminder_helpers.ts";
import * as sessionHelpers from "./session_helpers.ts";
import * as guestHelpers from "./guest_helpers.ts";
import * as waFlowHelpers from "./whatsapp_flow_helpers.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-User-Token", 
      "apikey",
      "x-client-info",
      "x-supabase-auth"
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 86400,
    credentials: false,
  }),
);

// Explicit OPTIONS handler for all routes
app.options("*", (c) => {
  return c.text("", 204);
});

// Health check endpoint
app.get("/make-server-deeab278/health", (c) => {
  return c.json({ status: "ok" });
});

// Quick debug endpoint (no auth) - for testing KV store
app.get("/make-server-deeab278/debug/kv-quick", async (c) => {
  try {
    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json({ error: 'projectId required in query' }, 400);
    }
    
    // Get guests list
    const guestsListKey = `guests:list:${projectId}`;
    const guestIds = await kv.get(guestsListKey) || [];
    
    // Get actual guests
    const guests = [];
    for (const guestId of guestIds) {
      const guestKey = `guest:${projectId}:${guestId}`;
      const guest = await kv.get(guestKey);
      guests.push({
        guestId,
        guestKey,
        found: !!guest,
        name: guest?.name,
      });
    }
    
    // Also try getByPrefix
    const guestsByPrefix = await kv.getByPrefix(`guest:${projectId}:`);
    
    return c.json({ 
      projectId,
      guestsListKey,
      guestIdsInList: guestIds,
      guestIdsCount: guestIds.length,
      guestsLookup: guests,
      guestsByPrefixCount: guestsByPrefix.length,
      guestsByPrefix: guestsByPrefix.slice(0, 3).map((g: any) => ({ id: g.id, name: g.name })),
    });
  } catch (error) {
    console.error('Error in debug/kv-quick:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-deeab278/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    console.log('=== SIGNUP REQUEST ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Role received:', role);
    console.log('Role type:', typeof role);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const userRole = role || 'user';
    console.log('Final role to be saved:', userRole);

    // Create user with Supabase Auth
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: name,
        role: userRole
      },
      email_confirm: true
    });

    if (error) {
      console.log('Sign up error while creating user:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully');
    console.log('User metadata:', data.user?.user_metadata);

    return c.json({ 
      user: data.user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.log('Sign up error in main signup flow:', error);
    return c.json({ error: 'Sign up failed' }, 500);
  }
});

// Get user role endpoint (protected)
app.get("/make-server-deeab278/user/role", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    console.log('=== FETCHING USER ROLE ===');
    console.log('Access token received:', accessToken ? 'Yes' : 'No');
    console.log('Token length:', accessToken?.length);
    console.log('Token preview:', accessToken?.substring(0, 20) + '...');
    
    if (!accessToken) {
      console.log('No access token provided');
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    // Use ANON_KEY to validate user tokens from the frontend
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon key present:', supabaseAnonKey ? 'Yes' : 'No');
    
    const supabase = createClient(
      supabaseUrl!,
      supabaseAnonKey!,
    );

    console.log('Attempting to get user with token...');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while fetching user role:', error);
      console.log('Error details:', error?.message, error?.status);
      return c.json({ error: 'Unauthorized', details: error?.message }, 401);
    }

    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    console.log('User metadata:', user.user_metadata);
    console.log('Role from metadata:', user.user_metadata?.role);

    const userRole = user.user_metadata?.role || 'user';
    console.log('Final role returned:', userRole);

    return c.json({ 
      userId: user.id,
      email: user.email,
      role: userRole,
      name: user.user_metadata?.name
    });
  } catch (error) {
    console.log('Error fetching user role:', error);
    return c.json({ error: 'Failed to fetch user role' }, 500);
  }
});

// Get all users endpoint (admin only) - for team assignment
app.get("/make-server-deeab278/users", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Only admin can list users
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can list users' }, 403);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    // List all users
    const { data, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return c.json({ error: 'Failed to list users' }, 500);
    }
    
    // Format user data
    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.email?.split('@')[0],
      role: u.user_metadata?.role || 'user',
    }));
    
    return c.json({ users });
  } catch (error) {
    console.error('Error in list users endpoint:', error);
    return c.json({ error: 'Failed to list users' }, 500);
  }
});

// Initialize demo users endpoint (for quick setup)
app.post("/make-server-deeab278/init-demo-users", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const demoUsers = [
      { email: 'demo-admin@balemoo.com', password: 'demo12345', name: 'Demo Admin', role: 'admin' },
      { email: 'demo-staff@balemoo.com', password: 'demo12345', name: 'Demo Staff', role: 'staff' },
      { email: 'demo-user@balemoo.com', password: 'demo12345', name: 'Demo User', role: 'user' },
    ];

    const results = [];

    for (const user of demoUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users?.some(u => u.email === user.email);

      if (!userExists) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { name: user.name, role: user.role },
          email_confirm: true
        });

        if (error) {
          console.log(`Error creating demo user ${user.email}:`, error);
          results.push({ email: user.email, status: 'error', message: error.message });
        } else {
          results.push({ email: user.email, status: 'created' });
        }
      } else {
        results.push({ email: user.email, status: 'already_exists' });
      }
    }

    return c.json({ 
      message: 'Demo users initialization complete',
      results 
    });
  } catch (error) {
    console.log('Error initializing demo users:', error);
    return c.json({ error: 'Failed to initialize demo users' }, 500);
  }
});

// ===== HELPER FUNCTIONS =====

// Helper function to extract user token from headers
// Supports both Authorization header and X-User-Token custom header
// X-User-Token is used to bypass Supabase Edge Function's Kong JWT verification
function extractAccessToken(c: any): string | null {
  // Try Authorization header first
  const authHeader = c.req.header('Authorization');
  let accessToken = authHeader?.split(' ')[1];
  
  // If token looks like anon key (starts with specific prefix), check X-User-Token
  const anonKeyPrefix = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cWJtbG5hdnp0em9iZmFpcWFvIiwicm9sZSI6ImFub24i';
  if (!accessToken || accessToken.startsWith(anonKeyPrefix)) {
    const customToken = c.req.header('X-User-Token');
    if (customToken) {
      accessToken = customToken;
    }
  }
  
  return accessToken || null;
}

async function verifyUser(accessToken: string) {
  try {
    console.log('=== VERIFY USER START ===');
    console.log('Token length:', accessToken?.length);
    console.log('Token preview:', accessToken?.substring(0, 30) + '...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon key present:', supabaseAnonKey ? 'Yes' : 'No');
    console.log('Anon key preview:', supabaseAnonKey?.substring(0, 30) + '...');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return { user: null, error: 'Server configuration error' };
    }
    
    // Create Supabase client with Authorization header to use the user's token
    // This is the recommended approach for Edge Functions
    const supabase = createClient(
      supabaseUrl, 
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );
    
    console.log('Calling supabase.auth.getUser()...');
    // When we pass the Authorization header above, getUser() will use that token
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase auth.getUser() error:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error name:', error.name);
      return { user: null, error: error.message || 'Unauthorized' };
    }
    
    if (!user) {
      console.error('No user returned from Supabase');
      return { user: null, error: 'User not found' };
    }
    
    console.log('User verified successfully!');
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    console.log('User role:', user.user_metadata?.role);
    console.log('=== VERIFY USER END ===');
    
    return { 
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        name: user.user_metadata?.name
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Exception in verifyUser:', error);
    console.error('Exception details:', String(error));
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack');
    return { user: null, error: String(error) };
  }
}

// ===== PROJECT & AGENDA ENDPOINTS =====

// Get all projects (with role-based filtering)
app.get("/make-server-deeab278/projects", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Get all projects from KV store
    const allProjects = await kv.getByPrefix('project:');
    
    // Filter out soft-deleted projects
    const activeProjects = allProjects.filter(p => !p.isDeleted);
    
    // Filter based on role
    let projects = activeProjects;
    if (user.role === 'user') {
      // Users see projects where they are client OR in assignedUsers (legacy)
      projects = activeProjects.filter(p => {
        const isActive = p.isActive !== false; // Default to active if undefined
        const inTeam = p.team?.client === user.id;
        const inAssignedUsers = p.assignedUsers && p.assignedUsers.includes(user.id);
        return isActive && (inTeam || inAssignedUsers);
      });
    } else if (user.role === 'staff') {
      // Staff see active projects where they are in team.staff OR all active (legacy)
      projects = activeProjects.filter(p => {
        const isActive = p.isActive !== false;
        const inTeam = p.team?.staff?.includes(user.id);
        const hasLegacyAccess = !p.team; // If no team structure, allow access (legacy)
        return isActive && (inTeam || hasLegacyAccess);
      });
    } else if (user.role === 'admin') {
      // Admin see all active projects (including inactive ones)
      projects = activeProjects;
    }
    
    // Sort by date (newest first)
    projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ projects, userRole: user.role, userId: user.id });
  } catch (error) {
    console.log('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// Get single project by ID
app.get("/make-server-deeab278/projects/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    const projectId = c.req.param('id');
    const project = await kv.get(projectId);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Check if project is soft deleted
    if (project.isDeleted) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Check access permissions
    if (user.role === 'staff') {
      const isActive = project.isActive !== false;
      const inTeam = project.team?.staff?.includes(user.id);
      const hasLegacyAccess = !project.team; // Legacy behavior
      
      if (!isActive || (!inTeam && !hasLegacyAccess)) {
        return c.json({ error: 'You do not have access to this project' }, 403);
      }
    } else if (user.role === 'user') {
      const isActive = project.isActive !== false;
      const inTeam = project.team?.client === user.id;
      const inAssignedUsers = project.assignedUsers && project.assignedUsers.includes(user.id);
      
      if (!isActive || (!inTeam && !inAssignedUsers)) {
        return c.json({ error: 'You do not have access to this project' }, 403);
      }
    }
    // Admin always has access (no check needed)
    
    return c.json({ project });
  } catch (error) {
    console.log('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// Create new project (admin only)
app.post("/make-server-deeab278/projects", async (c) => {
  try {
    console.log('=== CREATE PROJECT REQUEST ===');
    const accessToken = extractAccessToken(c);
    
    console.log('Access token present:', !!accessToken);
    
    if (!accessToken) {
      console.log('No access token provided');
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    console.log('User verified:', user?.email, 'Role:', user?.role);
    
    if (error || !user) {
      console.log('Verification error:', error);
      return c.json({ error }, 401);
    }
    
    // Only admin can create projects
    if (user.role !== 'admin') {
      console.log('User is not admin, role:', user.role);
      return c.json({ error: 'Only admins can create projects' }, 403);
    }
    
    const body = await c.req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { name, startDate, endDate, agendas, assignedUsers } = body;
    
    if (!name || !startDate || !endDate || !agendas || agendas.length === 0) {
      console.log('Missing required fields:', { name, startDate, endDate, agendasCount: agendas?.length });
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Create project ID
    const projectId = `project:${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('Creating project with ID:', projectId);
    
    const project = {
      id: projectId,
      name,
      startDate,
      endDate,
      agendas,
      assignedUsers: assignedUsers || [],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false, // Soft delete flag
    };
    
    console.log('Project object:', JSON.stringify(project, null, 2));
    
    try {
      await kv.set(projectId, project);
      console.log('Project saved to KV store successfully');
    } catch (kvError) {
      console.error('KV store error:', kvError);
      return c.json({ error: 'Failed to save project to database', details: String(kvError) }, 500);
    }
    
    console.log('Project created successfully:', projectId);
    return c.json({ project, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    console.error('Error details:', String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to create project', details: String(error) }, 500);
  }
});

// Update project (admin only)
app.put("/make-server-deeab278/projects/:id", async (c) => {
  try {
    console.log('=== UPDATE PROJECT REQUEST ===');
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Only admin can update projects
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can update projects' }, 403);
    }
    
    const projectId = c.req.param('id');
    const existingProject = await kv.get(projectId);
    
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    if (existingProject.isDeleted) {
      return c.json({ error: 'Cannot update deleted project' }, 400);
    }
    
    const body = await c.req.json();
    const { name, startDate, endDate, agendas, assignedUsers, team, isActive, features } = body;
    
    console.log('=== REQUEST BODY ===');
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('Team field:', team);
    console.log('Team type:', typeof team);
    console.log('isActive field:', isActive);
    
    // Light validation for team structure (if provided)
    if (team !== undefined) {
      if (typeof team !== 'object' || team === null) {
        return c.json({ error: 'Invalid team structure' }, 400);
      }
      if (team.staff !== undefined && !Array.isArray(team.staff)) {
        return c.json({ error: 'team.staff must be an array' }, 400);
      }
      if (team.manager !== undefined && typeof team.manager !== 'string') {
        return c.json({ error: 'team.manager must be a string' }, 400);
      }
      if (team.client !== undefined && typeof team.client !== 'string') {
        return c.json({ error: 'team.client must be a string' }, 400);
      }
    }
    
    // Light validation for isActive (if provided)
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return c.json({ error: 'isActive must be a boolean' }, 400);
    }
    
    // Support partial updates - only update fields that are provided
    const updatedProject = {
      ...existingProject,
      ...(name !== undefined && { name }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(agendas !== undefined && { agendas }),
      ...(assignedUsers !== undefined && { assignedUsers }),
      ...(team !== undefined && { team }),
      ...(isActive !== undefined && { isActive }),
      ...(features !== undefined && { features }),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(projectId, updatedProject);
    
    console.log('=== PROJECT UPDATED ===');
    console.log('Project ID:', projectId);
    console.log('Updated project team:', updatedProject.team);
    console.log('Updated project isActive:', updatedProject.isActive);
    console.log('Full updated project:', JSON.stringify(updatedProject, null, 2));
    
    return c.json({ project: updatedProject, message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ error: 'Failed to update project', details: String(error) }, 500);
  }
});

// Soft delete project (admin only)
app.delete("/make-server-deeab278/projects/:id", async (c) => {
  try {
    console.log('=== DELETE PROJECT REQUEST ===');
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Only admin can delete projects
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete projects' }, 403);
    }
    
    const projectId = c.req.param('id');
    const existingProject = await kv.get(projectId);
    
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    if (existingProject.isDeleted) {
      return c.json({ error: 'Project already deleted' }, 400);
    }
    
    // Soft delete: mark as deleted instead of removing
    const deletedProject = {
      ...existingProject,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: user.id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(projectId, deletedProject);
    
    console.log('Project soft deleted successfully:', projectId);
    return c.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project', details: String(error) }, 500);
  }
});

// Initialize demo projects (for testing)
app.post("/make-server-deeab278/init-demo-projects", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Get all existing demo projects
    const existingProjects = await kv.getByPrefix('project:demo_');
    
    // If demo projects already exist, return them
    if (existingProjects.length > 0) {
      return c.json({ 
        message: 'Demo projects already exist',
        count: existingProjects.length,
        projects: existingProjects
      });
    }
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const demoProjects = [
      {
        id: `project:demo_${Date.now()}_1`,
        name: 'Pernikahan Putu & Ayu',
        startDate: yesterday.toISOString().split('T')[0],
        endDate: tomorrow.toISOString().split('T')[0],
        agendas: [
          { id: 'agenda_1', name: 'Akad Nikah', date: yesterday.toISOString().split('T')[0], time: '10:00' },
          { id: 'agenda_2', name: 'Resepsi', date: now.toISOString().split('T')[0], time: '18:00' }
        ],
        assignedUsers: [user.id],
        createdBy: user.id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        isDeleted: false,
      },
      {
        id: `project:demo_${Date.now()}_2`,
        name: 'Tech Conference 2026',
        startDate: nextWeek.toISOString().split('T')[0],
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        agendas: [
          { id: 'agenda_3', name: 'Opening Keynote', date: nextWeek.toISOString().split('T')[0], time: '09:00' },
          { id: 'agenda_4', name: 'Workshop Sessions', date: nextWeek.toISOString().split('T')[0], time: '14:00' },
          { id: 'agenda_5', name: 'Closing Ceremony', date: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], time: '16:00' }
        ],
        assignedUsers: [user.id],
        createdBy: user.id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        isDeleted: false,
      },
      {
        id: `project:demo_${Date.now()}_3`,
        name: 'Corporate Gala Dinner',
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: lastMonth.toISOString().split('T')[0],
        agendas: [
          { id: 'agenda_6', name: 'Main Event', date: lastMonth.toISOString().split('T')[0], time: '19:00' }
        ],
        assignedUsers: [user.id],
        createdBy: user.id,
        createdAt: lastMonth.toISOString(),
        updatedAt: lastMonth.toISOString(),
        isDeleted: false,
      },
    ];
    
    // Create all demo projects
    for (const project of demoProjects) {
      await kv.set(project.id, project);
    }
    
    return c.json({ 
      message: 'Demo projects created successfully',
      count: demoProjects.length,
      projects: demoProjects
    });
  } catch (error) {
    console.log('Error creating demo projects:', error);
    return c.json({ error: 'Failed to create demo projects' }, 500);
  }
});

// ========================================
// TEMPLATE MANAGEMENT ENDPOINTS
// ========================================

// Get all templates (admin only)
app.get("/make-server-deeab278/templates", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Only admin can access templates
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access templates' }, 403);
    }
    
    const projectId = c.req.query('projectId');
    const status = c.req.query('status');
    
    let templates = [];
    
    if (status) {
      templates = await templateHelpers.getTemplatesByStatus(status);
    } else {
      templates = await templateHelpers.getAllTemplates();
    }
    
    // Filter by projectId if provided
    if (projectId) {
      templates = templates.filter((t: any) => t.projectId === projectId);
    }
    
    return c.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return c.json({ error: 'Failed to fetch templates' }, 500);
  }
});

// Get single template (admin only)
app.get("/make-server-deeab278/templates/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access templates' }, 403);
    }
    
    const templateId = c.req.param('id');
    const template = await templateHelpers.getTemplateById(templateId);
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    return c.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return c.json({ error: 'Failed to fetch template' }, 500);
  }
});

// Create new template (admin only)
app.post("/make-server-deeab278/templates", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can create templates' }, 403);
    }
    
    const body = await c.req.json();
    
    console.log('=== CREATE TEMPLATE REQUEST ===');
    console.log('Received body:', JSON.stringify(body, null, 2));
    
    // Validate template data
    const validation = templateHelpers.validateTemplate(body);
    console.log('Validation result:', validation);
    
    if (!validation.valid) {
      console.log('Validation errors:', validation.errors);
      return c.json({ error: 'Validation failed', errors: validation.errors }, 400);
    }
    
    // Extract variables from body text
    const variables = templateHelpers.extractVariables(body.content.body.text);
    
    // Create new template
    const template: templateHelpers.WhatsAppTemplate = {
      id: crypto.randomUUID(),
      name: body.name,
      category: body.category,
      language: body.language,
      status: 'DRAFT',
      content: body.content,
      variables,
      projectId: body.projectId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await templateHelpers.saveTemplate(template);
    
    console.log('✅ Template created:', template.id);
    return c.json({ template, message: 'Template created successfully' });
  } catch (error) {
    console.error('Error creating template:', error);
    return c.json({ error: 'Failed to create template' }, 500);
  }
});

// Update template (admin only)
app.put("/make-server-deeab278/templates/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can update templates' }, 403);
    }
    
    const templateId = c.req.param('id');
    const existingTemplate = await templateHelpers.getTemplateById(templateId);
    
    if (!existingTemplate) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    // Only allow updates if status is DRAFT or REJECTED
    if (existingTemplate.status !== 'DRAFT' && existingTemplate.status !== 'REJECTED') {
      return c.json({ 
        error: 'Cannot edit template in current status. Only DRAFT or REJECTED templates can be edited.' 
      }, 400);
    }
    
    const updates = await c.req.json();
    
    // Re-extract variables if body text changed
    let variables = existingTemplate.variables;
    if (updates.content?.body?.text) {
      variables = templateHelpers.extractVariables(updates.content.body.text);
    }
    
    const updatedTemplate: templateHelpers.WhatsAppTemplate = {
      ...existingTemplate,
      ...updates,
      variables,
      updatedAt: new Date().toISOString(),
    };
    
    // Validate updated template
    const validation = templateHelpers.validateTemplate(updatedTemplate);
    if (!validation.valid) {
      return c.json({ error: 'Validation failed', errors: validation.errors }, 400);
    }
    
    await templateHelpers.saveTemplate(updatedTemplate);
    
    console.log('✅ Template updated:', templateId);
    return c.json({ template: updatedTemplate, message: 'Template updated successfully' });
  } catch (error) {
    console.error('Error updating template:', error);
    return c.json({ error: 'Failed to update template' }, 500);
  }
});

// Delete template (admin only)
app.delete("/make-server-deeab278/templates/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete templates' }, 403);
    }
    
    const templateId = c.req.param('id');
    const existingTemplate = await templateHelpers.getTemplateById(templateId);
    
    if (!existingTemplate) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    // Only allow delete if status is DRAFT or REJECTED
    if (existingTemplate.status !== 'DRAFT' && existingTemplate.status !== 'REJECTED') {
      return c.json({ 
        error: 'Cannot delete template in current status. Only DRAFT or REJECTED templates can be deleted.' 
      }, 400);
    }
    
    await templateHelpers.deleteTemplate(templateId);
    
    console.log('✅ Template deleted:', templateId);
    return c.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return c.json({ error: 'Failed to delete template' }, 500);
  }
});

// Submit template to META (dummy simulation)
app.post("/make-server-deeab278/templates/:id/submit", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can submit templates' }, 403);
    }
    
    const templateId = c.req.param('id');
    const existingTemplate = await templateHelpers.getTemplateById(templateId);
    
    if (!existingTemplate) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    // Only allow submit if status is DRAFT
    if (existingTemplate.status !== 'DRAFT') {
      return c.json({ 
        error: 'Can only submit templates with DRAFT status' 
      }, 400);
    }
    
    // Validate before submission
    const validation = templateHelpers.validateTemplate(existingTemplate);
    if (!validation.valid) {
      return c.json({ 
        error: 'Template validation failed', 
        errors: validation.errors 
      }, 400);
    }
    
    // Update template to PENDING status
    const oldStatus = existingTemplate.status;
    const submittedTemplate: templateHelpers.WhatsAppTemplate = {
      ...existingTemplate,
      status: 'PENDING',
      metaTemplateId: templateHelpers.generateMetaTemplateId(),
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await templateHelpers.saveTemplate(submittedTemplate);
    await templateHelpers.updateTemplateStatus(templateId, oldStatus, 'PENDING');
    
    // Trigger auto-approval simulation (5 seconds delay)
    // Don't await - let it run in background
    templateHelpers.simulateMetaApproval(templateId);
    
    console.log('✅ Template submitted to META (simulated):', templateId);
    return c.json({ 
      template: submittedTemplate, 
      message: 'Template submitted successfully. Awaiting META approval.' 
    });
  } catch (error) {
    console.error('Error submitting template:', error);
    return c.json({ error: 'Failed to submit template' }, 500);
  }
});

// Simulate template rejection (for testing)
app.post("/make-server-deeab278/templates/:id/reject", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can reject templates' }, 403);
    }
    
    const templateId = c.req.param('id');
    const existingTemplate = await templateHelpers.getTemplateById(templateId);
    
    if (!existingTemplate) {
      return c.json({ error: 'Template not found' }, 404);
    }
    
    const { reason } = await c.req.json();
    
    // Update template to REJECTED status
    const oldStatus = existingTemplate.status;
    const rejectedTemplate: templateHelpers.WhatsAppTemplate = {
      ...existingTemplate,
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'Template rejected by META',
      updatedAt: new Date().toISOString(),
    };
    
    await templateHelpers.saveTemplate(rejectedTemplate);
    await templateHelpers.updateTemplateStatus(templateId, oldStatus, 'REJECTED');
    
    console.log('❌ Template rejected (simulated):', templateId);
    return c.json({ 
      template: rejectedTemplate, 
      message: 'Template rejected' 
    });
  } catch (error) {
    console.error('Error rejecting template:', error);
    return c.json({ error: 'Failed to reject template' }, 500);
  }
});

// ============================================================================
// CHATFLOW MANAGEMENT ROUTES
// ============================================================================

// Get chatflow statistics (admin only)
app.get("/make-server-deeab278/chatflows/stats", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access chatflow stats' }, 403);
    }
    
    const projectId = c.req.query('projectId');
    const stats = await chatflowHelpers.getChatflowStats(kv, projectId);
    
    return c.json({ stats });
  } catch (error) {
    console.error('Error getting chatflow stats:', error);
    return c.json({ error: 'Failed to get chatflow statistics' }, 500);
  }
});

// Browse all chatflows grouped by project (admin only) - for cross-project cloning
app.get("/make-server-deeab278/chatflows/browse", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can browse chatflows' }, 403);
    }
    
    // Get all chatflows without project filter
    const allChatflows = await chatflowHelpers.listChatflows(kv, {});
    
    // Group by projectId
    const grouped: Record<string, any[]> = {};
    for (const chatflow of allChatflows) {
      const projectId = chatflow.projectId || 'unknown';
      if (!grouped[projectId]) {
        grouped[projectId] = [];
      }
      grouped[projectId].push({
        id: chatflow.id,
        name: chatflow.name,
        description: chatflow.description,
        status: chatflow.status,
        nodesCount: chatflow.nodes?.length || 0,
        createdAt: chatflow.createdAt,
        updatedAt: chatflow.updatedAt,
      });
    }
    
    return c.json({ chatflowsByProject: grouped });
  } catch (error) {
    console.error('Error browsing chatflows:', error);
    return c.json({ error: 'Failed to browse chatflows' }, 500);
  }
});

// Get all chatflows (admin only) - projectId required for isolation
app.get("/make-server-deeab278/chatflows", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access chatflows' }, 403);
    }
    
    const status = c.req.query('status');
    const projectId = c.req.query('projectId');
    
    // projectId is required for proper isolation
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const chatflows = await chatflowHelpers.listChatflows(kv, {
      status,
      projectId,
    });
    
    return c.json({ chatflows });
  } catch (error) {
    console.error('Error listing chatflows:', error);
    return c.json({ error: 'Failed to list chatflows' }, 500);
  }
});

// Get single chatflow (admin only)
app.get("/make-server-deeab278/chatflows/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access chatflows' }, 403);
    }
    
    const chatflowId = c.req.param('id');
    const projectId = c.req.query('projectId');
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const chatflow = await chatflowHelpers.getChatflow(kv, chatflowId, projectId);
    
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }
    
    return c.json({ chatflow });
  } catch (error) {
    console.error('Error getting chatflow:', error);
    return c.json({ error: 'Failed to get chatflow' }, 500);
  }
});

// Create new chatflow (admin only)
app.post("/make-server-deeab278/chatflows", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can create chatflows' }, 403);
    }
    
    const body = await c.req.json();
    const { name, description, projectId } = body;
    
    if (!name) {
      return c.json({ error: 'Chatflow name is required' }, 400);
    }
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const chatflow = await chatflowHelpers.createChatflow(
      kv,
      { name, description, projectId },
      user.id
    );
    
    return c.json({ chatflow, message: 'Chatflow created successfully' });
  } catch (error) {
    console.error('Error creating chatflow:', error);
    const message = error instanceof Error ? error.message : 'Failed to create chatflow';
    return c.json({ error: message }, 400);
  }
});

// Update chatflow (admin only)
app.put("/make-server-deeab278/chatflows/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can update chatflows' }, 403);
    }
    
    const chatflowId = c.req.param('id');
    const body = await c.req.json();
    const { projectId, ...updates } = body;
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const chatflow = await chatflowHelpers.updateChatflow(
      kv,
      chatflowId,
      updates,
      projectId
    );
    
    return c.json({ chatflow, message: 'Chatflow updated successfully' });
  } catch (error) {
    console.error('Error updating chatflow:', error);
    const message = error instanceof Error ? error.message : 'Failed to update chatflow';
    return c.json({ error: message }, 400);
  }
});

// Delete chatflow (admin only)
app.delete("/make-server-deeab278/chatflows/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete chatflows' }, 403);
    }
    
    const chatflowId = c.req.param('id');
    const projectId = c.req.query('projectId');
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    await chatflowHelpers.deleteChatflow(kv, chatflowId, projectId);
    
    return c.json({ message: 'Chatflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatflow:', error);
    return c.json({ error: 'Failed to delete chatflow' }, 500);
  }
});

// Clone chatflow (admin only)
app.post("/make-server-deeab278/chatflows/:id/clone", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can clone chatflows' }, 403);
    }
    
    const chatflowId = c.req.param('id');
    const body = await c.req.json();
    const { newName, sourceProjectId, targetProjectId } = body;
    
    // targetProjectId is required - where the clone will be created
    if (!targetProjectId) {
      return c.json({ error: 'Target Project ID is required' }, 400);
    }
    
    // sourceProjectId is optional - defaults to targetProjectId for same-project clone
    const effectiveSourceProjectId = sourceProjectId || targetProjectId;
    
    const chatflow = await chatflowHelpers.cloneChatflow(
      kv,
      chatflowId,
      newName,
      user.id,
      effectiveSourceProjectId,
      targetProjectId
    );
    
    return c.json({ chatflow, message: 'Chatflow cloned successfully' });
  } catch (error) {
    console.error('Error cloning chatflow:', error);
    const message = error instanceof Error ? error.message : 'Failed to clone chatflow';
    return c.json({ error: message }, 400);
  }
});

// Test chatflow (admin only)
app.post("/make-server-deeab278/chatflows/:id/test", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can test chatflows' }, 403);
    }
    
    const chatflowId = c.req.param('id');
    const body = await c.req.json();
    const { projectId, ...testData } = body;
    
    const testResults = await chatflowHelpers.testChatflow(
      kv,
      chatflowId,
      testData,
      projectId
    );
    
    return c.json({ testResults, message: 'Chatflow test completed' });
  } catch (error) {
    console.error('Error testing chatflow:', error);
    const message = error instanceof Error ? error.message : 'Failed to test chatflow';
    return c.json({ error: message }, 400);
  }
});

// ============================================================================
// GUEST MANAGEMENT ROUTES
// ============================================================================

// Debug endpoint to check KV store data (admin only)
app.get("/make-server-deeab278/debug/kv", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access debug' }, 403);
    }
    
    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    // Get guests list
    const guestsListKey = `guests:list:${projectId}`;
    const guestIds = await kv.get(guestsListKey) || [];
    
    // Get actual guests
    const guests = [];
    for (const guestId of guestIds) {
      const guestKey = `guest:${projectId}:${guestId}`;
      const guest = await kv.get(guestKey);
      guests.push({
        guestId,
        guestKey,
        found: !!guest,
        guestIdFromData: guest?.id,
      });
    }
    
    // Also try getByPrefix
    const guestsByPrefix = await kv.getByPrefix(`guest:${projectId}:`);
    
    return c.json({ 
      projectId,
      guestsListKey,
      guestIdsInList: guestIds,
      guestIdsCount: guestIds.length,
      guestsLookup: guests,
      guestsByPrefixCount: guestsByPrefix.length,
      guestsByPrefix: guestsByPrefix.slice(0, 3).map((g: any) => ({ id: g.id, name: g.name })),
    });
  } catch (error) {
    console.error('Error in debug/kv:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Seed sample guests for testing/demo (admin only)
app.post("/make-server-deeab278/guests/seed", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can seed guests' }, 403);
    }
    
    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    // Optional: clear existing guests first
    const clearFirst = c.req.query('clear') === 'true';
    if (clearFirst) {
      await guestHelpers.clearAllGuests(projectId);
    }
    
    const guests = await guestHelpers.seedSampleGuests(projectId, user.id);
    return c.json({ 
      message: `Seeded ${guests.length} sample guests`,
      guests,
      count: guests.length
    });
  } catch (error) {
    console.error('Error seeding guests:', error);
    return c.json({ error: 'Failed to seed guests' }, 500);
  }
});

// Get guest statistics (admin only)
app.get("/make-server-deeab278/guests/stats", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access guest statistics' }, 403);
    }
    
    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const stats = await guestHelpers.getGuestStats(projectId);
    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching guest stats:', error);
    return c.json({ error: 'Failed to fetch guest statistics' }, 500);
  }
});

// Bulk import guests (admin only)
app.post("/make-server-deeab278/guests/bulk", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can import guests' }, 403);
    }
    
    const { projectId, guests } = await c.req.json();
    
    if (!projectId || !guests || !Array.isArray(guests)) {
      return c.json({ error: 'Invalid request: projectId and guests array required' }, 400);
    }
    
    const result = await guestHelpers.bulkCreateGuests(guests, projectId, user.id);
    
    return c.json({
      message: `Imported ${result.success.length} guests successfully`,
      success: result.success,
      failed: result.failed,
      stats: {
        total: guests.length,
        success: result.success.length,
        failed: result.failed.length,
      }
    });
  } catch (error) {
    console.error('Error bulk importing guests:', error);
    return c.json({ error: 'Failed to import guests' }, 500);
  }
});

// Check-in guest (admin only)
app.post("/make-server-deeab278/guests/:id/checkin", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can check-in guests' }, 403);
    }
    
    const guestId = c.req.param('id');
    const { projectId } = await c.req.json();
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const guest = await guestHelpers.checkInGuest(guestId, projectId);
    return c.json({ guest, message: 'Guest checked in successfully' });
  } catch (error) {
    console.error('Error checking in guest:', error);
    const message = error instanceof Error ? error.message : 'Failed to check in guest';
    return c.json({ error: message }, 400);
  }
});

// Get all guests for a project (admin only)
app.get("/make-server-deeab278/guests", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    // Only admin can access guests
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access guests' }, 403);
    }
    
    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const guests = await guestHelpers.listGuests(projectId);
    return c.json({ guests });
  } catch (error) {
    console.error('Error fetching guests:', error);
    return c.json({ error: 'Failed to fetch guests' }, 500);
  }
});

// Get guest by ID (admin only)
app.get("/make-server-deeab278/guests/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access guests' }, 403);
    }
    
    const guestId = c.req.param('id');
    const projectId = c.req.query('projectId');
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const guest = await guestHelpers.getGuest(guestId, projectId);
    
    if (!guest) {
      return c.json({ error: 'Guest not found' }, 404);
    }
    
    return c.json({ guest });
  } catch (error) {
    console.error('Error fetching guest:', error);
    return c.json({ error: 'Failed to fetch guest' }, 500);
  }
});

// Create new guest (admin only)
app.post("/make-server-deeab278/guests", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can create guests' }, 403);
    }
    
    const body = await c.req.json();
    const { projectId, ...guestInput } = body;
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const guest = await guestHelpers.createGuest(guestInput, projectId, user.id);
    return c.json({ guest, message: 'Guest created successfully' }, 201);
  } catch (error) {
    console.error('Error creating guest:', error);
    const message = error instanceof Error ? error.message : 'Failed to create guest';
    return c.json({ error: message }, 400);
  }
});

// Update guest (admin only)
app.put("/make-server-deeab278/guests/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can update guests' }, 403);
    }
    
    const guestId = c.req.param('id');
    const body = await c.req.json();
    const { projectId, ...updates } = body;
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    const guest = await guestHelpers.updateGuest(guestId, projectId, updates);
    return c.json({ guest, message: 'Guest updated successfully' });
  } catch (error) {
    console.error('Error updating guest:', error);
    const message = error instanceof Error ? error.message : 'Failed to update guest';
    return c.json({ error: message }, 400);
  }
});

// Delete guest (admin only)
app.delete("/make-server-deeab278/guests/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }
    
    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }
    
    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete guests' }, 403);
    }
    
    const guestId = c.req.param('id');
    const projectId = c.req.query('projectId');
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }
    
    await guestHelpers.deleteGuest(guestId, projectId);
    return c.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return c.json({ error: 'Failed to delete guest' }, 500);
  }
});

// ==========================================
// CAMPAIGN ROUTES
// ==========================================

// Get all campaigns for a project
app.get("/make-server-deeab278/campaigns", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const projectId = c.req.query('projectId');
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const campaigns = await campaignHelpers.getCampaigns(projectId);
    return c.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
});

// Get single campaign
app.get("/make-server-deeab278/campaigns/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('id');
    const campaign = await campaignHelpers.getCampaign(campaignId);

    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    return c.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return c.json({ error: 'Failed to fetch campaign' }, 500);
  }
});

// Create campaign
app.post("/make-server-deeab278/campaigns", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const body = await c.req.json();
    const { projectId, ...input } = body;

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    // Get chatflow to validate and cache name
    const chatflow = await chatflowHelpers.getChatflow(kv, input.chatflow_id, projectId);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    // Allow both 'active' and 'draft' chatflows for campaigns
    if (chatflow.status !== 'active' && chatflow.status !== 'draft') {
      return c.json({ error: 'Only active or draft chatflows can be used in campaigns' }, 400);
    }

    const campaign = await campaignHelpers.createCampaign(
      input,
      projectId,
      user.id,
      chatflow
    );

    return c.json({ campaign, message: 'Campaign created successfully' });
  } catch (error) {
    console.error('Error creating campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to create campaign';
    return c.json({ error: message }, 400);
  }
});

// Update campaign
app.put("/make-server-deeab278/campaigns/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('id');
    const updates = await c.req.json();

    // If chatflow is being updated, validate it
    let chatflow;
    if (updates.chatflow_id) {
      // Get existing campaign to find projectId
      const existingCampaign = await campaignHelpers.getCampaign(campaignId);
      chatflow = await chatflowHelpers.getChatflow(kv, updates.chatflow_id, existingCampaign?.project_id);
      if (!chatflow) {
        return c.json({ error: 'Chatflow not found' }, 404);
      }
    }

    const campaign = await campaignHelpers.updateCampaign(campaignId, updates, chatflow);
    return c.json({ campaign, message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Error updating campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to update campaign';
    return c.json({ error: message }, 400);
  }
});

// Delete campaign
app.delete("/make-server-deeab278/campaigns/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete campaigns' }, 403);
    }

    const campaignId = c.req.param('id');
    await campaignHelpers.deleteCampaign(campaignId);

    return c.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return c.json({ error: 'Failed to delete campaign' }, 500);
  }
});

// Start campaign
app.post("/make-server-deeab278/campaigns/:id/start", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('id');
    const campaign = await campaignHelpers.getCampaign(campaignId);

    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    // Get chatflow
    const chatflow = await chatflowHelpers.getChatflow(kv, campaign.chatflow_id, campaign.project_id);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    await campaignHelpers.startCampaign(campaignId, chatflow);

    return c.json({ message: 'Campaign started successfully' });
  } catch (error) {
    console.error('Error starting campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to start campaign';
    return c.json({ error: message }, 400);
  }
});

// Pause campaign
app.post("/make-server-deeab278/campaigns/:id/pause", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('id');
    await campaignHelpers.pauseCampaign(campaignId);

    return c.json({ message: 'Campaign paused successfully' });
  } catch (error) {
    console.error('Error pausing campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to pause campaign';
    return c.json({ error: message }, 400);
  }
});

// Resume campaign
app.post("/make-server-deeab278/campaigns/:id/resume", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('id');
    const campaign = await campaignHelpers.getCampaign(campaignId);

    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    // Get chatflow
    const chatflow = await chatflowHelpers.getChatflow(kv, campaign.chatflow_id, campaign.project_id);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    await campaignHelpers.resumeCampaign(campaignId, chatflow);

    return c.json({ message: 'Campaign resumed successfully' });
  } catch (error) {
    console.error('Error resuming campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to resume campaign';
    return c.json({ error: message }, 400);
  }
});

// Cancel campaign
app.post("/make-server-deeab278/campaigns/:id/cancel", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('id');
    await campaignHelpers.cancelCampaign(campaignId);

    return c.json({ message: 'Campaign cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel campaign';
    return c.json({ error: message }, 400);
  }
});

// Preview filtered guests
app.post("/make-server-deeab278/campaigns/preview-guests", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const { projectId, guestFilter } = await c.req.json();

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const guests = await campaignHelpers.filterGuests(projectId, guestFilter);

    return c.json({ guests, count: guests.length });
  } catch (error) {
    console.error('Error previewing guests:', error);
    return c.json({ error: 'Failed to preview guests' }, 500);
  }
});

// ==========================================
// EXECUTION ROUTES
// ==========================================

// Get executions for a campaign
app.get("/make-server-deeab278/campaigns/:campaignId/executions", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('campaignId');
    const executions = await executionHelpers.getExecutionsByCampaign(campaignId);

    return c.json({ executions });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return c.json({ error: 'Failed to fetch executions' }, 500);
  }
});

// Get single execution
app.get("/make-server-deeab278/executions/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const executionId = c.req.param('id');
    const execution = await executionHelpers.getExecution(executionId);

    if (!execution) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    return c.json({ execution });
  } catch (error) {
    console.error('Error fetching execution:', error);
    return c.json({ error: 'Failed to fetch execution' }, 500);
  }
});

// Get execution messages
app.get("/make-server-deeab278/executions/:id/messages", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const executionId = c.req.param('id');
    const messages = await executionHelpers.getMessagesByExecution(executionId);

    return c.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Retry execution
app.post("/make-server-deeab278/executions/:id/retry", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const executionId = c.req.param('id');
    const execution = await executionHelpers.getExecution(executionId);

    if (!execution) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    // Get campaign and chatflow
    const campaign = await campaignHelpers.getCampaign(execution.campaign_id);
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    const chatflow = await chatflowHelpers.getChatflow(kv, campaign.chatflow_id, campaign.project_id);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    const result = await executionHelpers.bulkRetryExecutions([executionId], chatflow);

    if (result.failed.length > 0) {
      return c.json({ error: result.failed[0].error }, 400);
    }

    return c.json({ message: 'Execution retried successfully' });
  } catch (error) {
    console.error('Error retrying execution:', error);
    const message = error instanceof Error ? error.message : 'Failed to retry execution';
    return c.json({ error: message }, 400);
  }
});

// Pause execution
app.post("/make-server-deeab278/executions/:id/pause", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const executionId = c.req.param('id');
    const result = await executionHelpers.bulkPauseExecutions([executionId]);

    if (result.failed.length > 0) {
      return c.json({ error: result.failed[0].error }, 400);
    }

    return c.json({ message: 'Execution paused successfully' });
  } catch (error) {
    console.error('Error pausing execution:', error);
    const message = error instanceof Error ? error.message : 'Failed to pause execution';
    return c.json({ error: message }, 400);
  }
});

// Resume execution
app.post("/make-server-deeab278/executions/:id/resume", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const executionId = c.req.param('id');
    const execution = await executionHelpers.getExecution(executionId);

    if (!execution) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    // Get campaign and chatflow
    const campaign = await campaignHelpers.getCampaign(execution.campaign_id);
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    const chatflow = await chatflowHelpers.getChatflow(kv, campaign.chatflow_id, campaign.project_id);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    const result = await executionHelpers.bulkResumeExecutions([executionId], chatflow);

    if (result.failed.length > 0) {
      return c.json({ error: result.failed[0].error }, 400);
    }

    return c.json({ message: 'Execution resumed successfully' });
  } catch (error) {
    console.error('Error resuming execution:', error);
    const message = error instanceof Error ? error.message : 'Failed to resume execution';
    return c.json({ error: message }, 400);
  }
});

// Bulk retry executions
app.post("/make-server-deeab278/executions/bulk-retry", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const { execution_ids, campaign_id } = await c.req.json();

    if (!execution_ids || !Array.isArray(execution_ids)) {
      return c.json({ error: 'execution_ids array is required' }, 400);
    }

    // Get campaign and chatflow
    const campaign = await campaignHelpers.getCampaign(campaign_id);
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    const chatflow = await chatflowHelpers.getChatflow(kv, campaign.chatflow_id, campaign.project_id);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    const result = await executionHelpers.bulkRetryExecutions(execution_ids, chatflow);

    return c.json({ result });
  } catch (error) {
    console.error('Error bulk retrying executions:', error);
    return c.json({ error: 'Failed to bulk retry executions' }, 500);
  }
});

// Bulk pause executions
app.post("/make-server-deeab278/executions/bulk-pause", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const { execution_ids } = await c.req.json();

    if (!execution_ids || !Array.isArray(execution_ids)) {
      return c.json({ error: 'execution_ids array is required' }, 400);
    }

    const result = await executionHelpers.bulkPauseExecutions(execution_ids);

    return c.json({ result });
  } catch (error) {
    console.error('Error bulk pausing executions:', error);
    return c.json({ error: 'Failed to bulk pause executions' }, 500);
  }
});

// Bulk resume executions
app.post("/make-server-deeab278/executions/bulk-resume", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const { execution_ids, campaign_id } = await c.req.json();

    if (!execution_ids || !Array.isArray(execution_ids)) {
      return c.json({ error: 'execution_ids array is required' }, 400);
    }

    // Get campaign and chatflow
    const campaign = await campaignHelpers.getCampaign(campaign_id);
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404);
    }

    const chatflow = await chatflowHelpers.getChatflow(kv, campaign.chatflow_id, campaign.project_id);
    if (!chatflow) {
      return c.json({ error: 'Chatflow not found' }, 404);
    }

    const result = await executionHelpers.bulkResumeExecutions(execution_ids, chatflow);

    return c.json({ result });
  } catch (error) {
    console.error('Error bulk resuming executions:', error);
    return c.json({ error: 'Failed to bulk resume executions' }, 500);
  }
});

// Bulk cancel executions
app.post("/make-server-deeab278/executions/bulk-cancel", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const { execution_ids } = await c.req.json();

    if (!execution_ids || !Array.isArray(execution_ids)) {
      return c.json({ error: 'execution_ids array is required' }, 400);
    }

    const result = await executionHelpers.bulkCancelExecutions(execution_ids);

    return c.json({ result });
  } catch (error) {
    console.error('Error bulk cancelling executions:', error);
    return c.json({ error: 'Failed to bulk cancel executions' }, 500);
  }
});

// ==========================================
// REMINDER ROUTES
// ==========================================

// Get reminders for a campaign
app.get("/make-server-deeab278/campaigns/:campaignId/reminders", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('campaignId');
    const reminders = await reminderHelpers.getRemindersByCampaign(campaignId);

    return c.json({ reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return c.json({ error: 'Failed to fetch reminders' }, 500);
  }
});

// Create reminder
app.post("/make-server-deeab278/campaigns/:campaignId/reminders", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const campaignId = c.req.param('campaignId');
    const input = await c.req.json();

    input.campaign_id = campaignId;

    const reminder = await reminderHelpers.createReminder(input, user.id);

    return c.json({ reminder, message: 'Reminder created successfully' });
  } catch (error) {
    console.error('Error creating reminder:', error);
    const message = error instanceof Error ? error.message : 'Failed to create reminder';
    return c.json({ error: message }, 400);
  }
});

// Update reminder
app.put("/make-server-deeab278/reminders/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const reminderId = c.req.param('id');
    const updates = await c.req.json();

    const reminder = await reminderHelpers.updateReminder(reminderId, updates);

    return c.json({ reminder, message: 'Reminder updated successfully' });
  } catch (error) {
    console.error('Error updating reminder:', error);
    const message = error instanceof Error ? error.message : 'Failed to update reminder';
    return c.json({ error: message }, 400);
  }
});

// Delete reminder
app.delete("/make-server-deeab278/reminders/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const reminderId = c.req.param('id');
    await reminderHelpers.deleteReminder(reminderId);

    return c.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return c.json({ error: 'Failed to delete reminder' }, 500);
  }
});

// Trigger reminder
app.post("/make-server-deeab278/reminders/:id/trigger", async (c) => {
  try {
    const accessToken = extractAccessToken(c);

    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    const reminderId = c.req.param('id');
    await reminderHelpers.triggerReminder(reminderId);

    return c.json({ message: 'Reminder triggered successfully' });
  } catch (error) {
    console.error('Error triggering reminder:', error);
    const message = error instanceof Error ? error.message : 'Failed to trigger reminder';
    return c.json({ error: message }, 400);
  }
});

// ==================== WhatsApp Flow Endpoints ====================

// List all WhatsApp flows (admin only) - projectId required
app.get("/make-server-deeab278/wa-flows", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access WhatsApp flows' }, 403);
    }

    const status = c.req.query('status');
    const projectId = c.req.query('projectId');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const flows = await waFlowHelpers.listFlows(kv, { status: status || undefined, projectId });
    return c.json({ flows });
  } catch (error) {
    console.error('Error listing WhatsApp flows:', error);
    return c.json({ error: 'Failed to list WhatsApp flows' }, 500);
  }
});

// Get single WhatsApp flow (admin only)
app.get("/make-server-deeab278/wa-flows/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can access WhatsApp flows' }, 403);
    }

    const flowId = c.req.param('id');
    const projectId = c.req.query('projectId');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const flow = await waFlowHelpers.getFlow(kv, flowId, projectId);
    if (!flow) {
      return c.json({ error: 'WhatsApp flow not found' }, 404);
    }

    return c.json({ flow });
  } catch (error) {
    console.error('Error getting WhatsApp flow:', error);
    return c.json({ error: 'Failed to get WhatsApp flow' }, 500);
  }
});

// Create new WhatsApp flow (admin only)
app.post("/make-server-deeab278/wa-flows", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can create WhatsApp flows' }, 403);
    }

    const body = await c.req.json();
    const { name, description, category, projectId, flowJson } = body;

    if (!name) {
      return c.json({ error: 'Flow name is required' }, 400);
    }

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const flow = await waFlowHelpers.createFlow(
      kv,
      { name, description, category, projectId, flowJson },
      user.id
    );

    return c.json({ flow, message: 'WhatsApp flow created successfully' });
  } catch (error) {
    console.error('Error creating WhatsApp flow:', error);
    const message = error instanceof Error ? error.message : 'Failed to create WhatsApp flow';
    return c.json({ error: message }, 400);
  }
});

// Create WhatsApp flow from template (admin only)
app.post("/make-server-deeab278/wa-flows/from-template", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can create WhatsApp flows' }, 403);
    }

    const body = await c.req.json();
    const { templateId, name, projectId } = body;

    if (!templateId || !name || !projectId) {
      return c.json({ error: 'templateId, name, and projectId are required' }, 400);
    }

    const flow = await waFlowHelpers.createFlowFromTemplate(
      kv,
      templateId,
      name,
      projectId,
      user.id
    );

    return c.json({ flow, message: 'WhatsApp flow created from template' });
  } catch (error) {
    console.error('Error creating WhatsApp flow from template:', error);
    const message = error instanceof Error ? error.message : 'Failed to create flow from template';
    return c.json({ error: message }, 400);
  }
});

// Update WhatsApp flow (admin only)
app.put("/make-server-deeab278/wa-flows/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can update WhatsApp flows' }, 403);
    }

    const flowId = c.req.param('id');
    const projectId = c.req.query('projectId');
    const body = await c.req.json();

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const flow = await waFlowHelpers.updateFlow(kv, flowId, body, projectId);
    return c.json({ flow, message: 'WhatsApp flow updated successfully' });
  } catch (error) {
    console.error('Error updating WhatsApp flow:', error);
    const message = error instanceof Error ? error.message : 'Failed to update WhatsApp flow';
    return c.json({ error: message }, 400);
  }
});

// Delete WhatsApp flow (admin only)
app.delete("/make-server-deeab278/wa-flows/:id", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can delete WhatsApp flows' }, 403);
    }

    const flowId = c.req.param('id');
    const projectId = c.req.query('projectId');

    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    await waFlowHelpers.deleteFlow(kv, flowId, projectId);
    return c.json({ message: 'WhatsApp flow deleted successfully' });
  } catch (error) {
    console.error('Error deleting WhatsApp flow:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete WhatsApp flow';
    return c.json({ error: message }, 400);
  }
});

// Clone WhatsApp flow (admin only)
app.post("/make-server-deeab278/wa-flows/:id/clone", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Only admins can clone WhatsApp flows' }, 403);
    }

    const flowId = c.req.param('id');
    const body = await c.req.json();
    const { newName, sourceProjectId, targetProjectId } = body;

    if (!sourceProjectId || !targetProjectId) {
      return c.json({ error: 'sourceProjectId and targetProjectId are required' }, 400);
    }

    const flow = await waFlowHelpers.cloneFlow(
      kv,
      flowId,
      newName,
      user.id,
      sourceProjectId,
      targetProjectId
    );

    return c.json({ flow, message: 'WhatsApp flow cloned successfully' });
  } catch (error) {
    console.error('Error cloning WhatsApp flow:', error);
    const message = error instanceof Error ? error.message : 'Failed to clone WhatsApp flow';
    return c.json({ error: message }, 400);
  }
});

// List WhatsApp flow templates
app.get("/make-server-deeab278/wa-flow-templates", async (c) => {
  try {
    const accessToken = extractAccessToken(c);
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    if (error || !user) {
      return c.json({ error }, 401);
    }

    // Seed templates if needed
    await waFlowHelpers.seedDefaultTemplates(kv);

    const templates = await waFlowHelpers.listTemplates(kv);
    return c.json({ templates });
  } catch (error) {
    console.error('Error listing WhatsApp flow templates:', error);
    return c.json({ error: 'Failed to list templates' }, 500);
  }
});

Deno.serve(app.fetch);