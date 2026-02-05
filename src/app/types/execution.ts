import { NodeType } from './chatflow';

export type ExecutionStatus =
  | 'pending'
  | 'pending_session'      // NEW: Waiting for another campaign's session to open
  | 'queued'               // NEW: Queued to run after current execution
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type NodeExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'waiting';

// Per-Guest Chatflow Execution
export interface ChatflowExecution {
  id: string;
  campaign_id: string;
  guest_id: string;
  guest_name: string;
  guest_phone: string;
  chatflow_id: string;

  // Status
  status: ExecutionStatus;
  current_node_id?: string;              // Where guest is in the flow
  current_phase?: string;                // "Blasting Phase", "Response Phase", etc.

  // Timeline
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
  failed_at?: string;

  // Context
  variables: Record<string, any>;         // Runtime variables (replies, form data, etc.)
  error_message?: string;

  // Tracking
  node_history: NodeExecution[];          // All node executions

  // Metadata
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Individual Node Execution
export interface NodeExecution {
  node_id: string;
  node_type: NodeType;
  node_label: string;

  status: NodeExecutionStatus;

  // Timestamps
  started_at?: string;
  completed_at?: string;

  // Node-specific data
  input?: any;
  output?: any;
  error?: string;

  // For wait_reply nodes
  waiting_since?: string;
  timeout_at?: string;
  reply_received?: string;

  // For condition nodes
  condition_result?: boolean;

  // For guest_form nodes
  form_responses?: Record<string, any>;

  retry_count?: number;
}

export interface ExecutionSummary {
  execution_id: string;
  guest_id: string;
  guest_name: string;
  guest_phone: string;
  status: ExecutionStatus;
  current_phase: string;                  // "Blasting Phase", "Waiting for Reply", etc.
  progress_percentage: number;            // 0-100
  last_activity: string;
  nodes_completed: number;
  nodes_total: number;
}

export interface BulkExecutionAction {
  execution_ids: string[];
  action: 'retry' | 'pause' | 'resume' | 'cancel';
}

export interface BulkExecutionResult {
  succeeded: string[];
  failed: Array<{
    execution_id: string;
    error: string;
  }>;
}
