import * as kv from "./kv_store.ts";
import type {
  CampaignReminder,
  CreateReminderInput,
  UpdateReminderInput,
} from "../../../src/app/types/reminder.ts";

// Helper to generate reminder ID
export function generateReminderId(projectId: string, campaignId: string): string {
  return `reminder:${projectId}:${campaignId}:${crypto.randomUUID()}`;
}

// Helper to get reminder key
export function getReminderKey(reminderId: string): string {
  return reminderId;
}

// Helper to get reminders list key for a campaign
export function getRemindersListKey(campaignId: string): string {
  return `reminders:list:${campaignId}`;
}

// Create reminder
export async function createReminder(
  input: CreateReminderInput,
  userId: string,
): Promise<CampaignReminder> {
  const projectId = input.campaign_id.split(':')[1];
  const reminderId = generateReminderId(projectId, input.campaign_id);
  const now = new Date().toISOString();

  const reminder: CampaignReminder = {
    id: reminderId,
    campaign_id: input.campaign_id,
    name: input.name,
    description: input.description,
    type: input.type,
    trigger_at: input.trigger_at,
    action: input.action,
    target_filter: input.target_filter,
    status: 'scheduled',
    project_id: projectId,
    created_by: userId,
    created_at: now,
    updated_at: now,
  };

  // Save reminder
  const key = getReminderKey(reminderId);
  await kv.set(key, reminder);

  // Add to list
  const listKey = getRemindersListKey(input.campaign_id);
  const reminderIds = await kv.get<string[]>(listKey) || [];
  reminderIds.push(reminderId);
  await kv.set(listKey, reminderIds);

  return reminder;
}

// Get reminder
export async function getReminder(reminderId: string): Promise<CampaignReminder | null> {
  const key = getReminderKey(reminderId);
  return await kv.get<CampaignReminder>(key);
}

// Get reminders by campaign
export async function getRemindersByCampaign(campaignId: string): Promise<CampaignReminder[]> {
  const listKey = getRemindersListKey(campaignId);
  const reminderIds = await kv.get<string[]>(listKey) || [];

  const reminders: CampaignReminder[] = [];
  for (const reminderId of reminderIds) {
    const reminder = await getReminder(reminderId);
    if (reminder) {
      reminders.push(reminder);
    }
  }

  // Sort by trigger_at ascending (soonest first)
  reminders.sort((a, b) =>
    new Date(a.trigger_at).getTime() - new Date(b.trigger_at).getTime()
  );

  return reminders;
}

// Update reminder
export async function updateReminder(
  reminderId: string,
  updates: UpdateReminderInput,
): Promise<CampaignReminder> {
  const reminder = await getReminder(reminderId);
  if (!reminder) {
    throw new Error('Reminder not found');
  }

  const updatedReminder: CampaignReminder = {
    ...reminder,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const key = getReminderKey(reminderId);
  await kv.set(key, updatedReminder);

  return updatedReminder;
}

// Delete reminder
export async function deleteReminder(reminderId: string): Promise<void> {
  const reminder = await getReminder(reminderId);
  if (!reminder) {
    throw new Error('Reminder not found');
  }

  // Delete reminder
  const key = getReminderKey(reminderId);
  await kv.del(key);

  // Remove from list
  const listKey = getRemindersListKey(reminder.campaign_id);
  const reminderIds = await kv.get<string[]>(listKey) || [];
  const updatedIds = reminderIds.filter(id => id !== reminderId);
  await kv.set(listKey, updatedIds);
}

// Trigger reminder
export async function triggerReminder(reminderId: string): Promise<void> {
  const reminder = await getReminder(reminderId);
  if (!reminder) {
    throw new Error('Reminder not found');
  }

  if (reminder.status !== 'scheduled') {
    throw new Error('Only scheduled reminders can be triggered');
  }

  // Update status
  await updateReminder(reminderId, {
    status: 'triggered',
    triggered_at: new Date().toISOString(),
  });

  // Execute reminder action
  // Note: In production, this would trigger actual campaign actions
  // For Phase 1, we just log it
  console.log(`Triggered reminder ${reminderId}: ${reminder.action}`);
}
