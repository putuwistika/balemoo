// Chatflow Types for Kabar.in

export type NodeType = 
  | 'trigger'           // Start conversation
  | 'send_template'     // Send WhatsApp template
  | 'wait_reply'        // Wait for user response
  | 'condition'         // Branch based on conditions
  | 'delay'             // Wait for X seconds/minutes
  | 'guest_form'        // Collect guest information with questions
  | 'update_guest'      // Update guest info/tags
  | 'end';              // End conversation

export type TriggerType = 'keyword' | 'welcome' | 'manual';
export type ConditionOperator = 'equals' | 'contains' | 'matches' | 'not_equals';
export type DelayUnit = 'seconds' | 'minutes' | 'hours' | 'days';
export type QuestionType = 'text' | 'number' | 'choice';

// Node Configuration Interfaces
export interface TriggerConfig {
  type: TriggerType;
  keyword?: string;           // For keyword triggers
  description?: string;
}

export interface SendTemplateConfig {
  templateId: string;         // References WhatsAppTemplate.id (APPROVED only)
  templateName: string;       // For display
  variables?: Record<string, string>; // Map variable names to values/guest fields
}

export interface WaitReplyConfig {
  timeout?: number;           // Seconds before timeout
  timeoutAction?: 'continue' | 'end'; // What to do on timeout
  saveAs?: string;            // Variable name to store reply
  // Validation settings
  expectedValues?: string[];  // Array of valid values (e.g., ["yes", "no", "hadir"])
  retryMessage?: string;      // Message to send when input is invalid
  maxRetries?: number;        // Max retry attempts (default 3)
  caseSensitive?: boolean;    // Case sensitive validation (default false)
  // Fallback action after max retries
  fallbackAction?: 'continue' | 'end' | 'wait_again'; // What to do after max retries (default: end)
  fallbackMessage?: string;   // Message to send before fallback action (e.g., "Hubungi CS: +62xxx")
}

export interface ConditionConfig {
  variable: string;           // Variable to check (e.g., "lastReply")
  operator: ConditionOperator;
  value: string;              // Value to compare
  caseSensitive?: boolean;
}

export interface DelayConfig {
  duration: number;
  unit: DelayUnit;
}

// ==========================================
// GUEST FORM NODE TYPES
// ==========================================

export interface FormQuestion {
  id: string;                    // unique id: "q_123456"
  question: string;              // "Siapa nama lengkap Anda?"
  type: QuestionType;
  variableName: string;          // "nama" - akan jadi {{nama}}
  required: boolean;
  
  // For 'number' type
  min?: number;
  max?: number;
  
  // For 'choice' type  
  options?: string[];            // ["Halal", "Vegetarian", "Tidak ada"]
  
  // Message settings
  promptMessage?: string;        // Custom message to ask this question
  errorMessage?: string;         // "Jawaban tidak valid"
}

export interface GuestFormConfig {
  questions: FormQuestion[];
  
  // Confirmation settings
  enableConfirmation: boolean;
  confirmationMessage?: string;  // "Data: {{nama}}, {{jumlah}}. Benar? (Ya/Tidak)"
  confirmYesKeywords: string[];  // ["ya", "benar", "ok", "sudah"]
  confirmNoKeywords: string[];   // ["tidak", "salah", "ulang", "bukan"]
  
  // Per-question retry (when answer invalid)
  maxQuestionRetries: number;    // default 3
  
  // Confirmation retry (when answer "Tidak")  
  maxConfirmRetries: number;     // default 3
  
  // After all retries exhausted
  onMaxRetry: {
    sendCSMessage: boolean;
    csMessage?: string;          // "Hubungi CS: +62812xxx"
    action: 'end' | 'jump_to_node';
    jumpToNodeId?: string;       // target node ID for restart
  };
}

// ==========================================
// UPDATE GUEST CONFIG (Enhanced)
// ==========================================

export interface VariableMapping {
  sourceVariable: string;        // dari Guest Form: "nama"
  targetField: 'name' | 'phone' | 'email' | 'plus_one_count' | 'tags' | 'notes' | 'rsvp_status' | 'table_number' | 'custom';
  customFieldName?: string;      // jika targetField = 'custom'
}

export interface UpdateGuestConfig {
  action: 'add_tag' | 'remove_tag' | 'update_rsvp' | 'update_field' | 'map_from_variables';
  
  // For 'map_from_variables'
  variableMappings?: VariableMapping[];
  
  // Existing fields
  tagName?: string;
  rsvpStatus?: string;
  fieldName?: string;
  fieldValue?: string;
}

// Node Data Structure (compatible with React Flow)
export interface ChatflowNodeData {
  label: string;            // Display name
  config: TriggerConfig 
        | SendTemplateConfig 
        | WaitReplyConfig 
        | ConditionConfig 
        | DelayConfig 
        | GuestFormConfig 
        | UpdateGuestConfig 
        | null;
}

export interface ChatflowNode {
  id: string;                 // Unique node ID
  type: NodeType;
  position: { x: number; y: number };
  data: ChatflowNodeData;
}

// Edge/Connection
export interface ChatflowEdge {
  id: string;
  source: string;             // Source node ID
  target: string;             // Target node ID
  sourceHandle?: string;      // For condition nodes (true/false), guest_form (confirmed/max_retry)
  targetHandle?: string;
  label?: string;             // Optional label on arrow
  type?: 'default' | 'smoothstep' | 'step';
  // For ghost edges (jump indicators)
  data?: {
    isGhost?: boolean;        // True for jump indicator edges
  };
}

// Main Chatflow
export interface Chatflow {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: ChatflowNode[];
  edges: ChatflowEdge[];
  variables: string[];        // List of variable names used
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  lastTestedAt?: string;
  testResults?: TestResult;
}

// Simulation/Testing
export interface TestResult {
  success: boolean;
  executedAt: string;
  steps: TestStep[];
  errors?: string[];
}

export interface TestStep {
  nodeId: string;
  nodeName: string;
  action: string;
  result: 'success' | 'error' | 'skipped';
  message?: string;
  timestamp: string;
}

export interface CreateChatflowInput {
  name: string;
  description?: string;
  projectId: string;
}

export interface UpdateChatflowInput {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'archived';
  nodes?: ChatflowNode[];
  edges?: ChatflowEdge[];
  variables?: string[];
}

export type ChatflowStatus = 'draft' | 'active' | 'paused' | 'archived';
