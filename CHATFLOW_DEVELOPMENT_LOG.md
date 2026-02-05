# Chatflow Studio Development Log

## 📋 Project Overview

**Chatflow Studio** adalah fitur visual drag-and-drop chatbot builder untuk Kabar.in WhatsApp CRM. Feature ini memungkinkan admin users untuk mendesain automated conversation flows menggunakan approved WhatsApp templates.

**Penting:** Ini adalah tool design/simulation - BUKAN production execution engine.

---

## 🎯 Current Status: **CORE INFRASTRUCTURE COMPLETE (60%)**

### ✅ Yang Sudah Selesai

#### **Phase 1: Dependencies & Types**
- ✅ Installed `@xyflow/react` (React Flow library)
- ✅ Created `src/app/types/chatflow.ts` dengan complete type definitions:
  - 8 node types: trigger, send_template, wait_reply, condition, delay, set_variable, update_guest, end
  - Node configurations, edges, chatflow structure
  - Test/simulation types

#### **Phase 2: Frontend Context**
- ✅ Created `src/app/contexts/ChatflowContext.tsx`
- ✅ State management dengan 8 API methods:
  - `fetchChatflows` - Get all chatflows
  - `getChatflowById` - Get single chatflow
  - `createChatflow` - Create new
  - `updateChatflow` - Update existing
  - `deleteChatflow` - Delete chatflow
  - `cloneChatflow` - Clone chatflow
  - `testChatflow` - Test/simulate
  - `getChatflowStats` - Get statistics
- ✅ Integrated ChatflowProvider ke `src/app/App.tsx`
- ✅ Pattern mengikuti TemplateContext (working reference)

#### **Phase 3: Backend API**

**Files Created:**
- ✅ `supabase/functions/make-server-deeab278/chatflow_helpers.ts`
- ✅ Added 8 routes ke `supabase/functions/make-server-deeab278/index.ts`:
  - `GET /chatflows` - List all chatflows
  - `GET /chatflows/stats` - Statistics
  - `GET /chatflows/:id` - Get single chatflow
  - `POST /chatflows` - Create new chatflow
  - `PUT /chatflows/:id` - Update chatflow
  - `DELETE /chatflows/:id` - Delete chatflow
  - `POST /chatflows/:id/clone` - Clone chatflow
  - `POST /chatflows/:id/test` - Test/simulate chatflow

**Deployment Status:** ✅ Deployed to Supabase

**KV Store Pattern:**
```
chatflow:{projectId}:{id}
```

#### **Phase 4: Main Components**

**Created Components:**

1. **`ChatflowStudio.tsx`** - Main container
   - 3-column layout (sidebar, canvas, properties)
   - Handles list view vs editor view based on URL
   - State management untuk nodes, edges, selected node
   - Location: `src/app/components/kabar-in/chatflow/`

2. **`ChatflowCanvas.tsx`** - React Flow integration
   - Drag & drop dari sidebar
   - Node connections dengan animated edges
   - Controls (zoom, pan, minimap)
   - Custom styling (dots background, glassmorphism)
   - Location: `src/app/components/kabar-in/chatflow/`

3. **`ChatflowToolbar.tsx`** - Top toolbar
   - Back button, Save button, Test Flow button, Settings
   - Orange gradient styling
   - Framer Motion animations
   - Location: `src/app/components/kabar-in/chatflow/`

4. **`ChatflowSidebar.tsx`** - Left sidebar
   - 8 draggable node types
   - Each node: icon, label, description
   - Color-coded by type
   - Drag & drop functionality
   - Location: `src/app/components/kabar-in/chatflow/`

5. **`ChatflowPropertiesPanel.tsx`** - Right panel
   - Shows node type, label (editable)
   - Delete node button
   - Configuration form placeholder
   - Location: `src/app/components/kabar-in/chatflow/`

6. **`ChatflowList.tsx`** - List view
   - Grid view of chatflow cards
   - Search functionality
   - Create button
   - Empty state handling
   - Location: `src/app/components/kabar-in/chatflow/`

7. **`ChatflowCard.tsx`** - Card component
   - Glassmorphism design
   - Status badges (draft, active, paused, archived)
   - Shows node count, variable count
   - Click to open editor
   - Location: `src/app/components/kabar-in/chatflow/`

#### **Phase 5: Custom Nodes**

Created 8 custom node components in `src/app/components/kabar-in/chatflow/nodes/`:

| Node | File | Color | Icon | Handles | Description |
|------|------|-------|------|---------|-------------|
| Trigger | TriggerNode.tsx | Orange #f59e0b | Workflow | Output only | Starting point |
| Send Template | SendTemplateNode.tsx | Cyan #06b6d4 | Mail | In + Out | Send WhatsApp template |
| Wait Reply | WaitReplyNode.tsx | Blue #3b82f6 | Clock | In + Out | Wait for user response |
| Condition | ConditionNode.tsx | Purple #8b5cf6 | GitBranch | In + 2 Outs | Branching logic |
| Delay | DelayNode.tsx | Green #10b981 | Timer | In + Out | Time delay |
| Set Variable | SetVariableNode.tsx | Yellow #eab308 | FileEdit | In + Out | Store data |
| Update Guest | UpdateGuestNode.tsx | Pink #ec4899 | UserCog | In + Out | Update contact info |
| End | EndNode.tsx | Gray #64748b | Flag | Input only | Flow termination |

**Node Features:**
- Gradient background matching type color
- Icon in rounded square
- Label (from node.data.label)
- Description text
- Handle positions for connections
- Selection styling (glowing border)
- Glassmorphism design

#### **Phase 6: Routing**
- ✅ Updated `src/app/components/KabarIn.tsx`
- ✅ Replaced ComingSoonPage dengan ChatflowStudio
- ✅ Routes:
  - `/kabar-in/chatflow` - List view
  - `/kabar-in/chatflow/:id` - Editor view

#### **Phase 7: Build & Deployment**
- ✅ `npm run build` - Successful
- ✅ Backend deployed to Supabase
- ✅ All routes responding

---

## 🐛 Bugs Fixed

### **Bug #1: KV Store API Mismatch (FIXED ✅)**

**Problem:**
Backend returned 500 errors:
```
Error: Cannot read properties of undefined (reading 'set')
```

**Root Cause:**
`chatflow_helpers.ts` used incorrect KV store API:
```typescript
// WRONG:
await kv.list({ prefix: ... })
await kv.get([key])
await kv.set([key], value)
await kv.delete([key])

// CORRECT:
await kv.getByPrefix(prefix)
await kv.get(key)
await kv.set(key, value)
await kv.del(key)
```

**Fix Applied:**
Updated all KV store method calls in `chatflow_helpers.ts`:
- Line 37: `kv.list()` → `kv.getByPrefix()`
- Line 71: `kv.list()` → `kv.getByPrefix()`
- Line 82: `kv.get([key])` → `kv.get(key)`
- Line 136: `kv.set([key], chatflow)` → `kv.set(key, chatflow)`
- Line 175: `kv.set([key], updated)` → `kv.set(key, updated)`
- Line 197: `kv.delete([key])` → `kv.del(key)`
- Line 237: `kv.set([key], cloned)` → `kv.set(key, cloned)`

### **Bug #2: kv.default vs kv (FIXED ✅)**

**Problem:**
All chatflow routes returned 500 errors with:
```
Cannot read properties of undefined (reading 'set')
```

**Root Cause:**
Routes in `index.ts` used `kv.default` but KV store doesn't export default:
```typescript
// Import (correct):
import * as kv from "./kv_store.ts";

// Usage (WRONG):
await chatflowHelpers.listChatflows(kv.default, ...)

// Usage (CORRECT):
await chatflowHelpers.listChatflows(kv, ...)
```

**Fix Applied:**
Updated 8 locations in `index.ts`:
- Line 1150: `kv.default` → `kv` (GET /chatflows/stats)
- Line 1180: `kv.default` → `kv` (GET /chatflows)
- Line 1213: `kv.default` → `kv` (GET /chatflows/:id)
- Line 1256: `kv.default` → `kv` (POST /chatflows)
- Line 1292: `kv.default` → `kv` (PUT /chatflows/:id)
- Line 1327: `kv.default` → `kv` (DELETE /chatflows/:id)
- Line 1359: `kv.default` → `kv` (POST /chatflows/:id/clone)
- Line 1397: `kv.default` → `kv` (POST /chatflows/:id/test)

**Deployed:** ✅ Backend re-deployed successfully

---

## 📂 File Structure

```
src/app/
├── types/
│   └── chatflow.ts                          ✅ Complete type definitions
├── contexts/
│   └── ChatflowContext.tsx                  ✅ State management
└── components/
    └── kabar-in/
        ├── KabarIn.tsx                      ✅ Updated routes
        └── chatflow/
            ├── ChatflowStudio.tsx           ✅ Main container
            ├── ChatflowCanvas.tsx           ✅ React Flow canvas
            ├── ChatflowToolbar.tsx          ✅ Top toolbar
            ├── ChatflowSidebar.tsx          ✅ Node palette
            ├── ChatflowPropertiesPanel.tsx  ✅ Right panel
            ├── ChatflowList.tsx             ✅ List view
            ├── ChatflowCard.tsx             ✅ Card component
            └── nodes/
                ├── TriggerNode.tsx          ✅ Start node
                ├── SendTemplateNode.tsx     ✅ Template node
                ├── WaitReplyNode.tsx        ✅ Wait node
                ├── ConditionNode.tsx        ✅ Branch node
                ├── DelayNode.tsx            ✅ Delay node
                ├── SetVariableNode.tsx      ✅ Variable node
                ├── UpdateGuestNode.tsx      ✅ Guest update node
                └── EndNode.tsx              ✅ End node

supabase/functions/make-server-deeab278/
├── index.ts                                 ✅ 8 routes added & fixed
├── chatflow_helpers.ts                      ✅ CRUD operations (fixed)
├── template_helpers.ts                      ✅ Reference (working)
└── kv_store.ts                              ✅ KV API reference
```

---

## 🚀 Next Steps (Priority Order)

### **Priority 1: Wire Up Save Functionality** ⭐⭐⭐

**Status:** ❌ Not Started

**Goal:** Make Save button actually save nodes & edges to backend

**Tasks:**
1. Update `ChatflowStudio.tsx` to call `updateChatflow` from context
2. Serialize nodes and edges state
3. Add auto-save (debounced after 2 seconds of inactivity)
4. Show save status indicator (saving... / saved / error)
5. Load saved nodes/edges when opening existing chatflow

**Implementation Guide:**
```typescript
// In ChatflowStudio.tsx
const handleSave = async () => {
  if (!chatflowId) return;
  
  try {
    setSaving(true);
    await updateChatflow(chatflowId, {
      nodes,
      edges,
      variables: extractedVariables,
    });
    setSaveStatus('saved');
    // Show success toast
  } catch (error) {
    setSaveStatus('error');
    // Show error toast
  } finally {
    setSaving(false);
  }
};

// Auto-save with debounce
useEffect(() => {
  const timer = setTimeout(() => {
    if (hasUnsavedChanges) {
      handleSave();
    }
  }, 2000);
  
  return () => clearTimeout(timer);
}, [nodes, edges]);

// Load existing chatflow
useEffect(() => {
  if (chatflowId) {
    const chatflow = getChatflowById(chatflowId);
    if (chatflow) {
      setNodes(chatflow.nodes || []);
      setEdges(chatflow.edges || []);
    }
  }
}, [chatflowId]);
```

**Files to Modify:**
- `src/app/components/kabar-in/chatflow/ChatflowStudio.tsx`
- `src/app/components/kabar-in/chatflow/ChatflowToolbar.tsx` (save status indicator)

---

### **Priority 2: Node Configuration Forms** ⭐⭐⭐

**Status:** ❌ Not Started

**Goal:** Create config forms for each node type in properties panel

**Files to Create in `src/app/components/kabar-in/chatflow/config/`:**

#### **1. TriggerConfig.tsx**
```typescript
// Config options:
- Radio buttons: "Keyword", "Webhook", "Schedule"
- For keyword: Text input for trigger word
- For webhook: URL input
- For schedule: Cron expression builder
```

#### **2. SendTemplateConfig.tsx** ⭐ MOST IMPORTANT
```typescript
// Config options:
- Dropdown: Fetch approved templates from TemplateContext
- Show template preview (header, body, footer, buttons)
- Auto-detect {{variables}} from template body
- Show variable mapping inputs (map to guest fields)

// Example:
// Template: "Hi {{name}}, your order {{order_id}} is ready!"
// UI shows:
//   - name: [Dropdown: Guest.name | Variable.name | Manual]
//   - order_id: [Dropdown: Guest.custom | Variable.order_id | Manual]
```

#### **3. ConditionConfig.tsx**
```typescript
// Config options:
- Dropdown: Select variable to check
- Dropdown: Select operator (equals, contains, >, <, etc.)
- Input: Value to compare against
- Label inputs: True branch label, False branch label
```

#### **4. DelayConfig.tsx**
```typescript
// Config options:
- Number input: Duration
- Dropdown: Unit (seconds, minutes, hours, days)
```

#### **5. SetVariableConfig.tsx**
```typescript
// Config options:
- Input: Variable name
- Dropdown: Source (static value, guest field, previous reply)
- Input: Value or field name
```

#### **6. WaitReplyConfig.tsx**
```typescript
// Config options:
- Number input: Timeout duration (minutes)
- Dropdown: Timeout action (end flow, go to node)
- Checkbox: Save reply to variable
- Input: Variable name (if checkbox enabled)
```

#### **7. UpdateGuestConfig.tsx**
```typescript
// Config options:
- Multi-select: Which guest fields to update
- For each field: Dropdown to map from variables
// Example:
//   - Update name: [Variable.user_name]
//   - Update email: [Variable.email_input]
```

#### **8. EndConfig.tsx**
```typescript
// Config options:
- Dropdown: End reason (completed, error, timeout)
- Optional textarea: Success/failure message
```

**Wire Up in `ChatflowPropertiesPanel.tsx`:**
```typescript
import TriggerConfig from './config/TriggerConfig';
import SendTemplateConfig from './config/SendTemplateConfig';
// ... import all configs

// In component:
{selectedNode && (
  <>
    {selectedNode.type === 'trigger' && (
      <TriggerConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'send_template' && (
      <SendTemplateConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'wait_reply' && (
      <WaitReplyConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'condition' && (
      <ConditionConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'delay' && (
      <DelayConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'set_variable' && (
      <SetVariableConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'update_guest' && (
      <UpdateGuestConfig node={selectedNode} onChange={updateNode} />
    )}
    {selectedNode.type === 'end' && (
      <EndConfig node={selectedNode} onChange={updateNode} />
    )}
  </>
)}
```

---

### **Priority 3: Template Integration** ⭐⭐

**Status:** ❌ Not Started

**Goal:** Connect to existing template system

**Tasks:**
1. Import TemplateContext into SendTemplateConfig
2. Filter only APPROVED templates
3. Show template details in dropdown (name, category, language)
4. Display template preview with styling
5. Parse `{{variable}}` syntax from template body
6. Create variable mapping UI

**Implementation:**
```typescript
// In SendTemplateConfig.tsx
import { useTemplate } from '../../../contexts/TemplateContext';

const SendTemplateConfig = ({ node, onChange }) => {
  const { templates } = useTemplate();
  
  // Filter approved templates
  const approvedTemplates = templates.filter(
    t => t.status === 'APPROVED'
  );
  
  // Get selected template
  const selectedTemplate = approvedTemplates.find(
    t => t.id === node.data.config?.templateId
  );
  
  // Extract variables from template
  const variables = selectedTemplate 
    ? extractVariables(selectedTemplate.content.body.text)
    : [];
  
  return (
    <div>
      <select onChange={handleTemplateChange}>
        <option value="">Select Template</option>
        {approvedTemplates.map(template => (
          <option key={template.id} value={template.id}>
            {template.name} ({template.category})
          </option>
        ))}
      </select>
      
      {selectedTemplate && (
        <div className="template-preview">
          {/* Header */}
          {selectedTemplate.content.header && (
            <div className="header">
              {selectedTemplate.content.header.text}
            </div>
          )}
          
          {/* Body */}
          <div className="body">
            {selectedTemplate.content.body.text}
          </div>
          
          {/* Footer */}
          {selectedTemplate.content.footer && (
            <div className="footer">
              {selectedTemplate.content.footer.text}
            </div>
          )}
          
          {/* Buttons */}
          {selectedTemplate.content.buttons?.map(btn => (
            <button key={btn.text}>{btn.text}</button>
          ))}
        </div>
      )}
      
      {/* Variable Mapping */}
      {variables.length > 0 && (
        <div className="variable-mapping">
          <h4>Variable Mapping</h4>
          {variables.map(varName => (
            <div key={varName}>
              <label>{{varName}}:</label>
              <select>
                <option value="">Select Source</option>
                <optgroup label="Guest Fields">
                  <option value="guest.name">Guest Name</option>
                  <option value="guest.phone">Guest Phone</option>
                  <option value="guest.email">Guest Email</option>
                </optgroup>
                <optgroup label="Variables">
                  {/* List existing flow variables */}
                </optgroup>
                <option value="manual">Manual Input</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = text.matchAll(regex);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}
```

**Files to Create/Modify:**
- `src/app/components/kabar-in/chatflow/config/SendTemplateConfig.tsx`
- Import TemplateContext ke component

---

### **Priority 4: Validation System** ⭐⭐

**Status:** ❌ Not Started

**Goal:** Prevent invalid chatflows from being activated

**Create `src/app/utils/chatflowValidation.ts`:**

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateChatflow(
  nodes: Node[], 
  edges: Edge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Rule 1: Must have exactly 1 trigger node
  const triggers = nodes.filter(n => n.type === 'trigger');
  if (triggers.length === 0) {
    errors.push('Chatflow must have a trigger node');
  } else if (triggers.length > 1) {
    errors.push('Chatflow can only have one trigger node');
  }
  
  // Rule 2: Must have at least 1 end node
  const ends = nodes.filter(n => n.type === 'end');
  if (ends.length === 0) {
    errors.push('Chatflow must have at least one end node');
  }
  
  // Rule 3: All nodes must be connected
  const connectedNodes = new Set<string>();
  edges.forEach(e => {
    connectedNodes.add(e.source);
    connectedNodes.add(e.target);
  });
  
  const orphans = nodes.filter(
    n => !connectedNodes.has(n.id) && n.type !== 'trigger'
  );
  
  if (orphans.length > 0) {
    errors.push(
      `${orphans.length} orphaned nodes found: ${orphans.map(n => n.data.label).join(', ')}`
    );
  }
  
  // Rule 4: Trigger must have outgoing connection
  if (triggers.length === 1) {
    const triggerHasOutput = edges.some(e => e.source === triggers[0].id);
    if (!triggerHasOutput) {
      errors.push('Trigger node must be connected to another node');
    }
  }
  
  // Rule 5: End nodes must have incoming connection
  ends.forEach(endNode => {
    const hasInput = edges.some(e => e.target === endNode.id);
    if (!hasInput) {
      errors.push(`End node "${endNode.data.label}" is not connected`);
    }
  });
  
  // Rule 6: Condition nodes must have 2 outputs
  const conditions = nodes.filter(n => n.type === 'condition');
  conditions.forEach(condNode => {
    const outputs = edges.filter(e => e.source === condNode.id);
    if (outputs.length === 0) {
      errors.push(`Condition node "${condNode.data.label}" has no outputs`);
    } else if (outputs.length === 1) {
      warnings.push(
        `Condition node "${condNode.data.label}" should have 2 outputs (true/false paths)`
      );
    } else if (outputs.length > 2) {
      errors.push(
        `Condition node "${condNode.data.label}" has too many outputs (max 2)`
      );
    }
  });
  
  // Rule 7: Send template nodes must have template selected
  const sendTemplates = nodes.filter(n => n.type === 'send_template');
  sendTemplates.forEach(node => {
    if (!node.data.config?.templateId) {
      errors.push(
        `Send Template node "${node.data.label}" has no template selected`
      );
    }
  });
  
  // Rule 8: No circular dependencies (prevent infinite loops)
  const hasCircular = detectCircularDependency(nodes, edges);
  if (hasCircular) {
    errors.push('Chatflow contains circular dependency (infinite loop detected)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function detectCircularDependency(nodes: Node[], edges: Edge[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true; // Circular dependency found
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  // Start DFS from trigger node
  const trigger = nodes.find(n => n.type === 'trigger');
  if (!trigger) return false;
  
  return dfs(trigger.id);
}
```

**Integrate in `ChatflowStudio.tsx`:**

```typescript
import { validateChatflow } from '../../utils/chatflowValidation';

// In component:
const [validation, setValidation] = useState<ValidationResult>({
  valid: true,
  errors: [],
  warnings: []
});

// Validate on nodes/edges change
useEffect(() => {
  const result = validateChatflow(nodes, edges);
  setValidation(result);
}, [nodes, edges]);

// Show validation errors in toolbar
<ChatflowToolbar
  validation={validation}
  canActivate={validation.valid}
  // ...
/>
```

**UI Integration:**
- Show validation errors in toolbar (red badge with count)
- Disable "Activate" button if invalid
- Highlight invalid nodes with red border
- Show tooltip with error message on hover
- Show validation panel (expandable) listing all errors/warnings

---

### **Priority 5: Testing/Simulation Modal** ⭐

**Status:** ❌ Not Started

**Goal:** Create WhatsApp-style simulator to test flows

**Create `src/app/components/kabar-in/chatflow/ChatflowSimulator.tsx`:**

```typescript
interface SimulatorProps {
  chatflow: Chatflow;
  onClose: () => void;
}

interface ExecutionContext {
  variables: Record<string, any>;
  guestData: Record<string, any>;
  currentNodeId: string;
  executionLog: LogEntry[];
  messages: Message[];
}

interface LogEntry {
  timestamp: string;
  nodeId: string;
  nodeName: string;
  action: string;
  result: 'success' | 'error' | 'waiting';
  message: string;
}

interface Message {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: string;
}

export default function ChatflowSimulator({ chatflow, onClose }: SimulatorProps) {
  const [context, setContext] = useState<ExecutionContext>({
    variables: {},
    guestData: {
      name: 'Test User',
      phone: '+6281234567890',
      email: 'test@example.com'
    },
    currentNodeId: '',
    executionLog: [],
    messages: []
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // Execute node based on type
  const executeNode = async (node: Node) => {
    setContext(prev => ({
      ...prev,
      currentNodeId: node.id
    }));
    
    switch (node.type) {
      case 'trigger':
        await executeTrigger(node);
        break;
      case 'send_template':
        await executeSendTemplate(node);
        break;
      case 'wait_reply':
        await executeWaitReply(node);
        break;
      case 'condition':
        await executeCondition(node);
        break;
      case 'delay':
        await executeDelay(node);
        break;
      case 'set_variable':
        await executeSetVariable(node);
        break;
      case 'update_guest':
        await executeUpdateGuest(node);
        break;
      case 'end':
        await executeEnd(node);
        break;
    }
  };
  
  const executeSendTemplate = async (node: Node) => {
    const templateId = node.data.config?.templateId;
    // Fetch template, render with variables, show in chat
    const renderedMessage = renderTemplate(templateId, context.variables);
    
    addMessage({
      type: 'sent',
      content: renderedMessage,
      timestamp: new Date().toISOString()
    });
    
    addLog({
      nodeId: node.id,
      nodeName: node.data.label,
      action: 'Send Template',
      result: 'success',
      message: `Template sent: ${templateId}`
    });
    
    // Move to next node
    const nextNode = findNextNode(node.id);
    if (nextNode) {
      await executeNode(nextNode);
    }
  };
  
  const executeWaitReply = async (node: Node) => {
    addLog({
      nodeId: node.id,
      nodeName: node.data.label,
      action: 'Wait Reply',
      result: 'waiting',
      message: 'Waiting for user input...'
    });
    
    // Pause execution, wait for user input
    setIsPaused(true);
  };
  
  const executeCondition = async (node: Node) => {
    const config = node.data.config;
    const variable = context.variables[config.variable];
    const result = evaluateCondition(variable, config.operator, config.value);
    
    addLog({
      nodeId: node.id,
      nodeName: node.data.label,
      action: 'Evaluate Condition',
      result: 'success',
      message: `Condition: ${config.variable} ${config.operator} ${config.value} = ${result}`
    });
    
    // Take true or false path
    const nextNode = findNextNodeByBranch(node.id, result ? 'true' : 'false');
    if (nextNode) {
      await executeNode(nextNode);
    }
  };
  
  const executeDelay = async (node: Node) => {
    const duration = node.data.config?.duration || 1;
    const unit = node.data.config?.unit || 'seconds';
    
    addLog({
      nodeId: node.id,
      nodeName: node.data.label,
      action: 'Delay',
      result: 'success',
      message: `Waiting ${duration} ${unit}...`
    });
    
    // Show countdown timer in UI
    await delay(duration, unit);
    
    const nextNode = findNextNode(node.id);
    if (nextNode) {
      await executeNode(nextNode);
    }
  };
  
  // Start simulation
  const handleStart = async () => {
    const triggerNode = chatflow.nodes.find(n => n.type === 'trigger');
    if (!triggerNode) {
      alert('No trigger node found');
      return;
    }
    
    setIsRunning(true);
    await executeNode(triggerNode);
  };
  
  // Handle user reply
  const handleSendReply = () => {
    if (!userInput.trim()) return;
    
    addMessage({
      type: 'received',
      content: userInput,
      timestamp: new Date().toISOString()
    });
    
    // Save reply to variable if configured
    const currentNode = chatflow.nodes.find(n => n.id === context.currentNodeId);
    if (currentNode?.data.config?.saveToVariable) {
      setContext(prev => ({
        ...prev,
        variables: {
          ...prev.variables,
          [currentNode.data.config.variableName]: userInput
        }
      }));
    }
    
    setUserInput('');
    setIsPaused(false);
    
    // Continue to next node
    const nextNode = findNextNode(context.currentNodeId);
    if (nextNode) {
      executeNode(nextNode);
    }
  };
  
  return (
    <div className="simulator-modal">
      <div className="simulator-layout">
        {/* Left: Canvas with highlighted current node */}
        <div className="canvas-preview">
          <ChatflowCanvas
            nodes={chatflow.nodes}
            edges={chatflow.edges}
            highlightedNodeId={context.currentNodeId}
            readOnly
          />
        </div>
        
        {/* Center: WhatsApp-style chat */}
        <div className="chat-preview">
          <div className="chat-header">
            <img src="/whatsapp-logo.png" />
            <span>Test User</span>
          </div>
          
          <div className="chat-messages">
            {context.messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.type}`}
              >
                {msg.content}
                <span className="timestamp">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendReply()}
              placeholder="Type a message..."
              disabled={!isPaused}
            />
            <button onClick={handleSendReply} disabled={!isPaused}>
              Send
            </button>
          </div>
        </div>
        
        {/* Right: Variables & Execution Log */}
        <div className="info-panel">
          <div className="variables-section">
            <h3>Variables</h3>
            {Object.entries(context.variables).map(([key, value]) => (
              <div key={key} className="variable-row">
                <span className="var-name">{key}:</span>
                <span className="var-value">{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
          
          <div className="log-section">
            <h3>Execution Log</h3>
            {context.executionLog.map((log, idx) => (
              <div key={idx} className={`log-entry ${log.result}`}>
                <div className="log-time">{formatTime(log.timestamp)}</div>
                <div className="log-node">{log.nodeName}</div>
                <div className="log-action">{log.action}</div>
                <div className="log-message">{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="simulator-controls">
        {!isRunning ? (
          <button onClick={handleStart}>Start Test</button>
        ) : (
          <>
            <button onClick={handlePause}>Pause</button>
            <button onClick={handleReset}>Reset</button>
          </>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

**Integrate in `ChatflowToolbar.tsx`:**

```typescript
const [showSimulator, setShowSimulator] = useState(false);

<button onClick={() => setShowSimulator(true)}>
  Test Flow
</button>

{showSimulator && (
  <ChatflowSimulator
    chatflow={currentChatflow}
    onClose={() => setShowSimulator(false)}
  />
)}
```

---

## 🎨 Design System

### **Node Colors**
```typescript
const nodeColors = {
  trigger: '#f59e0b',        // Orange
  send_template: '#06b6d4',  // Cyan
  wait_reply: '#3b82f6',     // Blue
  condition: '#8b5cf6',      // Purple
  delay: '#10b981',          // Green
  set_variable: '#eab308',   // Yellow
  update_guest: '#ec4899',   // Pink
  end: '#64748b',            // Gray
};
```

### **Glassmorphism Style**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

### **Status Colors**
```typescript
const statusColors = {
  draft: 'text-gray-600 bg-gray-100',
  active: 'text-green-600 bg-green-100',
  paused: 'text-yellow-600 bg-yellow-100',
  archived: 'text-red-600 bg-red-100',
};
```

### **Gradient Backgrounds**
```css
/* Node gradients */
.trigger-node {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.send-template-node {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

/* Toolbar gradient */
.toolbar {
  background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
}
```

---

## 🔧 Technical Details

### **Backend Configuration**
```
URL: https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278
Project Ref: uvqbmlnavztzobfaiqao
```

### **Dev Server**
```bash
npm run dev
# Runs on: http://localhost:2103
```

### **Test Account**
```
Email: demo-admin@balemoo.com
Password: demo12345
Role: admin (required for chatflow management)
```

### **Deployment Commands**
```bash
# Deploy backend
npx supabase functions deploy make-server-deeab278 --project-ref uvqbmlnavztzobfaiqao

# Build frontend
npm run build
```

---

## 📊 API Reference

### **Chatflow Endpoints**

#### **GET /chatflows**
List all chatflows with optional filters
```typescript
Query params:
  - status?: 'draft' | 'active' | 'paused' | 'archived'
  - projectId?: string

Response:
{
  chatflows: ChatflowRecord[]
}
```

#### **GET /chatflows/stats**
Get chatflow statistics
```typescript
Query params:
  - projectId?: string

Response:
{
  stats: {
    total: number;
    draft: number;
    active: number;
    paused: number;
    archived: number;
  }
}
```

#### **GET /chatflows/:id**
Get single chatflow
```typescript
Query params:
  - projectId?: string

Response:
{
  chatflow: ChatflowRecord
}
```

#### **POST /chatflows**
Create new chatflow
```typescript
Body:
{
  name: string;
  description?: string;
  projectId: string;
}

Response:
{
  chatflow: ChatflowRecord;
  message: string;
}
```

#### **PUT /chatflows/:id**
Update chatflow
```typescript
Body:
{
  name?: string;
  description?: string;
  status?: string;
  nodes?: Node[];
  edges?: Edge[];
  variables?: string[];
  projectId?: string;
}

Response:
{
  chatflow: ChatflowRecord;
  message: string;
}
```

#### **DELETE /chatflows/:id**
Delete chatflow
```typescript
Query params:
  - projectId?: string

Response:
{
  message: string;
}
```

#### **POST /chatflows/:id/clone**
Clone chatflow
```typescript
Body:
{
  newName?: string;
  projectId?: string;
}

Response:
{
  chatflow: ChatflowRecord;
  message: string;
}
```

#### **POST /chatflows/:id/test**
Test/simulate chatflow
```typescript
Body:
{
  projectId?: string;
  testData?: any;
}

Response:
{
  testResults: {
    success: boolean;
    executedAt: string;
    steps: Array<{
      nodeId: string;
      nodeName: string;
      action: string;
      result: string;
      message: string;
      timestamp: string;
    }>;
    errors: string[];
  };
  message: string;
}
```

---

## 📝 Type Definitions

### **Chatflow Types** (from `src/app/types/chatflow.ts`)

```typescript
// Node Types
export type ChatflowNodeType =
  | 'trigger'
  | 'send_template'
  | 'wait_reply'
  | 'condition'
  | 'delay'
  | 'set_variable'
  | 'update_guest'
  | 'end';

// Trigger Config
export interface TriggerConfig {
  type: 'keyword' | 'webhook' | 'schedule';
  keyword?: string;
  webhookUrl?: string;
  schedule?: string; // cron expression
}

// Send Template Config
export interface SendTemplateConfig {
  templateId: string;
  variableMapping: Record<string, {
    source: 'guest' | 'variable' | 'manual';
    value: string;
  }>;
}

// Wait Reply Config
export interface WaitReplyConfig {
  timeout?: number; // minutes
  timeoutAction?: 'end' | 'goto_node';
  timeoutNodeId?: string;
  saveToVariable?: boolean;
  variableName?: string;
}

// Condition Config
export interface ConditionConfig {
  variable: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string;
  trueBranchLabel?: string;
  falseBranchLabel?: string;
}

// Delay Config
export interface DelayConfig {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

// Set Variable Config
export interface SetVariableConfig {
  variableName: string;
  source: 'static' | 'guest_field' | 'previous_reply';
  value: string;
}

// Update Guest Config
export interface UpdateGuestConfig {
  fields: Array<{
    guestField: string;
    sourceVariable: string;
  }>;
}

// End Config
export interface EndConfig {
  reason: 'completed' | 'error' | 'timeout';
  message?: string;
}

// Node Data
export interface ChatflowNodeData {
  label: string;
  description?: string;
  config?: 
    | TriggerConfig
    | SendTemplateConfig
    | WaitReplyConfig
    | ConditionConfig
    | DelayConfig
    | SetVariableConfig
    | UpdateGuestConfig
    | EndConfig;
}

// Chatflow Structure
export interface Chatflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: Node[];
  edges: Edge[];
  variables: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  lastTestedAt?: string;
  testResults?: any;
}
```

---

## 🐛 Known Issues

### **Current Limitations:**
1. ❌ Node config forms not implemented (placeholder shown)
2. ❌ Save button not wired (needs implementation)
3. ❌ No auto-save functionality
4. ❌ Simulator not built
5. ❌ No validation logic
6. ❌ No undo/redo functionality
7. ❌ Cannot load existing chatflow nodes/edges

### **Future Improvements:**
- Add keyboard shortcuts (Ctrl+S to save, Ctrl+Z to undo)
- Add drag selection for multiple nodes
- Add copy/paste nodes
- Add flow templates (pre-built common patterns)
- Add analytics (execution metrics, performance tracking)
- Add version history
- Add collaborative editing (multiple users)
- Add AI suggestions for flow optimization

---

## 📚 Reference Materials

### **Working Examples to Study:**
1. **Template Management** (`src/app/components/kabar-in/TemplateManagement.tsx`)
   - Working CRUD operations
   - Form handling patterns
   - API integration
   - UI/UX patterns

2. **TemplateContext** (`src/app/contexts/TemplateContext.tsx`)
   - State management pattern
   - API call patterns
   - Error handling

3. **Template Helpers** (`supabase/functions/make-server-deeab278/template_helpers.ts`)
   - KV store usage (CORRECT implementation)
   - CRUD patterns
   - Validation functions

### **Libraries Used:**
- `@xyflow/react` - Node-based UI library
- `react-router-dom` - Routing
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

### **Documentation:**
- React Flow: https://reactflow.dev/
- Supabase Functions: https://supabase.com/docs/guides/functions
- TailwindCSS: https://tailwindcss.com/docs

---

## 🚦 Testing Checklist

### **Basic Functionality:**
- [ ] Can access `/kabar-in/chatflow` page
- [ ] List view shows all chatflows
- [ ] Can click "Create Chatflow" button
- [ ] Create modal opens and works
- [ ] Can create new chatflow
- [ ] Redirects to editor after creation
- [ ] Can drag nodes from sidebar to canvas
- [ ] Nodes appear on canvas with correct styling
- [ ] Can connect nodes with edges
- [ ] Can select nodes (properties panel updates)
- [ ] Can edit node label
- [ ] Can delete nodes
- [ ] Back button returns to list view

### **Save Functionality (TODO):**
- [ ] Save button saves nodes and edges
- [ ] Auto-save works after 2 seconds
- [ ] Save status indicator shows correct state
- [ ] Can reload page and nodes/edges persist
- [ ] Can open existing chatflow and see nodes

### **Node Configuration (TODO):**
- [ ] Selecting node shows config form
- [ ] Can configure trigger node
- [ ] Can select template in send_template node
- [ ] Template preview shows correctly
- [ ] Variable mapping works
- [ ] Can configure condition logic
- [ ] Can configure delay duration
- [ ] Can set variables
- [ ] Config persists after save

### **Validation (TODO):**
- [ ] Shows error if no trigger node
- [ ] Shows error if multiple triggers
- [ ] Shows error if no end node
- [ ] Shows error if nodes disconnected
- [ ] Highlights invalid nodes
- [ ] Disable activate button when invalid
- [ ] Shows validation panel with errors

### **Simulator (TODO):**
- [ ] Can open simulator modal
- [ ] Simulator shows WhatsApp-style chat
- [ ] Can start simulation
- [ ] Messages appear in chat
- [ ] Can input replies
- [ ] Variables update correctly
- [ ] Execution log shows steps
- [ ] Canvas highlights current node
- [ ] Can pause/resume simulation

---

## 💡 Tips for Next Developer

### **Where to Start:**
1. **Priority 1:** Wire up Save functionality first
   - Users need to save their work!
   - Start in `ChatflowStudio.tsx`
   - Add save handler to toolbar button
   - Test with browser refresh

2. **Priority 2:** Build SendTemplateConfig
   - Most important node type
   - Integrate with TemplateContext
   - Test with real APPROVED templates

3. **Priority 3:** Add validation
   - Prevents broken flows
   - Good user experience
   - Start with basic rules

### **Code Patterns to Follow:**
```typescript
// 1. Always use try-catch for async operations
try {
  await updateChatflow(id, data);
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
}

// 2. Use useEffect for data loading
useEffect(() => {
  if (chatflowId) {
    loadChatflow(chatflowId);
  }
}, [chatflowId]);

// 3. Debounce auto-save
const debouncedSave = useCallback(
  debounce(() => handleSave(), 2000),
  [nodes, edges]
);

useEffect(() => {
  if (hasChanges) {
    debouncedSave();
  }
}, [nodes, edges]);
```

### **Common Pitfalls to Avoid:**
1. ❌ Don't use `kv.default` - Use `kv` directly
2. ❌ Don't use array syntax for KV keys - Use strings
3. ❌ Don't forget to deploy backend after changes
4. ❌ Don't skip validation - Leads to broken flows
5. ❌ Don't forget error handling - User experience matters

### **Debugging Tips:**
```bash
# Check backend logs
# Visit Supabase dashboard > Functions > Logs

# Test API directly
curl -X GET "https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/chatflows" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check browser console
# Open DevTools > Console tab

# Check network requests
# Open DevTools > Network tab > Filter by Fetch/XHR
```

---

## 📞 Contact & Support

If you encounter issues or need clarification:
1. Check this document first
2. Review working examples (Template system)
3. Check Supabase function logs
4. Check browser console errors

---

**Last Updated:** 2026-02-05
**Status:** Core infrastructure complete, feature implementation pending
**Completion:** 60%

---

## 🎯 Quick Start Commands

```bash
# Start dev server
npm run dev

# Deploy backend
npx supabase functions deploy make-server-deeab278 --project-ref uvqbmlnavztzobfaiqao

# Build frontend
npm run build

# Access app
open http://localhost:2103/kabar-in/chatflow

# Login
Email: demo-admin@balemoo.com
Password: demo12345
```

---

**Ready to continue development! 🚀**
