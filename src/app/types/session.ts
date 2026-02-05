export type InvitationStatus = 'pending_piggybacking' | 'sent' | 'cancelled';

// Pending Invitations Table
export interface PendingInvitation {
  id: string;
  guest_id: string;
  campaign_id: string;                    // The campaign waiting to send
  campaign_name?: string;                 // Cached for display
  agenda_name?: string;                   // Cached for display

  // Why pending?
  reason: 'active_session_exists';
  blocked_by_campaign_id: string;         // Which campaign has active session

  // Waiting for
  waiting_for_session_open: boolean;

  // Status
  status: InvitationStatus;

  // Piggybacking message
  piggyback_message?: string;             // Custom message for this invitation

  // Metadata
  created_at: string;
  updated_at: string;
  sent_at?: string;                       // When actually sent via piggybacking
  cancelled_at?: string;
  project_id: string;
}

// Guest Session Tracking
export interface GuestSession {
  id: string;
  guest_id: string;
  guest_phone: string;

  // Active campaign
  campaign_id: string;
  execution_id: string;

  // Session window
  session_opened_at: string;              // When user last replied
  session_expires_at: string;             // 24 hours after last reply
  is_active: boolean;                     // Within 24h window?

  // Current state
  current_node_id: string;
  waiting_for_reply: boolean;

  // Pending invitations
  has_pending_invitations: boolean;
  pending_invitation_ids: string[];

  // Metadata
  project_id: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface CreatePendingInvitationInput {
  guest_id: string;
  campaign_id: string;
  campaign_name?: string;
  agenda_name?: string;
  reason: 'active_session_exists';
  blocked_by_campaign_id: string;
  piggyback_message?: string;
}

export interface CreateGuestSessionInput {
  guest_id: string;
  guest_phone: string;
  campaign_id: string;
  execution_id: string;
  current_node_id: string;
}
