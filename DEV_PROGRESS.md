# Balemoo Development Progress

**Project:** Balemoo - Event Management Platform with WhatsApp-based CRM  
**Module:** Kabar.in - Invitation & CRM Management  
**Last Updated:** Feb 06, 2026

---

## Project Overview

Balemoo is an event management platform with WhatsApp-based guest communication (CRM). The **Kabar.in** module handles:
- Guest Management (CRUD, import/export)
- Chatflow Studio (visual chatflow builder)
- Operation Center (campaign management)
- Template Management (WhatsApp message templates)

**Project Path:** `/Users/wistikai/Documents/2.BaleDauh`

---

## Completed Features

### 1. Backend Bug Fixes (Previous Sessions)
- Fixed `filterGuests()` KV key mismatch for guest lookup
- Added sample guest seeding functionality
- Fixed frontend GuestContext authentication
- Fixed backend `getChatflow()` calls

### 2. Operation Center Improvements
**File:** `/src/app/components/kabar-in/operation/OperationCenter.tsx`
- Fixed refresh/blank issue with `useCallback` for `loadCampaigns`
- Added delete campaign button with confirmation dialog
- Removed debug buttons

### 3. CreateCampaignModal Guest Data
**File:** `/src/app/components/kabar-in/operation/CreateCampaignModal.tsx`
- Added auto-refresh guests when modal opens
- Added "Refresh Guests" button in step 2
- Ensures guest IDs are always up-to-date when creating campaign

### 4. Hide Agenda Dropdown for Kabar.in Routes
**File:** `/src/app/components/AppHeader.tsx`
- Added `isKabarInRoute` check to hide agenda dropdown when path starts with `/kabar-in`

### 5. Project Isolation Implementation (COMPLETED)

#### Backend Changes (`/supabase/functions/make-server-deeab278/index.ts`)

| Route | Change |
|-------|--------|
| `GET /chatflows` | Requires `projectId` query param |
| `GET /chatflows/:id` | Requires `projectId` query param |
| `PUT /chatflows/:id` | Requires `projectId` in body |
| `DELETE /chatflows/:id` | Requires `projectId` query param |
| `POST /chatflows/:id/clone` | Updated for cross-project cloning with `sourceProjectId` and `targetProjectId` |
| `GET /chatflows/browse` | **NEW** - Returns all chatflows grouped by project |

#### Backend Helper Changes (`/supabase/functions/make-server-deeab278/chatflow_helpers.ts`)
- Updated `cloneChatflow()` function signature:
```typescript
cloneChatflow(kv, id, newName, userId, sourceProjectId, targetProjectId)
```

#### Frontend Context Changes (`/src/app/contexts/ChatflowContext.tsx`)

| Method | Change |
|--------|--------|
| `getChatflowById(id, projectId)` | Now requires projectId |
| `updateChatflow(id, updates, projectId)` | Now requires projectId |
| `deleteChatflow(id, projectId)` | Now requires projectId |
| `cloneChatflow(id, newName, targetProjectId, sourceProjectId?)` | Cross-project support |
| `testChatflow(id, testData, projectId)` | Now requires projectId |
| `browseChatflows()` | **NEW** - Returns chatflows grouped by project |

#### Frontend Component Changes

**ChatflowStudio** (`/src/app/components/kabar-in/chatflow/ChatflowStudio.tsx`):
- Added `useProject()` hook to get `selectedProject`
- All operations now pass `projectId`

**ChatflowList** (`/src/app/components/kabar-in/chatflow/ChatflowList.tsx`):
- Delete now passes `projectId`
- Added "Clone from Project" button
- Integrated CloneChatflowModal

**CloneChatflowModal** (`/src/app/components/kabar-in/chatflow/CloneChatflowModal.tsx`) - **NEW**:
- Select source project dropdown
- Select chatflow to clone
- Enter new name for cloned chatflow
- Clone to current project

---

## Key Technical Details

### KV Store Key Patterns
```
Guest:      guest:${projectId}:${guestId}
Guest List: guests:list:${projectId}
Chatflow:   chatflow:${projectId}:${chatflowId}
Campaign:   campaign:${projectId}:${campaignId}
```

### Authentication Pattern (Frontend to Backend)
```typescript
headers: {
  'Authorization': `Bearer ${publicAnonKey}`,
  'X-User-Token': accessToken,
  'Content-Type': 'application/json',
}
```

### Important Files Reference

| File | Purpose |
|------|---------|
| `/src/app/components/AppHeader.tsx` | Header with agenda dropdown |
| `/src/app/contexts/ChatflowContext.tsx` | Chatflow state & API calls |
| `/src/app/contexts/GuestContext.tsx` | Guest state & API calls |
| `/src/app/contexts/CampaignContext.tsx` | Campaign state & API calls |
| `/src/app/contexts/ProjectContext.tsx` | Project state management |
| `/supabase/functions/make-server-deeab278/index.ts` | Backend API routes |
| `/supabase/functions/make-server-deeab278/chatflow_helpers.ts` | Chatflow CRUD |
| `/supabase/functions/make-server-deeab278/guest_helpers.ts` | Guest CRUD |
| `/supabase/functions/make-server-deeab278/campaign_helpers.ts` | Campaign CRUD |

---

## Deployment Commands

### Deploy Backend Function
```bash
supabase functions deploy make-server-deeab278 --no-verify-jwt
```

### Run Frontend Dev Server
```bash
npm run dev
```

---

## Potential Future Tasks

### 1. Guest Isolation Audit
Verify all guest routes also require `projectId`:
- `GET /guests`
- `GET /guests/:id`
- `PUT /guests/:id`
- `DELETE /guests/:id`
- `POST /guests/seed`

### 2. Campaign Isolation Audit
Verify all campaign routes require `projectId`:
- `GET /campaigns`
- `GET /campaigns/:id`
- `PUT /campaigns/:id`
- `DELETE /campaigns/:id`

### 3. Template Isolation
If templates should be project-specific, implement similar isolation.

### 4. Session/Execution Isolation
Verify session and execution data is properly isolated per project.

### 5. UI/UX Improvements
- Add loading states for cross-project clone
- Add project filter in Chatflow browse modal
- Add search in CloneChatflowModal

---

## Known Issues / Notes

1. **Docker Warning**: Deployment shows "Docker is not running" warning but still works via Supabase hosted deployment.

2. **Initial Load**: ChatflowStudio has `isInitialLoad` ref to prevent marking as unsaved during first load.

3. **Auto-Save Disabled**: ChatflowStudio uses manual save only (auto-save code commented out).

---

## Session Handoff Checklist

When continuing development:

1. [ ] Check if backend is deployed: `supabase functions list`
2. [ ] Run frontend: `npm run dev`
3. [ ] Test Chatflow Studio operations (create, edit, save, delete)
4. [ ] Test Clone from Other Project feature
5. [ ] Test Operation Center (create campaign, delete campaign)
6. [ ] Verify agenda dropdown is hidden on Kabar.in routes

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  Contexts:                                                   │
│  - AuthContext (user, accessToken)                          │
│  - ProjectContext (projects, selectedProject)               │
│  - ChatflowContext (chatflows, CRUD operations)             │
│  - GuestContext (guests, CRUD operations)                   │
│  - CampaignContext (campaigns, CRUD operations)             │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                 │
│  - Kabar.in/Chatflow/* (ChatflowStudio, ChatflowList, etc.) │
│  - Kabar.in/Operation/* (OperationCenter, CreateCampaign)   │
│  - Kabar.in/Guest/* (GuestList, GuestDetail)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions (Deno)                  │
├─────────────────────────────────────────────────────────────┤
│  make-server-deeab278/                                       │
│  ├── index.ts (API routes)                                  │
│  ├── chatflow_helpers.ts (Chatflow CRUD)                    │
│  ├── guest_helpers.ts (Guest CRUD)                          │
│  ├── campaign_helpers.ts (Campaign CRUD)                    │
│  ├── template_helpers.ts (Template CRUD)                    │
│  ├── execution_engine.ts (Chatflow execution)               │
│  ├── session_helpers.ts (Session management)                │
│  └── kv_store.ts (Deno KV wrapper)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Services                         │
├─────────────────────────────────────────────────────────────┤
│  - Auth (user authentication)                               │
│  - Database (PostgreSQL - projects, users)                  │
│  - Edge Functions (Deno runtime)                            │
│  - Deno KV (key-value storage for chatflows, guests, etc.)  │
└─────────────────────────────────────────────────────────────┘
```

---

*Last deployed: Feb 06, 2026*
