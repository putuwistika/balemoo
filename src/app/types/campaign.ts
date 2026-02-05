import { GuestCategory, InvitationType, RSVPStatus } from './guest';

export type CampaignStatus = 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'archived';
export type CampaignTriggerType = 'manual' | 'scheduled';

// Guest Filter Configuration
export interface CampaignGuestFilter {
  categories?: GuestCategory[];           // ['family', 'vip']
  invitation_types?: InvitationType[];    // ['both']
  rsvp_statuses?: RSVPStatus[];          // ['pending', 'maybe']
  tags?: string[];                        // ['bride_side', 'vegetarian']
  has_plus_one?: boolean;
  checked_in?: boolean;
  custom_guest_ids?: string[];            // Manual selection override
}

// Campaign Definition
export interface Campaign {
  id: string;
  name: string;
  description?: string;

  // Configuration
  chatflow_id: string;                    // Which chatflow to execute
  chatflow_name: string;                  // Cached for display
  guest_filter: CampaignGuestFilter;

  // Scheduling
  trigger_type: CampaignTriggerType;
  scheduled_at?: string;

  // Status & Lifecycle
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;

  // Metadata
  project_id: string;
  created_by: string;

  // Statistics (computed)
  stats?: CampaignStats;
}

export interface CampaignStats {
  total_guests: number;
  executions_pending: number;
  executions_running: number;
  executions_completed: number;
  executions_failed: number;
  executions_paused: number;
  executions_cancelled: number;
  executions_pending_session: number;
  messages_sent: number;
  messages_failed: number;
  rsvp_confirmed: number;
  rsvp_declined: number;
  rsvp_maybe: number;
  last_updated: string;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  chatflow_id: string;
  guest_filter: CampaignGuestFilter;
  trigger_type: CampaignTriggerType;
  scheduled_at?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  chatflow_id?: string;
  guest_filter?: CampaignGuestFilter;
  trigger_type?: CampaignTriggerType;
  scheduled_at?: string;
  status?: CampaignStatus;
}
