/* Template Management Helper Functions */

import * as kv from "./kv_store.ts";

// TypeScript Interfaces
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

// Variable Extraction
export function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = text.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

// Validation Functions
export function validateTemplateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Template name is required' };
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Template name must be 50 characters or less' };
  }
  
  if (!/^[a-z0-9_]+$/.test(name)) {
    return { valid: false, error: 'Template name can only contain lowercase letters, numbers, and underscores' };
  }
  
  return { valid: true };
}

export function validateTemplateBody(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Template body is required' };
  }
  
  if (text.length > 1024) {
    return { valid: false, error: 'Template body must be 1024 characters or less' };
  }
  
  const variables = extractVariables(text);
  if (variables.length > 10) {
    return { valid: false, error: 'Maximum 10 variables allowed per template' };
  }
  
  return { valid: true };
}

export function validateTemplate(template: Partial<WhatsAppTemplate>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate name
  if (template.name) {
    const nameValidation = validateTemplateName(template.name);
    if (!nameValidation.valid) {
      errors.push(nameValidation.error!);
    }
  } else {
    errors.push('Template name is required');
  }
  
  // Validate category
  if (!template.category) {
    errors.push('Template category is required');
  } else if (!['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(template.category)) {
    errors.push('Invalid template category');
  }
  
  // Validate language
  if (!template.language) {
    errors.push('Template language is required');
  } else if (!['id', 'en', 'id_en'].includes(template.language)) {
    errors.push('Invalid language');
  }
  
  // Validate body
  if (template.content?.body?.text) {
    const bodyValidation = validateTemplateBody(template.content.body.text);
    if (!bodyValidation.valid) {
      errors.push(bodyValidation.error!);
    }
  } else {
    errors.push('Template body text is required');
  }
  
  // Validate buttons
  if (template.content?.buttons && template.content.buttons.length > 3) {
    errors.push('Maximum 3 buttons allowed per template');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// KV Store Operations
export async function getAllTemplates(): Promise<WhatsAppTemplate[]> {
  try {
    const templateIds = await kv.get('templates:all') || [];
    const templates: WhatsAppTemplate[] = [];
    
    for (const id of templateIds) {
      const template = await kv.get(`template:${id}`);
      if (template) {
        templates.push(template);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching all templates:', error);
    return [];
  }
}

export async function getTemplateById(id: string): Promise<WhatsAppTemplate | null> {
  try {
    const template = await kv.get(`template:${id}`);
    return template || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export async function getTemplatesByStatus(status: string): Promise<WhatsAppTemplate[]> {
  try {
    const templateIds = await kv.get(`templates:status:${status}`) || [];
    const templates: WhatsAppTemplate[] = [];
    
    for (const id of templateIds) {
      const template = await kv.get(`template:${id}`);
      if (template && template.status === status) {
        templates.push(template);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching templates by status:', error);
    return [];
  }
}

export async function saveTemplate(template: WhatsAppTemplate): Promise<void> {
  try {
    // Save template object
    await kv.set(`template:${template.id}`, template);
    
    // Add to all templates list
    const allTemplates = await kv.get('templates:all') || [];
    if (!allTemplates.includes(template.id)) {
      allTemplates.push(template.id);
      await kv.set('templates:all', allTemplates);
    }
    
    // Add to status-specific list
    const statusTemplates = await kv.get(`templates:status:${template.status}`) || [];
    if (!statusTemplates.includes(template.id)) {
      statusTemplates.push(template.id);
      await kv.set(`templates:status:${template.status}`, statusTemplates);
    }
    
    // Add to project-specific list if projectId exists
    if (template.projectId) {
      const projectTemplates = await kv.get(`templates:project:${template.projectId}`) || [];
      if (!projectTemplates.includes(template.id)) {
        projectTemplates.push(template.id);
        await kv.set(`templates:project:${template.projectId}`, projectTemplates);
      }
    }
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

export async function updateTemplateStatus(
  id: string, 
  oldStatus: string, 
  newStatus: string
): Promise<void> {
  try {
    // Remove from old status list
    const oldStatusTemplates = await kv.get(`templates:status:${oldStatus}`) || [];
    const updatedOldList = oldStatusTemplates.filter((tid: string) => tid !== id);
    await kv.set(`templates:status:${oldStatus}`, updatedOldList);
    
    // Add to new status list
    const newStatusTemplates = await kv.get(`templates:status:${newStatus}`) || [];
    if (!newStatusTemplates.includes(id)) {
      newStatusTemplates.push(id);
      await kv.set(`templates:status:${newStatus}`, newStatusTemplates);
    }
  } catch (error) {
    console.error('Error updating template status:', error);
    throw error;
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    const template = await getTemplateById(id);
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Remove from all templates list
    const allTemplates = await kv.get('templates:all') || [];
    const updatedAll = allTemplates.filter((tid: string) => tid !== id);
    await kv.set('templates:all', updatedAll);
    
    // Remove from status list
    const statusTemplates = await kv.get(`templates:status:${template.status}`) || [];
    const updatedStatus = statusTemplates.filter((tid: string) => tid !== id);
    await kv.set(`templates:status:${template.status}`, updatedStatus);
    
    // Remove from project list if exists
    if (template.projectId) {
      const projectTemplates = await kv.get(`templates:project:${template.projectId}`) || [];
      const updatedProject = projectTemplates.filter((tid: string) => tid !== id);
      await kv.set(`templates:project:${template.projectId}`, updatedProject);
    }
    
    // Delete template object
    await kv.del(`template:${id}`);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

// Dummy META Integration
export function generateMetaTemplateId(): string {
  return `META_${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
}

export async function simulateMetaApproval(templateId: string): Promise<void> {
  // For DEMO: Instant approval (no delay)
  // await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const template = await getTemplateById(templateId);
    if (!template) {
      console.error('Template not found for approval:', templateId);
      return;
    }
    
    // Only approve if still in PENDING status
    if (template.status !== 'PENDING') {
      console.log('Template status changed during approval simulation:', template.status);
      return;
    }
    
    // Update template to APPROVED (instant for demo)
    const oldStatus = template.status;
    template.status = 'APPROVED';
    template.approvedAt = new Date().toISOString();
    template.updatedAt = new Date().toISOString();
    
    await saveTemplate(template);
    await updateTemplateStatus(templateId, oldStatus, 'APPROVED');
    
    console.log(`✅ Template ${templateId} auto-approved INSTANTLY (DEMO mode)`);
  } catch (error) {
    console.error('Error in simulateMetaApproval:', error);
  }
}
