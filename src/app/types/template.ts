// Template Management Types

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'CALL_TO_ACTION' | 'URL';
  text: string;
  phoneNumber?: string;
  url?: string;
  urlType?: 'STATIC' | 'DYNAMIC';
  example?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: 'id' | 'en' | 'id_en';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  
  content: {
    header?: {
      type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
      text?: string;
      example?: string;
    };
    body: {
      text: string;
      examples?: string[];
    };
    footer?: {
      text: string;
    };
    buttons?: TemplateButton[];
  };
  
  variables: string[];
  
  metaTemplateId?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  
  projectId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateLanguage = 'id' | 'en' | 'id_en';

export interface CreateTemplateInput {
  name: string;
  category: TemplateCategory;
  language: TemplateLanguage;
  content: WhatsAppTemplate['content'];
  projectId?: string;
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  status?: TemplateStatus;
}
