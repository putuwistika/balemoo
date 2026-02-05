import * as kv from "./kv_store.ts";
import type { MessageLog, CreateMessageLogInput } from "../../../src/app/types/message.ts";

// Helper to generate message ID
export function generateMessageId(projectId: string, campaignId: string): string {
  return `message:${projectId}:${campaignId}:${crypto.randomUUID()}`;
}

// Helper to get message key
export function getMessageKey(messageId: string): string {
  return messageId;
}

// Create message log
export async function createMessageLog(input: CreateMessageLogInput): Promise<MessageLog> {
  const projectId = input.campaign_id.split(':')[1];
  const messageId = generateMessageId(projectId, input.campaign_id);
  const now = new Date().toISOString();

  const message: MessageLog = {
    id: messageId,
    campaign_id: input.campaign_id,
    execution_id: input.execution_id,
    guest_id: input.guest_id,
    node_id: input.node_id,
    type: input.type,
    template_id: input.template_id,
    template_name: input.template_name,
    content: input.content,
    variables: input.variables,
    status: input.status || 'queued',
    queued_at: now,
    project_id: projectId,
    created_at: now,
  };

  // Save message
  const key = getMessageKey(messageId);
  await kv.set(key, message);

  // Add to campaign messages list
  const campaignMessagesKey = `messages:list:${input.campaign_id}`;
  const campaignMessageIds = await kv.get<string[]>(campaignMessagesKey) || [];
  campaignMessageIds.push(messageId);
  await kv.set(campaignMessagesKey, campaignMessageIds);

  // Add to execution messages list
  const executionMessagesKey = `messages:list:execution:${input.execution_id}`;
  const executionMessageIds = await kv.get<string[]>(executionMessagesKey) || [];
  executionMessageIds.push(messageId);
  await kv.set(executionMessagesKey, executionMessageIds);

  return message;
}

// Get message
export async function getMessage(messageId: string): Promise<MessageLog | null> {
  const key = getMessageKey(messageId);
  return await kv.get<MessageLog>(key);
}

// Update message
export async function updateMessage(
  messageId: string,
  updates: Partial<MessageLog>,
): Promise<MessageLog> {
  const message = await getMessage(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  const updatedMessage: MessageLog = {
    ...message,
    ...updates,
  };

  const key = getMessageKey(messageId);
  await kv.set(key, updatedMessage);

  return updatedMessage;
}

// Update message status
export async function updateMessageStatus(
  messageId: string,
  status: 'sent' | 'delivered' | 'read' | 'failed',
  errorMessage?: string,
): Promise<MessageLog> {
  const now = new Date().toISOString();
  const updates: Partial<MessageLog> = { status };

  if (status === 'sent') {
    updates.sent_at = now;
  } else if (status === 'delivered') {
    updates.delivered_at = now;
  } else if (status === 'read') {
    updates.read_at = now;
  } else if (status === 'failed') {
    updates.failed_at = now;
    updates.error_message = errorMessage;
  }

  return await updateMessage(messageId, updates);
}

// Simulate sending a message (Phase 1 - no real WhatsApp API)
export async function simulateSendMessage(messageId: string): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mark as sent
  await updateMessageStatus(messageId, 'sent');

  // Simulate delivery after 1 second
  setTimeout(async () => {
    try {
      await updateMessageStatus(messageId, 'delivered');
    } catch (error) {
      console.error('Failed to update message status to delivered:', error);
    }
  }, 1000);
}
