import { CampaignGuestFilter } from './campaign';

export type ReminderType = 'one_time' | 'recurring';
export type ReminderStatus = 'scheduled' | 'triggered' | 'cancelled' | 'failed';
export type ReminderAction = 'resend_to_non_responders' | 'send_follow_up' | 'manual_notification';

export interface CampaignReminder {
  id: string;
  campaign_id: string;
  name: string;
  description?: string;
  type: ReminderType;
  trigger_at: string;
  triggered_at?: string;

  // Action
  action: ReminderAction;
  target_filter?: {
    only_pending_rsvp?: boolean;
    only_non_responders?: boolean;
    custom_filter?: CampaignGuestFilter;
  };

  status: ReminderStatus;
  project_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  campaign_id: string;
  name: string;
  description?: string;
  type: ReminderType;
  trigger_at: string;
  action: ReminderAction;
  target_filter?: {
    only_pending_rsvp?: boolean;
    only_non_responders?: boolean;
    custom_filter?: CampaignGuestFilter;
  };
}

export interface UpdateReminderInput {
  name?: string;
  description?: string;
  trigger_at?: string;
  action?: ReminderAction;
  target_filter?: {
    only_pending_rsvp?: boolean;
    only_non_responders?: boolean;
    custom_filter?: CampaignGuestFilter;
  };
  status?: ReminderStatus;
}
