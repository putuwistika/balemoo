import * as kv from "./kv_store.ts";
import type {
  ChatflowExecution,
  ExecutionStatus,
  NodeExecution,
  BulkExecutionResult,
} from "../../../src/app/types/execution.ts";
import type { Guest } from "../../../src/app/types/guest.ts";
import type { MessageLog } from "../../../src/app/types/message.ts";

// Helper to generate execution ID
export function generateExecutionId(projectId: string, campaignId: string): string {
  return `execution:${projectId}:${campaignId}:${crypto.randomUUID()}`;
}

// Helper to generate execution key
export function getExecutionKey(executionId: string): string {
  return executionId;
}

// Helper to generate executions list key for a campaign
export function getExecutionsListKey(campaignId: string): string {
  return `executions:list:${campaignId}`;
}

// Helper to generate messages list key for a campaign
export function getMessagesListKey(campaignId: string): string {
  return `messages:list:${campaignId}`;
}

// Helper to generate messages list key for an execution
export function getExecutionMessagesListKey(executionId: string): string {
  return `messages:list:execution:${executionId}`;
}

// Create execution
export async function createExecution(input: {
  campaign_id: string;
  guest_id: string;
  chatflow_id: string;
  status?: ExecutionStatus;
}): Promise<ChatflowExecution> {
  // Extract project_id from campaign_id
  const projectId = input.campaign_id.split(':')[1];

  const executionId = generateExecutionId(projectId, input.campaign_id);
  const now = new Date().toISOString();

  // Get guest details
  const guest = await kv.get<Guest>(input.guest_id);
  if (!guest) {
    throw new Error('Guest not found');
  }

  const execution: ChatflowExecution = {
    id: executionId,
    campaign_id: input.campaign_id,
    guest_id: input.guest_id,
    guest_name: guest.name,
    guest_phone: guest.phone,
    chatflow_id: input.chatflow_id,
    status: input.status || 'pending',
    variables: {
      guest_name: guest.name,
      guest_phone: guest.phone,
      guest_category: guest.category,
      guest_invitation_type: guest.invitation_type,
    },
    node_history: [],
    project_id: projectId,
    created_at: now,
    updated_at: now,
  };

  // Save execution
  const key = getExecutionKey(executionId);
  await kv.set(key, execution);

  // Add to list
  const listKey = getExecutionsListKey(input.campaign_id);
  const executionIds = await kv.get<string[]>(listKey) || [];
  executionIds.push(executionId);
  await kv.set(listKey, executionIds);

  return execution;
}

// Get single execution
export async function getExecution(executionId: string): Promise<ChatflowExecution | null> {
  const key = getExecutionKey(executionId);
  return await kv.get<ChatflowExecution>(key);
}

// Update execution
export async function updateExecution(
  executionId: string,
  updates: Partial<ChatflowExecution>,
): Promise<ChatflowExecution> {
  const execution = await getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const updatedExecution: ChatflowExecution = {
    ...execution,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const key = getExecutionKey(executionId);
  await kv.set(key, updatedExecution);

  return updatedExecution;
}

// Add node execution to history
export async function addNodeExecution(
  executionId: string,
  nodeExecution: NodeExecution,
): Promise<void> {
  const execution = await getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  execution.node_history.push(nodeExecution);
  execution.updated_at = new Date().toISOString();

  const key = getExecutionKey(executionId);
  await kv.set(key, execution);
}

// Update node execution in history
export async function updateNodeExecution(
  executionId: string,
  nodeId: string,
  updates: Partial<NodeExecution>,
): Promise<void> {
  const execution = await getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const nodeIndex = execution.node_history.findIndex(n => n.node_id === nodeId);
  if (nodeIndex === -1) {
    throw new Error('Node execution not found');
  }

  execution.node_history[nodeIndex] = {
    ...execution.node_history[nodeIndex],
    ...updates,
  };
  execution.updated_at = new Date().toISOString();

  const key = getExecutionKey(executionId);
  await kv.set(key, execution);
}

// Get executions by campaign
export async function getExecutionsByCampaign(campaignId: string): Promise<ChatflowExecution[]> {
  const listKey = getExecutionsListKey(campaignId);
  const executionIds = await kv.get<string[]>(listKey) || [];

  const executions: ChatflowExecution[] = [];
  for (const executionId of executionIds) {
    const execution = await getExecution(executionId);
    if (execution) {
      executions.push(execution);
    }
  }

  // Sort by created_at descending (newest first)
  executions.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return executions;
}

// Bulk retry executions
export async function bulkRetryExecutions(
  executionIds: string[],
  chatflow: any,
): Promise<BulkExecutionResult> {
  const result: BulkExecutionResult = {
    succeeded: [],
    failed: [],
  };

  for (const executionId of executionIds) {
    try {
      const execution = await getExecution(executionId);
      if (!execution) {
        result.failed.push({
          execution_id: executionId,
          error: 'Execution not found',
        });
        continue;
      }

      if (execution.status !== 'failed') {
        result.failed.push({
          execution_id: executionId,
          error: 'Only failed executions can be retried',
        });
        continue;
      }

      // Reset execution status
      await updateExecution(executionId, {
        status: 'pending',
        error_message: undefined,
        failed_at: undefined,
      });

      // Restart execution
      await startExecution(executionId, chatflow);

      result.succeeded.push(executionId);
    } catch (error) {
      result.failed.push({
        execution_id: executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

// Bulk pause executions
export async function bulkPauseExecutions(
  executionIds: string[],
): Promise<BulkExecutionResult> {
  const result: BulkExecutionResult = {
    succeeded: [],
    failed: [],
  };

  for (const executionId of executionIds) {
    try {
      const execution = await getExecution(executionId);
      if (!execution) {
        result.failed.push({
          execution_id: executionId,
          error: 'Execution not found',
        });
        continue;
      }

      if (execution.status !== 'running') {
        result.failed.push({
          execution_id: executionId,
          error: 'Only running executions can be paused',
        });
        continue;
      }

      await updateExecution(executionId, {
        status: 'paused',
        paused_at: new Date().toISOString(),
      });

      result.succeeded.push(executionId);
    } catch (error) {
      result.failed.push({
        execution_id: executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

// Bulk resume executions
export async function bulkResumeExecutions(
  executionIds: string[],
  chatflow: any,
): Promise<BulkExecutionResult> {
  const result: BulkExecutionResult = {
    succeeded: [],
    failed: [],
  };

  for (const executionId of executionIds) {
    try {
      const execution = await getExecution(executionId);
      if (!execution) {
        result.failed.push({
          execution_id: executionId,
          error: 'Execution not found',
        });
        continue;
      }

      if (execution.status !== 'paused') {
        result.failed.push({
          execution_id: executionId,
          error: 'Only paused executions can be resumed',
        });
        continue;
      }

      await updateExecution(executionId, {
        status: 'running',
        paused_at: undefined,
      });

      // Resume execution
      await resumeExecution(executionId, chatflow);

      result.succeeded.push(executionId);
    } catch (error) {
      result.failed.push({
        execution_id: executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

// Bulk cancel executions
export async function bulkCancelExecutions(
  executionIds: string[],
): Promise<BulkExecutionResult> {
  const result: BulkExecutionResult = {
    succeeded: [],
    failed: [],
  };

  for (const executionId of executionIds) {
    try {
      const execution = await getExecution(executionId);
      if (!execution) {
        result.failed.push({
          execution_id: executionId,
          error: 'Execution not found',
        });
        continue;
      }

      if (execution.status === 'completed' || execution.status === 'cancelled') {
        result.failed.push({
          execution_id: executionId,
          error: 'Execution already completed or cancelled',
        });
        continue;
      }

      await updateExecution(executionId, {
        status: 'cancelled',
      });

      result.succeeded.push(executionId);
    } catch (error) {
      result.failed.push({
        execution_id: executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

// Get messages by campaign
export async function getMessagesByCampaign(campaignId: string): Promise<MessageLog[]> {
  const listKey = getMessagesListKey(campaignId);
  const messageIds = await kv.get<string[]>(listKey) || [];

  const messages: MessageLog[] = [];
  for (const messageId of messageIds) {
    const message = await kv.get<MessageLog>(messageId);
    if (message) {
      messages.push(message);
    }
  }

  return messages;
}

// Get messages by execution
export async function getMessagesByExecution(executionId: string): Promise<MessageLog[]> {
  const listKey = getExecutionMessagesListKey(executionId);
  const messageIds = await kv.get<string[]>(listKey) || [];

  const messages: MessageLog[] = [];
  for (const messageId of messageIds) {
    const message = await kv.get<MessageLog>(messageId);
    if (message) {
      messages.push(message);
    }
  }

  // Sort by created_at ascending (chronological order)
  messages.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return messages;
}

// Forward declarations for execution engine functions
// These will be implemented in execution_engine.ts
export async function startExecution(executionId: string, chatflow: any): Promise<void> {
  // Import and call execution engine
  const { startExecution: engineStartExecution } = await import('./execution_engine.ts');
  await engineStartExecution(executionId, chatflow);
}

export async function resumeExecution(executionId: string, chatflow: any): Promise<void> {
  // Import and call execution engine
  const { resumeExecution: engineResumeExecution } = await import('./execution_engine.ts');
  await engineResumeExecution(executionId, chatflow);
}
