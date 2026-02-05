import * as kv from "./kv_store.ts";
import * as executionHelpers from "./execution_helpers.ts";
import * as messageHelpers from "./message_helpers.ts";
import * as sessionHelpers from "./session_helpers.ts";
import type { ChatflowExecution, NodeExecution, NodeExecutionStatus } from "../../../src/app/types/execution.ts";
import type { Chatflow, ChatflowNode, NodeType } from "../../../src/app/types/chatflow.ts";
import type { Template } from "../../../src/app/types/template.ts";

// Start execution
export async function startExecution(executionId: string, chatflow: Chatflow): Promise<void> {
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  if (execution.status !== 'pending') {
    throw new Error('Only pending executions can be started');
  }

  try {
    // Update status to running
    await executionHelpers.updateExecution(executionId, {
      status: 'running',
      started_at: new Date().toISOString(),
    });

    // Find trigger node
    const triggerNode = chatflow.nodes.find(n => n.type === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in chatflow');
    }

    // Create session for guest
    await sessionHelpers.createOrUpdateSession({
      guest_id: execution.guest_id,
      guest_phone: execution.guest_phone,
      campaign_id: execution.campaign_id,
      execution_id: execution.id,
      current_node_id: triggerNode.id,
    });

    // Execute from trigger node
    await executeNode(executionId, chatflow, triggerNode);
  } catch (error) {
    console.error(`Execution ${executionId} failed:`, error);
    await executionHelpers.updateExecution(executionId, {
      status: 'failed',
      failed_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Resume execution
export async function resumeExecution(executionId: string, chatflow: Chatflow): Promise<void> {
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  if (execution.status !== 'running') {
    throw new Error('Only running executions can be resumed');
  }

  if (!execution.current_node_id) {
    throw new Error('No current node to resume from');
  }

  const currentNode = chatflow.nodes.find(n => n.id === execution.current_node_id);
  if (!currentNode) {
    throw new Error('Current node not found in chatflow');
  }

  try {
    // Continue from current node
    await executeNode(executionId, chatflow, currentNode);
  } catch (error) {
    console.error(`Resume execution ${executionId} failed:`, error);
    await executionHelpers.updateExecution(executionId, {
      status: 'failed',
      failed_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Execute a single node
async function executeNode(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  // Check if execution is paused
  if (execution.status === 'paused') {
    console.log(`Execution ${executionId} paused, stopping`);
    return;
  }

  // Update current node
  await executionHelpers.updateExecution(executionId, {
    current_node_id: node.id,
    current_phase: getNodePhase(node.type),
  });

  // Create node execution record
  const nodeExecution: NodeExecution = {
    node_id: node.id,
    node_type: node.type,
    node_label: node.data.label || node.type,
    status: 'running',
    started_at: new Date().toISOString(),
  };

  await executionHelpers.addNodeExecution(executionId, nodeExecution);

  try {
    // Execute node based on type
    switch (node.type) {
      case 'trigger':
        await executeTrigger(executionId, chatflow, node);
        break;
      case 'send_template':
        await executeSendTemplate(executionId, chatflow, node);
        break;
      case 'wait_reply':
        await executeWaitReply(executionId, chatflow, node);
        break;
      case 'condition':
        await executeCondition(executionId, chatflow, node);
        break;
      case 'delay':
        await executeDelay(executionId, chatflow, node);
        break;
      case 'guest_form':
        await executeGuestForm(executionId, chatflow, node);
        break;
      case 'update_guest':
        await executeUpdateGuest(executionId, chatflow, node);
        break;
      case 'end':
        await executeEnd(executionId, chatflow, node);
        break;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }

    // Mark node as completed
    await executionHelpers.updateNodeExecution(executionId, node.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Node ${node.id} execution failed:`, error);
    await executionHelpers.updateNodeExecution(executionId, node.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completed_at: new Date().toISOString(),
    });
    throw error;
  }
}

// Get phase name based on node type
function getNodePhase(nodeType: NodeType): string {
  switch (nodeType) {
    case 'trigger':
    case 'send_template':
      return 'Blasting Phase';
    case 'wait_reply':
    case 'guest_form':
      return 'Response Phase';
    case 'condition':
      return 'Processing Phase';
    case 'delay':
    case 'update_guest':
      return 'Follow-up Phase';
    case 'end':
      return 'Completion';
    default:
      return 'Unknown Phase';
  }
}

// Execute trigger node
async function executeTrigger(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  // Trigger node just passes through to next node
  const nextNode = getNextNode(chatflow, node);
  if (nextNode) {
    await executeNode(executionId, chatflow, nextNode);
  }
}

// Execute send_template node
async function executeSendTemplate(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const config = node.data.config;

  // Get template
  const template = await kv.get<Template>(`template:${execution.project_id}:${config.templateId}`);
  if (!template) {
    throw new Error(`Template ${config.templateId} not found`);
  }

  // Render template with variables
  let content = template.content;
  if (config.variables) {
    for (const [varName, varValue] of Object.entries(config.variables)) {
      // Replace variables in template
      // varValue can reference execution variables using {{variable_name}}
      let resolvedValue = varValue;
      if (varValue.startsWith('{{') && varValue.endsWith('}}')) {
        const variableName = varValue.slice(2, -2);
        resolvedValue = execution.variables[variableName] || varValue;
      }
      content = content.replace(new RegExp(`{{${varName}}}`, 'g'), resolvedValue);
    }
  }

  // Create message log
  const message = await messageHelpers.createMessageLog({
    campaign_id: execution.campaign_id,
    execution_id: execution.id,
    guest_id: execution.guest_id,
    node_id: node.id,
    type: 'template',
    template_id: template.id,
    template_name: template.name,
    content: content,
    variables: config.variables,
    status: 'queued',
  });

  // Simulate sending message (Phase 1)
  await messageHelpers.simulateSendMessage(message.id);

  // Store message ID in node execution output
  await executionHelpers.updateNodeExecution(executionId, node.id, {
    output: { message_id: message.id },
  });

  // Continue to next node
  const nextNode = getNextNode(chatflow, node);
  if (nextNode) {
    await executeNode(executionId, chatflow, nextNode);
  }
}

// Execute wait_reply node
async function executeWaitReply(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  const config = node.data.config;
  const now = new Date();
  const timeoutAt = config.timeout
    ? new Date(now.getTime() + config.timeout * 1000)
    : null;

  // Update node execution to waiting status
  await executionHelpers.updateNodeExecution(executionId, node.id, {
    status: 'waiting',
    waiting_since: now.toISOString(),
    timeout_at: timeoutAt?.toISOString(),
  });

  // Update session to mark waiting for reply
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const session = await sessionHelpers.getActiveSessionForGuest(execution.guest_id);
  if (session) {
    await sessionHelpers.updateSession(session.id, {
      waiting_for_reply: true,
      current_node_id: node.id,
    });
  }

  // Note: In Phase 1, we simulate the wait
  // In production, this would set up a webhook handler and timeout scheduler
  console.log(`Execution ${executionId} waiting for reply at node ${node.id}`);

  // For Phase 1, we'll simulate a timeout after configured seconds
  // In production, this would be handled by a scheduler
  if (config.timeout && config.timeoutAction) {
    // Don't actually wait - just log it
    console.log(`Timeout configured: ${config.timeout}s, action: ${config.timeoutAction}`);
  }

  // Don't continue to next node - wait for reply
  // In production, the reply handler would call continueAfterReply()
}

// Execute condition node
async function executeCondition(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const config = node.data.config;
  const variableValue = execution.variables[config.variable];
  const compareValue = config.value;

  let result = false;

  switch (config.operator) {
    case 'equals':
      if (config.caseSensitive === false) {
        result = String(variableValue).toLowerCase() === compareValue.toLowerCase();
      } else {
        result = String(variableValue) === compareValue;
      }
      break;
    case 'not_equals':
      if (config.caseSensitive === false) {
        result = String(variableValue).toLowerCase() !== compareValue.toLowerCase();
      } else {
        result = String(variableValue) !== compareValue;
      }
      break;
    case 'contains':
      if (config.caseSensitive === false) {
        result = String(variableValue).toLowerCase().includes(compareValue.toLowerCase());
      } else {
        result = String(variableValue).includes(compareValue);
      }
      break;
    case 'matches':
      const regex = new RegExp(compareValue, config.caseSensitive === false ? 'i' : '');
      result = regex.test(String(variableValue));
      break;
  }

  // Store result in node execution
  await executionHelpers.updateNodeExecution(executionId, node.id, {
    condition_result: result,
  });

  // Get next node based on result
  const sourceHandle = result ? 'true' : 'false';
  const nextNode = getNextNode(chatflow, node, sourceHandle);

  if (nextNode) {
    await executeNode(executionId, chatflow, nextNode);
  } else {
    // No next node - end execution
    await executeEnd(executionId, chatflow, node);
  }
}

// Execute delay node
async function executeDelay(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  const config = node.data.config;

  // Convert delay to milliseconds
  let delayMs = config.duration;
  switch (config.unit) {
    case 'seconds':
      delayMs = config.duration * 1000;
      break;
    case 'minutes':
      delayMs = config.duration * 60 * 1000;
      break;
    case 'hours':
      delayMs = config.duration * 60 * 60 * 1000;
      break;
    case 'days':
      delayMs = config.duration * 24 * 60 * 60 * 1000;
      break;
  }

  console.log(`Execution ${executionId} delaying for ${delayMs}ms`);

  // For Phase 1, we simulate delay (don't actually wait)
  // In production, this would schedule the next node execution
  // await new Promise(resolve => setTimeout(resolve, delayMs));

  // Continue to next node
  const nextNode = getNextNode(chatflow, node);
  if (nextNode) {
    await executeNode(executionId, chatflow, nextNode);
  }
}

// Execute guest_form node
async function executeGuestForm(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  // For Phase 1, we simulate form collection
  // In production, this would send questions one by one and wait for replies

  console.log(`Execution ${executionId} collecting guest form at node ${node.id}`);

  // Mark as waiting
  await executionHelpers.updateNodeExecution(executionId, node.id, {
    status: 'waiting',
    waiting_since: new Date().toISOString(),
  });

  // Update session
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const session = await sessionHelpers.getActiveSessionForGuest(execution.guest_id);
  if (session) {
    await sessionHelpers.updateSession(session.id, {
      waiting_for_reply: true,
      current_node_id: node.id,
    });
  }

  // Don't continue - wait for form completion
  console.log(`Guest form waiting for completion`);
}

// Execute update_guest node
async function executeUpdateGuest(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  const execution = await executionHelpers.getExecution(executionId);
  if (!execution) {
    throw new Error('Execution not found');
  }

  const config = node.data.config;

  // Update guest record
  const guest = await kv.get(`guest:${execution.project_id}:${execution.guest_id}`);
  if (guest) {
    const updates: any = {};

    // Apply updates from config
    if (config.rsvp_status) {
      updates.rsvp_status = config.rsvp_status;
      updates.rsvp_at = new Date().toISOString();
    }

    if (config.tags) {
      updates.tags = [...new Set([...guest.tags, ...config.tags])];
    }

    if (config.plus_one_confirmed !== undefined) {
      updates.plus_one_confirmed = config.plus_one_confirmed;
    }

    const updatedGuest = { ...guest, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`guest:${execution.project_id}:${execution.guest_id}`, updatedGuest);

    // Store in execution variables
    await executionHelpers.updateExecution(executionId, {
      variables: {
        ...execution.variables,
        ...updates,
      },
    });
  }

  // Continue to next node
  const nextNode = getNextNode(chatflow, node);
  if (nextNode) {
    await executeNode(executionId, chatflow, nextNode);
  }
}

// Execute end node
async function executeEnd(
  executionId: string,
  chatflow: Chatflow,
  node: ChatflowNode,
): Promise<void> {
  // Mark execution as completed
  await executionHelpers.updateExecution(executionId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    current_phase: 'Completion',
  });

  // Close session
  const execution = await executionHelpers.getExecution(executionId);
  if (execution) {
    const session = await sessionHelpers.getActiveSessionForGuest(execution.guest_id);
    if (session) {
      await sessionHelpers.deleteSession(session.id);
    }
  }

  console.log(`Execution ${executionId} completed`);
}

// Get next node in flow
function getNextNode(
  chatflow: Chatflow,
  currentNode: ChatflowNode,
  sourceHandle?: string,
): ChatflowNode | null {
  // Find edge from current node
  const edge = chatflow.edges.find(e => {
    if (sourceHandle) {
      return e.source === currentNode.id && e.sourceHandle === sourceHandle;
    }
    return e.source === currentNode.id;
  });

  if (!edge) {
    return null;
  }

  // Find target node
  const nextNode = chatflow.nodes.find(n => n.id === edge.target);
  return nextNode || null;
}
