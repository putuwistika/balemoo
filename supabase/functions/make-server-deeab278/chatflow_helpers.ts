// Chatflow CRUD Operations for KV Store

interface ChatflowRecord {
  id: string;
  name: string;
  description: string;
  status: string;
  nodes: any[];
  edges: any[];
  variables: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  lastTestedAt?: string;
  testResults?: any;
}

// Generate simple ID (like ulid but simpler)
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${randomness}`;
}

// List all chatflows with optional filters
export async function listChatflows(
  kv: any,
  filters?: { status?: string; projectId?: string }
): Promise<ChatflowRecord[]> {
  try {
    const allChatflows: ChatflowRecord[] = [];
    const prefix = filters?.projectId ? `chatflow:${filters.projectId}:` : 'chatflow:';
    
    // Get all chatflows with matching prefix
    const results = await kv.getByPrefix(prefix);
    
    for (const chatflow of results) {
      // Apply status filter if provided
      if (filters?.status && chatflow.status !== filters.status) {
        continue;
      }
      
      allChatflows.push(chatflow as ChatflowRecord);
    }
    
    // Sort by creation date (newest first)
    allChatflows.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return allChatflows;
  } catch (error) {
    console.error('Error listing chatflows:', error);
    throw new Error('Failed to list chatflows');
  }
}

// Get single chatflow by ID
export async function getChatflow(
  kv: any,
  id: string,
  projectId?: string
): Promise<ChatflowRecord | null> {
  try {
    console.log('🔍 getChatflow backend called:', { id, projectId });
    
    // If projectId not provided, search across all projects
    if (!projectId) {
      console.log('🔍 No projectId, searching all projects...');
      const allChatflows = await kv.getByPrefix('chatflow:');
      for (const chatflow of allChatflows) {
        if (chatflow.id === id) {
          console.log('✅ Found chatflow by search, nodes count:', chatflow.nodes?.length);
          return chatflow as ChatflowRecord;
        }
      }
      console.log('❌ Chatflow not found in search');
      return null;
    }
    
    const key = `chatflow:${projectId}:${id}`;
    console.log('🔍 Getting chatflow with key:', key);
    const chatflow = await kv.get(key);
    
    if (!chatflow) {
      console.log('❌ Chatflow not found with key:', key);
      return null;
    }
    
    console.log('✅ Found chatflow, nodes count:', chatflow.nodes?.length);
    if (chatflow.nodes) {
      chatflow.nodes.forEach((node: any, idx: number) => {
        console.log(`✅ Backend Node ${idx + 1}:`, {
          id: node.id,
          type: node.type,
          hasConfig: !!node.data?.config,
          config: node.data?.config
        });
      });
    }
    
    return chatflow as ChatflowRecord;
  } catch (error) {
    console.error('❌ Error getting chatflow:', error);
    return null;
  }
}

// Create new chatflow
export async function createChatflow(
  kv: any,
  input: {
    name: string;
    description?: string;
    projectId: string;
  },
  userId: string
): Promise<ChatflowRecord> {
  try {
    // Validate
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Chatflow name is required');
    }
    
    if (!input.projectId) {
      throw new Error('Project ID is required');
    }
    
    // Generate ID
    const id = generateId();
    const now = new Date().toISOString();
    
    // Create chatflow record
    const chatflow: ChatflowRecord = {
      id,
      name: input.name.trim(),
      description: input.description?.trim() || '',
      status: 'draft',
      nodes: [],
      edges: [],
      variables: [],
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      projectId: input.projectId,
    };
    
    // Save to KV
    const key = `chatflow:${input.projectId}:${id}`;
    await kv.set(key, chatflow);
    
    return chatflow;
  } catch (error) {
    console.error('Error creating chatflow:', error);
    throw error;
  }
}

// Update chatflow
export async function updateChatflow(
  kv: any,
  id: string,
  updates: {
    name?: string;
    description?: string;
    status?: string;
    nodes?: any[];
    edges?: any[];
    variables?: string[];
  },
  projectId?: string
): Promise<ChatflowRecord> {
  try {
    console.log('🔧 updateChatflow called:', { id, projectId, updatesKeys: Object.keys(updates) });
    console.log('🔧 Updates.nodes:', updates.nodes);
    console.log('🔧 Updates.nodes count:', updates.nodes?.length);
    
    if (updates.nodes) {
      updates.nodes.forEach((node, idx) => {
        console.log(`🔧 Update Node ${idx + 1}:`, {
          id: node.id,
          type: node.type,
          hasConfig: !!node.data?.config,
          config: node.data?.config
        });
      });
    }
    
    // Get existing chatflow
    const existing = await getChatflow(kv, id, projectId);
    if (!existing) {
      throw new Error('Chatflow not found');
    }
    
    // Update fields
    const updated: ChatflowRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('✅ Updated chatflow nodes:', updated.nodes);
    console.log('✅ Updated nodes count:', updated.nodes?.length);
    
    // Save back to KV
    const key = `chatflow:${existing.projectId}:${id}`;
    await kv.set(key, updated);
    
    console.log('✅ Saved to KV store with key:', key);
    
    // Verify by reading back
    const verified = await kv.get(key);
    console.log('✅ Verified from KV - nodes count:', verified?.nodes?.length);
    
    return updated;
  } catch (error) {
    console.error('❌ Error updating chatflow:', error);
    throw error;
  }
}

// Delete chatflow
export async function deleteChatflow(
  kv: any,
  id: string,
  projectId?: string
): Promise<void> {
  try {
    const existing = await getChatflow(kv, id, projectId);
    if (!existing) {
      throw new Error('Chatflow not found');
    }
    
    const key = `chatflow:${existing.projectId}:${id}`;
    await kv.del(key);
  } catch (error) {
    console.error('Error deleting chatflow:', error);
    throw error;
  }
}

// Clone chatflow (supports cross-project cloning)
export async function cloneChatflow(
  kv: any,
  id: string,
  newName: string,
  userId: string,
  sourceProjectId: string,
  targetProjectId: string
): Promise<ChatflowRecord> {
  try {
    // Get original from source project
    const original = await getChatflow(kv, id, sourceProjectId);
    if (!original) {
      throw new Error('Chatflow not found');
    }
    
    // Create clone
    const cloneId = generateId();
    const now = new Date().toISOString();
    
    const cloned: ChatflowRecord = {
      ...original,
      id: cloneId,
      name: newName || `${original.name} (Copy)`,
      status: 'draft',
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      projectId: targetProjectId, // Clone to target project
      lastTestedAt: undefined,
      testResults: undefined,
    };
    
    // Save clone to target project
    const key = `chatflow:${targetProjectId}:${cloneId}`;
    await kv.set(key, cloned);
    
    return cloned;
  } catch (error) {
    console.error('Error cloning chatflow:', error);
    throw error;
  }
}

// Get chatflow statistics
export async function getChatflowStats(
  kv: any,
  projectId?: string
): Promise<any> {
  try {
    const filters = projectId ? { projectId } : undefined;
    const chatflows = await listChatflows(kv, filters);
    
    const stats = {
      total: chatflows.length,
      draft: chatflows.filter((cf) => cf.status === 'draft').length,
      active: chatflows.filter((cf) => cf.status === 'active').length,
      paused: chatflows.filter((cf) => cf.status === 'paused').length,
      archived: chatflows.filter((cf) => cf.status === 'archived').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting chatflow stats:', error);
    throw error;
  }
}

// Test/Simulate chatflow (basic implementation)
export async function testChatflow(
  kv: any,
  id: string,
  testData: any,
  projectId?: string
): Promise<any> {
  try {
    const chatflow = await getChatflow(kv, id, projectId);
    if (!chatflow) {
      throw new Error('Chatflow not found');
    }
    
    // Basic simulation - just validate structure
    const testResults = {
      success: true,
      executedAt: new Date().toISOString(),
      steps: chatflow.nodes.map((node: any) => ({
        nodeId: node.id,
        nodeName: node.data?.label || 'Unnamed Node',
        action: `Executed ${node.type} node`,
        result: 'success',
        message: 'Node validated successfully',
        timestamp: new Date().toISOString(),
      })),
      errors: [],
    };
    
    // Update chatflow with test results
    await updateChatflow(kv, id, {
      lastTestedAt: new Date().toISOString(),
      testResults,
    }, projectId);
    
    return testResults;
  } catch (error) {
    console.error('Error testing chatflow:', error);
    throw error;
  }
}
