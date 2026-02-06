// WhatsApp Flow CRUD Operations for KV Store
// Follows the same pattern as chatflow_helpers.ts

interface WhatsAppFlowRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string; // 'draft' | 'published' | 'deprecated'
  flowJson: {
    version: string;
    screens: any[];
    data_api_version?: string;
    routing_model?: Record<string, string[]>;
  };
  version: string;
  projectId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface WhatsAppFlowTemplateRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  flowJson: any;
  isPublic: boolean;
  createdAt: string;
}

// Generate simple ID
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${randomness}`;
}

// List all WhatsApp flows with optional filters
export async function listFlows(
  kv: any,
  filters?: { status?: string; projectId?: string }
): Promise<WhatsAppFlowRecord[]> {
  try {
    const prefix = filters?.projectId
      ? `wa_flow:${filters.projectId}:`
      : 'wa_flow:';

    const results = await kv.getByPrefix(prefix);
    let flows: WhatsAppFlowRecord[] = [];

    for (const flow of results) {
      if (filters?.status && flow.status !== filters.status) {
        continue;
      }
      flows.push(flow as WhatsAppFlowRecord);
    }

    // Sort by updated date (newest first)
    flows.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return flows;
  } catch (error) {
    console.error('Error listing WhatsApp flows:', error);
    throw new Error('Failed to list WhatsApp flows');
  }
}

// Get single flow by ID
export async function getFlow(
  kv: any,
  id: string,
  projectId?: string
): Promise<WhatsAppFlowRecord | null> {
  try {
    // If projectId not provided, search across all projects
    if (!projectId) {
      const allFlows = await kv.getByPrefix('wa_flow:');
      for (const flow of allFlows) {
        if (flow.id === id) {
          return flow as WhatsAppFlowRecord;
        }
      }
      return null;
    }

    const key = `wa_flow:${projectId}:${id}`;
    const flow = await kv.get(key);
    return flow ? (flow as WhatsAppFlowRecord) : null;
  } catch (error) {
    console.error('Error getting WhatsApp flow:', error);
    return null;
  }
}

// Create new flow
export async function createFlow(
  kv: any,
  input: {
    name: string;
    description?: string;
    category?: string;
    projectId: string;
    flowJson?: any;
  },
  userId: string
): Promise<WhatsAppFlowRecord> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Flow name is required');
    }

    if (!input.projectId) {
      throw new Error('Project ID is required');
    }

    const id = generateId();
    const now = new Date().toISOString();

    const flow: WhatsAppFlowRecord = {
      id,
      name: input.name.trim(),
      description: input.description?.trim() || '',
      category: input.category || 'OTHER',
      status: 'draft',
      flowJson: input.flowJson || {
        version: '5.0',
        screens: [],
      },
      version: '5.0',
      projectId: input.projectId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    const key = `wa_flow:${input.projectId}:${id}`;
    await kv.set(key, flow);

    return flow;
  } catch (error) {
    console.error('Error creating WhatsApp flow:', error);
    throw error;
  }
}

// Create flow from template
export async function createFlowFromTemplate(
  kv: any,
  templateId: string,
  name: string,
  projectId: string,
  userId: string
): Promise<WhatsAppFlowRecord> {
  try {
    // Get template
    const template = await getTemplate(kv, templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return await createFlow(
      kv,
      {
        name,
        description: template.description,
        category: template.category,
        projectId,
        flowJson: JSON.parse(JSON.stringify(template.flowJson)), // Deep clone
      },
      userId
    );
  } catch (error) {
    console.error('Error creating flow from template:', error);
    throw error;
  }
}

// Update flow
export async function updateFlow(
  kv: any,
  id: string,
  updates: {
    name?: string;
    description?: string;
    category?: string;
    status?: string;
    flowJson?: any;
  },
  projectId?: string
): Promise<WhatsAppFlowRecord> {
  try {
    const existing = await getFlow(kv, id, projectId);
    if (!existing) {
      throw new Error('WhatsApp flow not found');
    }

    const updated: WhatsAppFlowRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const key = `wa_flow:${existing.projectId}:${id}`;
    await kv.set(key, updated);

    return updated;
  } catch (error) {
    console.error('Error updating WhatsApp flow:', error);
    throw error;
  }
}

// Delete flow
export async function deleteFlow(
  kv: any,
  id: string,
  projectId?: string
): Promise<void> {
  try {
    const existing = await getFlow(kv, id, projectId);
    if (!existing) {
      throw new Error('WhatsApp flow not found');
    }

    const key = `wa_flow:${existing.projectId}:${id}`;
    await kv.del(key);
  } catch (error) {
    console.error('Error deleting WhatsApp flow:', error);
    throw error;
  }
}

// Clone flow
export async function cloneFlow(
  kv: any,
  id: string,
  newName: string,
  userId: string,
  sourceProjectId: string,
  targetProjectId: string
): Promise<WhatsAppFlowRecord> {
  try {
    const original = await getFlow(kv, id, sourceProjectId);
    if (!original) {
      throw new Error('WhatsApp flow not found');
    }

    const cloneId = generateId();
    const now = new Date().toISOString();

    const cloned: WhatsAppFlowRecord = {
      ...original,
      id: cloneId,
      name: newName || `${original.name} (Copy)`,
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      projectId: targetProjectId,
      publishedAt: undefined,
    };

    const key = `wa_flow:${targetProjectId}:${cloneId}`;
    await kv.set(key, cloned);

    return cloned;
  } catch (error) {
    console.error('Error cloning WhatsApp flow:', error);
    throw error;
  }
}

// --- Template operations ---

// List all templates
export async function listTemplates(kv: any): Promise<WhatsAppFlowTemplateRecord[]> {
  try {
    const results = await kv.getByPrefix('wa_template:');
    const templates = results as WhatsAppFlowTemplateRecord[];
    templates.sort(
      (a: WhatsAppFlowTemplateRecord, b: WhatsAppFlowTemplateRecord) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return templates;
  } catch (error) {
    console.error('Error listing WhatsApp flow templates:', error);
    throw new Error('Failed to list templates');
  }
}

// Get single template by ID
export async function getTemplate(
  kv: any,
  id: string
): Promise<WhatsAppFlowTemplateRecord | null> {
  try {
    const key = `wa_template:${id}`;
    const template = await kv.get(key);
    return template ? (template as WhatsAppFlowTemplateRecord) : null;
  } catch (error) {
    console.error('Error getting template:', error);
    return null;
  }
}

// Seed default templates (run once)
export async function seedDefaultTemplates(kv: any): Promise<void> {
  try {
    // Check if templates already exist
    const existing = await listTemplates(kv);
    if (existing.length > 0) {
      return; // Already seeded
    }

    const rsvpTemplate: WhatsAppFlowTemplateRecord = {
      id: 'rsvp-template',
      name: 'RSVP Template',
      description:
        'Template untuk RSVP pernikahan atau event dengan konfirmasi kehadiran',
      category: 'OTHER',
      flowJson: {
        version: '5.0',
        screens: [
          {
            id: 'WELCOME',
            title: 'Welcome',
            terminal: false,
            data: {},
            layout: {
              type: 'SingleColumnLayout',
              children: [
                {
                  type: 'TextHeading',
                  text: 'RSVP untuk Pernikahan Kami',
                },
                {
                  type: 'TextBody',
                  text: 'Mohon isi data kehadiran Anda',
                },
                {
                  type: 'Footer',
                  label: 'Mulai',
                  'on-click-action': {
                    name: 'navigate',
                    next: { type: 'screen', name: 'GUEST_INFO' },
                    payload: {},
                  },
                },
              ],
            },
          },
          {
            id: 'GUEST_INFO',
            title: 'Informasi Tamu',
            terminal: false,
            data: {
              guest_name: { type: 'string', __example__: 'John Doe' },
              phone: { type: 'string', __example__: '+628123456789' },
              email: { type: 'string', __example__: 'john@example.com' },
            },
            layout: {
              type: 'SingleColumnLayout',
              children: [
                { type: 'TextHeading', text: 'Informasi Tamu' },
                {
                  type: 'TextInput',
                  name: 'guest_name',
                  label: 'Nama Lengkap',
                  required: true,
                  'input-type': 'text',
                },
                {
                  type: 'TextInput',
                  name: 'phone',
                  label: 'Nomor Telepon',
                  required: true,
                  'input-type': 'phone',
                },
                {
                  type: 'TextInput',
                  name: 'email',
                  label: 'Email',
                  required: false,
                  'input-type': 'email',
                },
                {
                  type: 'Footer',
                  label: 'Lanjut',
                  'on-click-action': {
                    name: 'navigate',
                    next: { type: 'screen', name: 'ATTENDANCE' },
                    payload: {},
                  },
                },
              ],
            },
          },
          {
            id: 'ATTENDANCE',
            title: 'Konfirmasi Kehadiran',
            terminal: false,
            data: {
              attendance: { type: 'string', __example__: 'yes' },
              guest_count: { type: 'number', __example__: 2 },
            },
            layout: {
              type: 'SingleColumnLayout',
              children: [
                { type: 'TextHeading', text: 'Konfirmasi Kehadiran' },
                {
                  type: 'RadioButtonsGroup',
                  name: 'attendance',
                  label: 'Apakah Anda akan hadir?',
                  required: true,
                  'data-source': [
                    { id: 'yes', title: 'Ya, saya akan hadir' },
                    { id: 'no', title: 'Maaf, saya tidak bisa hadir' },
                  ],
                },
                {
                  type: 'TextInput',
                  name: 'guest_count',
                  label: 'Jumlah Tamu',
                  required: false,
                  'input-type': 'number',
                  'helper-text': 'Termasuk Anda',
                },
                {
                  type: 'Footer',
                  label: 'Lanjut',
                  'on-click-action': {
                    name: 'navigate',
                    next: { type: 'screen', name: 'CONFIRMATION' },
                    payload: {},
                  },
                },
              ],
            },
          },
          {
            id: 'CONFIRMATION',
            title: 'Konfirmasi',
            terminal: true,
            success: true,
            data: {},
            layout: {
              type: 'SingleColumnLayout',
              children: [
                { type: 'TextHeading', text: 'Terima Kasih!' },
                { type: 'TextBody', text: 'RSVP Anda telah kami terima' },
                {
                  type: 'TextCaption',
                  text: 'Kami tunggu kehadiran Anda',
                },
                {
                  type: 'Footer',
                  label: 'Selesai',
                  'on-click-action': {
                    name: 'complete',
                    payload: {
                      guest_name: '${form.guest_name}',
                      phone: '${form.phone}',
                      email: '${form.email}',
                      attendance: '${form.attendance}',
                      guest_count: '${form.guest_count}',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      isPublic: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`wa_template:${rsvpTemplate.id}`, rsvpTemplate);
    console.log('Seeded default WhatsApp flow templates');
  } catch (error) {
    console.error('Error seeding templates:', error);
  }
}
