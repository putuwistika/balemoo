export type MessageType = 'template' | 'text' | 'form_question' | 'service';
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageLog {
  id: string;
  campaign_id: string;
  execution_id: string;
  guest_id: string;
  node_id: string;

  type: MessageType;
  template_id?: string;
  template_name?: string;
  content: string;
  variables?: Record<string, string>;

  // Delivery tracking
  status: MessageStatus;
  queued_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  error_message?: string;

  project_id: string;
  created_at: string;
}

export interface CreateMessageLogInput {
  campaign_id: string;
  execution_id: string;
  guest_id: string;
  node_id: string;
  type: MessageType;
  template_id?: string;
  template_name?: string;
  content: string;
  variables?: Record<string, string>;
  status?: MessageStatus;
}
