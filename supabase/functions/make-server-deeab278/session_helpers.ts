import * as kv from "./kv_store.ts";
import type {
  GuestSession,
  PendingInvitation,
  CreatePendingInvitationInput,
  CreateGuestSessionInput,
} from "../../../src/app/types/session.ts";

// Helper to generate session ID
export function generateSessionId(projectId: string): string {
  return `session:${projectId}:${crypto.randomUUID()}`;
}

// Helper to generate pending invitation ID
export function generatePendingInvitationId(projectId: string): string {
  return `pending_invitation:${projectId}:${crypto.randomUUID()}`;
}

// Helper to get active sessions list key
export function getActiveSessionsKey(projectId: string): string {
  return `sessions:active:${projectId}`;
}

// Helper to get guest session key (by guest_id)
export function getGuestSessionKey(guestId: string): string {
  return `session:guest:${guestId}`;
}

// Helper to get pending invitations list key for guest
export function getPendingInvitationsKey(guestId: string): string {
  return `pending_invitations:guest:${guestId}`;
}

// Get active session for a guest
export async function getActiveSessionForGuest(guestId: string): Promise<GuestSession | null> {
  const sessionKey = getGuestSessionKey(guestId);
  const session = await kv.get<GuestSession>(sessionKey);

  if (!session) {
    return null;
  }

  // Check if session is still active (within 24 hour window)
  const now = new Date();
  const expiresAt = new Date(session.session_expires_at);

  if (now > expiresAt) {
    // Session expired - clean up
    await deleteSession(session.id);
    return null;
  }

  return session;
}

// Create or update guest session
export async function createOrUpdateSession(input: CreateGuestSessionInput): Promise<GuestSession> {
  // Check if session already exists for this guest
  const existingSession = await getActiveSessionForGuest(input.guest_id);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  if (existingSession) {
    // Update existing session
    const updatedSession: GuestSession = {
      ...existingSession,
      campaign_id: input.campaign_id,
      execution_id: input.execution_id,
      current_node_id: input.current_node_id,
      session_opened_at: now.toISOString(),
      session_expires_at: expiresAt.toISOString(),
      is_active: true,
      last_activity_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    await kv.set(existingSession.id, updatedSession);
    await kv.set(getGuestSessionKey(input.guest_id), updatedSession);

    return updatedSession;
  }

  // Create new session
  const projectId = input.campaign_id.split(':')[1];
  const sessionId = generateSessionId(projectId);

  const session: GuestSession = {
    id: sessionId,
    guest_id: input.guest_id,
    guest_phone: input.guest_phone,
    campaign_id: input.campaign_id,
    execution_id: input.execution_id,
    session_opened_at: now.toISOString(),
    session_expires_at: expiresAt.toISOString(),
    is_active: true,
    current_node_id: input.current_node_id,
    waiting_for_reply: false,
    has_pending_invitations: false,
    pending_invitation_ids: [],
    project_id: projectId,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    last_activity_at: now.toISOString(),
  };

  // Save session
  await kv.set(sessionId, session);
  await kv.set(getGuestSessionKey(input.guest_id), session);

  // Add to active sessions list
  const activeSessionsKey = getActiveSessionsKey(projectId);
  const activeSessions = await kv.get<string[]>(activeSessionsKey) || [];
  activeSessions.push(sessionId);
  await kv.set(activeSessionsKey, activeSessions);

  return session;
}

// Update session
export async function updateSession(
  sessionId: string,
  updates: Partial<GuestSession>,
): Promise<GuestSession> {
  const session = await kv.get<GuestSession>(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const updatedSession: GuestSession = {
    ...session,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await kv.set(sessionId, updatedSession);
  await kv.set(getGuestSessionKey(session.guest_id), updatedSession);

  return updatedSession;
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  const session = await kv.get<GuestSession>(sessionId);
  if (!session) {
    return;
  }

  // Delete from KV
  await kv.del(sessionId);
  await kv.del(getGuestSessionKey(session.guest_id));

  // Remove from active sessions list
  const activeSessionsKey = getActiveSessionsKey(session.project_id);
  const activeSessions = await kv.get<string[]>(activeSessionsKey) || [];
  const updatedSessions = activeSessions.filter(id => id !== sessionId);
  await kv.set(activeSessionsKey, updatedSessions);
}

// Create pending invitation
export async function createPendingInvitation(
  input: CreatePendingInvitationInput,
): Promise<PendingInvitation> {
  const projectId = input.campaign_id.split(':')[1];
  const invitationId = generatePendingInvitationId(projectId);
  const now = new Date().toISOString();

  const invitation: PendingInvitation = {
    id: invitationId,
    guest_id: input.guest_id,
    campaign_id: input.campaign_id,
    campaign_name: input.campaign_name,
    agenda_name: input.agenda_name,
    reason: input.reason,
    blocked_by_campaign_id: input.blocked_by_campaign_id,
    waiting_for_session_open: true,
    status: 'pending_piggybacking',
    piggyback_message: input.piggyback_message,
    created_at: now,
    updated_at: now,
    project_id: projectId,
  };

  // Save invitation
  await kv.set(invitationId, invitation);

  // Add to guest's pending invitations list
  const pendingKey = getPendingInvitationsKey(input.guest_id);
  const pendingIds = await kv.get<string[]>(pendingKey) || [];
  pendingIds.push(invitationId);
  await kv.set(pendingKey, pendingIds);

  // Update session to mark has_pending_invitations
  const session = await getActiveSessionForGuest(input.guest_id);
  if (session) {
    await updateSession(session.id, {
      has_pending_invitations: true,
      pending_invitation_ids: [...session.pending_invitation_ids, invitationId],
    });
  }

  return invitation;
}

// Get pending invitations for a guest
export async function getPendingInvitationsForGuest(guestId: string): Promise<PendingInvitation[]> {
  const pendingKey = getPendingInvitationsKey(guestId);
  const invitationIds = await kv.get<string[]>(pendingKey) || [];

  const invitations: PendingInvitation[] = [];
  for (const invitationId of invitationIds) {
    const invitation = await kv.get<PendingInvitation>(invitationId);
    if (invitation && invitation.status === 'pending_piggybacking') {
      invitations.push(invitation);
    }
  }

  return invitations;
}

// Update pending invitation
export async function updatePendingInvitation(
  invitationId: string,
  updates: Partial<PendingInvitation>,
): Promise<PendingInvitation> {
  const invitation = await kv.get<PendingInvitation>(invitationId);
  if (!invitation) {
    throw new Error('Pending invitation not found');
  }

  const updatedInvitation: PendingInvitation = {
    ...invitation,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await kv.set(invitationId, updatedInvitation);

  return updatedInvitation;
}

// Cancel pending invitation
export async function cancelPendingInvitation(invitationId: string): Promise<void> {
  await updatePendingInvitation(invitationId, {
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
  });
}

// Get pending invitations for a campaign
export async function getPendingInvitationsForCampaign(campaignId: string): Promise<PendingInvitation[]> {
  // Note: This is inefficient - in production, maintain a separate index
  // For now, we'll just scan all pending invitations
  const projectId = campaignId.split(':')[1];

  // This is a placeholder - in production, you'd want a proper index
  // For now, return empty array
  return [];
}
