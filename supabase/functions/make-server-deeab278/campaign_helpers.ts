import * as kv from "./kv_store.ts";
import type {
  Campaign,
  CampaignStatus,
  CampaignStats,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignGuestFilter,
} from "../../../src/app/types/campaign.ts";
import type { Guest } from "../../../src/app/types/guest.ts";
import type { Chatflow } from "../../../src/app/types/chatflow.ts";
import * as executionHelpers from "./execution_helpers.ts";
import * as sessionHelpers from "./session_helpers.ts";

// Helper to generate campaign ID
export function generateCampaignId(projectId: string): string {
  return `campaign:${projectId}:${crypto.randomUUID()}`;
}

// Helper to generate campaign key
export function getCampaignKey(campaignId: string): string {
  return campaignId;
}

// Helper to generate campaigns list key for a project
export function getCampaignsListKey(projectId: string): string {
  return `campaigns:list:${projectId}`;
}

// Get all campaigns for a project
export async function getCampaigns(projectId: string): Promise<Campaign[]> {
  const listKey = getCampaignsListKey(projectId);
  const campaignIds = await kv.get<string[]>(listKey) || [];

  const campaigns: Campaign[] = [];
  for (const campaignId of campaignIds) {
    const campaign = await getCampaign(campaignId);
    if (campaign) {
      campaigns.push(campaign);
    }
  }

  // Sort by created_at descending (newest first)
  campaigns.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return campaigns;
}

// Get single campaign
export async function getCampaign(campaignId: string): Promise<Campaign | null> {
  const key = getCampaignKey(campaignId);
  const campaign = await kv.get<Campaign>(key);

  if (!campaign) {
    return null;
  }

  // Compute stats
  const stats = await computeCampaignStats(campaignId);
  campaign.stats = stats;

  return campaign;
}

// Create campaign
export async function createCampaign(
  input: CreateCampaignInput,
  projectId: string,
  userId: string,
  chatflow: Chatflow,
): Promise<Campaign> {
  const campaignId = generateCampaignId(projectId);
  const now = new Date().toISOString();

  const campaign: Campaign = {
    id: campaignId,
    name: input.name,
    description: input.description,
    chatflow_id: input.chatflow_id,
    chatflow_name: chatflow.name,
    guest_filter: input.guest_filter,
    trigger_type: input.trigger_type,
    scheduled_at: input.scheduled_at,
    status: 'draft',
    created_at: now,
    updated_at: now,
    project_id: projectId,
    created_by: userId,
  };

  // Save campaign
  const key = getCampaignKey(campaignId);
  await kv.set(key, campaign);

  // Add to list
  const listKey = getCampaignsListKey(projectId);
  const campaignIds = await kv.get<string[]>(listKey) || [];
  campaignIds.push(campaignId);
  await kv.set(listKey, campaignIds);

  return campaign;
}

// Update campaign
export async function updateCampaign(
  campaignId: string,
  updates: UpdateCampaignInput,
  chatflow?: Chatflow,
): Promise<Campaign> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const updatedCampaign: Campaign = {
    ...campaign,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Update chatflow name if chatflow provided
  if (chatflow) {
    updatedCampaign.chatflow_name = chatflow.name;
  }

  const key = getCampaignKey(campaignId);
  await kv.set(key, updatedCampaign);

  return updatedCampaign;
}

// Delete campaign
export async function deleteCampaign(campaignId: string): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Delete campaign
  const key = getCampaignKey(campaignId);
  await kv.del(key);

  // Remove from list
  const listKey = getCampaignsListKey(campaign.project_id);
  const campaignIds = await kv.get<string[]>(listKey) || [];
  const updatedIds = campaignIds.filter(id => id !== campaignId);
  await kv.set(listKey, updatedIds);

  // TODO: Delete all related executions, messages, reminders
}

// Filter guests based on campaign filter
export async function filterGuests(
  projectId: string,
  filter: CampaignGuestFilter,
): Promise<Guest[]> {
  // Get all guests for project
  const guestsListKey = `guests:list:${projectId}`;
  const guestIds = await kv.get<string[]>(guestsListKey) || [];

  console.log(`[filterGuests] projectId: ${projectId}`);
  console.log(`[filterGuests] guestIds from list (${guestIds.length}):`, guestIds);
  console.log(`[filterGuests] filter:`, JSON.stringify(filter));

  const guests: Guest[] = [];
  for (const guestId of guestIds) {
    const guest = await kv.get<Guest>(`guest:${projectId}:${guestId}`);
    if (guest) {
      guests.push(guest);
    }
  }

  console.log(`[filterGuests] loaded ${guests.length} guests from KV`);
  if (guests.length > 0) {
    console.log(`[filterGuests] sample guest IDs from objects:`, guests.slice(0, 3).map(g => g.id));
  }

  // Apply filters
  let filtered = guests;

  // Filter by custom_guest_ids (override all other filters)
  if (filter.custom_guest_ids && filter.custom_guest_ids.length > 0) {
    console.log(`[filterGuests] filtering by custom_guest_ids (${filter.custom_guest_ids.length}):`, filter.custom_guest_ids.slice(0, 3));
    // Use guest.id (which includes the 'guest_' prefix) for comparison
    const result = filtered.filter(g => filter.custom_guest_ids!.includes(g.id));
    console.log(`[filterGuests] after filter: ${result.length} guests matched`);
    if (result.length === 0 && filtered.length > 0) {
      console.log(`[filterGuests] WARNING: No matches! Comparing:`);
      console.log(`  - filter IDs:`, filter.custom_guest_ids.slice(0, 2));
      console.log(`  - guest IDs:`, filtered.slice(0, 2).map(g => g.id));
    }
    return result;
  }

  // Filter by categories
  if (filter.categories && filter.categories.length > 0) {
    filtered = filtered.filter(g => filter.categories!.includes(g.category));
  }

  // Filter by invitation_types
  if (filter.invitation_types && filter.invitation_types.length > 0) {
    filtered = filtered.filter(g => filter.invitation_types!.includes(g.invitation_type));
  }

  // Filter by rsvp_statuses
  if (filter.rsvp_statuses && filter.rsvp_statuses.length > 0) {
    filtered = filtered.filter(g => filter.rsvp_statuses!.includes(g.rsvp_status));
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter(g =>
      filter.tags!.some(tag => g.tags.includes(tag))
    );
  }

  // Filter by has_plus_one
  if (filter.has_plus_one !== undefined) {
    filtered = filtered.filter(g => g.plus_one === filter.has_plus_one);
  }

  // Filter by checked_in
  if (filter.checked_in !== undefined) {
    filtered = filtered.filter(g =>
      filter.checked_in ? !!g.checked_in_at : !g.checked_in_at
    );
  }

  return filtered;
}

// Start campaign
export async function startCampaign(
  campaignId: string,
  chatflow: Chatflow,
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'draft' && campaign.status !== 'ready') {
    throw new Error('Campaign cannot be started in current status');
  }

  // Filter guests
  const guests = await filterGuests(campaign.project_id, campaign.guest_filter);

  if (guests.length === 0) {
    throw new Error('No guests match the campaign filter');
  }

  // Update campaign status
  const now = new Date().toISOString();
  await updateCampaign(campaignId, {
    status: 'running',
    started_at: now,
  });

  // Create executions for each guest
  for (const guest of guests) {
    // Check for active session
    const activeSession = await sessionHelpers.getActiveSessionForGuest(guest.id);

    if (activeSession) {
      // Create pending invitation instead of starting execution
      await sessionHelpers.createPendingInvitation({
        guest_id: guest.id,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        reason: 'active_session_exists',
        blocked_by_campaign_id: activeSession.campaign_id,
        piggyback_message: `Btw, kami lihat kamu juga diundang ke ${campaign.name}. Mau RSVP sekalian?`,
      });

      // Create execution with pending_session status
      await executionHelpers.createExecution({
        campaign_id: campaign.id,
        guest_id: guest.id,
        chatflow_id: campaign.chatflow_id,
        status: 'pending_session',
      });
    } else {
      // No active session - create normal execution
      const execution = await executionHelpers.createExecution({
        campaign_id: campaign.id,
        guest_id: guest.id,
        chatflow_id: campaign.chatflow_id,
        status: 'pending',
      });

      // Start execution (in background)
      // Note: In production, this would be queued to a job queue
      executionHelpers.startExecution(execution.id, chatflow).catch(err => {
        console.error(`Failed to start execution ${execution.id}:`, err);
      });
    }
  }
}

// Pause campaign
export async function pauseCampaign(campaignId: string): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'running') {
    throw new Error('Only running campaigns can be paused');
  }

  await updateCampaign(campaignId, {
    status: 'paused',
  });

  // Pause all running executions
  const executions = await executionHelpers.getExecutionsByCampaign(campaignId);
  for (const execution of executions) {
    if (execution.status === 'running') {
      await executionHelpers.updateExecution(execution.id, {
        status: 'paused',
        paused_at: new Date().toISOString(),
      });
    }
  }
}

// Resume campaign
export async function resumeCampaign(
  campaignId: string,
  chatflow: Chatflow,
): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'paused') {
    throw new Error('Only paused campaigns can be resumed');
  }

  await updateCampaign(campaignId, {
    status: 'running',
  });

  // Resume all paused executions
  const executions = await executionHelpers.getExecutionsByCampaign(campaignId);
  for (const execution of executions) {
    if (execution.status === 'paused') {
      await executionHelpers.updateExecution(execution.id, {
        status: 'running',
      });

      // Resume execution
      executionHelpers.resumeExecution(execution.id, chatflow).catch(err => {
        console.error(`Failed to resume execution ${execution.id}:`, err);
      });
    }
  }
}

// Cancel campaign
export async function cancelCampaign(campaignId: string): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status === 'completed' || campaign.status === 'archived') {
    throw new Error('Campaign cannot be cancelled in current status');
  }

  await updateCampaign(campaignId, {
    status: 'archived',
  });

  // Cancel all running/pending executions
  const executions = await executionHelpers.getExecutionsByCampaign(campaignId);
  for (const execution of executions) {
    if (execution.status === 'running' || execution.status === 'pending') {
      await executionHelpers.updateExecution(execution.id, {
        status: 'cancelled',
      });
    }
  }
}

// Compute campaign statistics
export async function computeCampaignStats(campaignId: string): Promise<CampaignStats> {
  const executions = await executionHelpers.getExecutionsByCampaign(campaignId);

  const stats: CampaignStats = {
    total_guests: executions.length,
    executions_pending: 0,
    executions_running: 0,
    executions_completed: 0,
    executions_failed: 0,
    executions_paused: 0,
    executions_cancelled: 0,
    executions_pending_session: 0,
    messages_sent: 0,
    messages_failed: 0,
    rsvp_confirmed: 0,
    rsvp_declined: 0,
    rsvp_maybe: 0,
    last_updated: new Date().toISOString(),
  };

  for (const execution of executions) {
    // Count by status
    switch (execution.status) {
      case 'pending':
        stats.executions_pending++;
        break;
      case 'pending_session':
        stats.executions_pending_session++;
        break;
      case 'running':
        stats.executions_running++;
        break;
      case 'completed':
        stats.executions_completed++;
        break;
      case 'failed':
        stats.executions_failed++;
        break;
      case 'paused':
        stats.executions_paused++;
        break;
      case 'cancelled':
        stats.executions_cancelled++;
        break;
    }

    // Count RSVP status from variables
    const rsvpStatus = execution.variables.rsvp_status;
    if (rsvpStatus === 'confirmed') {
      stats.rsvp_confirmed++;
    } else if (rsvpStatus === 'declined') {
      stats.rsvp_declined++;
    } else if (rsvpStatus === 'maybe') {
      stats.rsvp_maybe++;
    }
  }

  // Count messages
  const messages = await executionHelpers.getMessagesByCampaign(campaignId);
  stats.messages_sent = messages.filter(m =>
    m.status === 'sent' || m.status === 'delivered' || m.status === 'read'
  ).length;
  stats.messages_failed = messages.filter(m => m.status === 'failed').length;

  return stats;
}
