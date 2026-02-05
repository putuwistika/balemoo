// Guest Management Helper Functions
import * as kv from "./kv_store.ts";

// Simple ID generation function (replacement for ulid)
function generateId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Helper to get guests list key for a project
function getGuestsListKey(projectId: string): string {
  return `guests:list:${projectId}`;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category: 'family' | 'friend' | 'colleague' | 'vip' | 'other';
  invitation_type: 'ceremony_only' | 'reception_only' | 'both';
  rsvp_status: 'pending' | 'confirmed' | 'declined' | 'maybe';
  plus_one: boolean;
  plus_one_name?: string;
  plus_one_confirmed?: boolean;
  tags: string[];
  table_number?: string;
  notes?: string;
  qr_code?: string;
  invited_at?: string;
  rsvp_at?: string;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  created_by: string;
}

export interface CreateGuestInput {
  name: string;
  phone: string;
  email?: string;
  category: 'family' | 'friend' | 'colleague' | 'vip' | 'other';
  invitation_type: 'ceremony_only' | 'reception_only' | 'both';
  plus_one?: boolean;
  plus_one_name?: string;
  tags?: string[];
  table_number?: string;
  notes?: string;
}

export interface UpdateGuestInput {
  name?: string;
  phone?: string;
  email?: string;
  category?: 'family' | 'friend' | 'colleague' | 'vip' | 'other';
  invitation_type?: 'ceremony_only' | 'reception_only' | 'both';
  rsvp_status?: 'pending' | 'confirmed' | 'declined' | 'maybe';
  plus_one?: boolean;
  plus_one_name?: string;
  plus_one_confirmed?: boolean;
  tags?: string[];
  table_number?: string;
  notes?: string;
}

/**
 * Validate phone number format (must start with +)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const cleanPhone = phone.trim();
  
  if (!cleanPhone.startsWith('+')) {
    return { valid: false, error: 'Phone must include country code (e.g., +62812...)' };
  }
  
  // Remove + and check if rest are digits
  const digits = cleanPhone.substring(1);
  if (!/^\d+$/.test(digits)) {
    return { valid: false, error: 'Phone must contain only digits after country code' };
  }
  
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Phone number length invalid (10-15 digits)' };
  }
  
  return { valid: true };
}

/**
 * Validate guest creation input
 */
export function validateGuestInput(input: CreateGuestInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Guest name is required');
  }
  
  if (input.name && input.name.length > 100) {
    errors.push('Guest name must be 100 characters or less');
  }
  
  const phoneValidation = validatePhone(input.phone);
  if (!phoneValidation.valid) {
    errors.push(phoneValidation.error!);
  }
  
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Invalid email format');
  }
  
  const validCategories = ['family', 'friend', 'colleague', 'vip', 'other'];
  if (!validCategories.includes(input.category)) {
    errors.push('Invalid category');
  }
  
  const validInvitationTypes = ['ceremony_only', 'reception_only', 'both'];
  if (!validInvitationTypes.includes(input.invitation_type)) {
    errors.push('Invalid invitation type');
  }
  
  if (input.plus_one && input.plus_one_name && input.plus_one_name.length > 100) {
    errors.push('Plus one name must be 100 characters or less');
  }
  
  if (input.notes && input.notes.length > 500) {
    errors.push('Notes must be 500 characters or less');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Generate QR code data for guest check-in
 */
export function generateQRCode(guestId: string, projectId: string): string {
  // Simple QR code data format: PROJECT_ID:GUEST_ID:TIMESTAMP
  const timestamp = Date.now();
  return `${projectId}:${guestId}:${timestamp}`;
}

/**
 * Create a new guest
 */
export async function createGuest(
  input: CreateGuestInput,
  projectId: string,
  userId: string
): Promise<Guest> {
  // Validate input
  const validation = validateGuestInput(input);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  const guestId = generateId();
  const now = new Date().toISOString();
  
  const guest: Guest = {
    id: guestId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim(),
    category: input.category,
    invitation_type: input.invitation_type,
    rsvp_status: 'pending',
    plus_one: input.plus_one || false,
    plus_one_name: input.plus_one_name?.trim(),
    plus_one_confirmed: false,
    tags: input.tags || [],
    table_number: input.table_number?.trim(),
    notes: input.notes?.trim(),
    qr_code: generateQRCode(guestId, projectId),
    created_at: now,
    updated_at: now,
    project_id: projectId,
    created_by: userId,
  };
  
  // Save guest to KV store
  const key = `guest:${projectId}:${guestId}`;
  console.log(`[createGuest] Saving guest to key: ${key}`);
  await kv.set(key, guest);
  
  // Add to guests list index (required by campaign filterGuests)
  const listKey = getGuestsListKey(projectId);
  const existingIds = await kv.get(listKey) || [];
  console.log(`[createGuest] Current list (${listKey}): ${existingIds.length} items`);
  if (!existingIds.includes(guestId)) {
    existingIds.push(guestId);
    await kv.set(listKey, existingIds);
    console.log(`[createGuest] Added ${guestId} to list, now ${existingIds.length} items`);
  }
  
  console.log(`Guest created: ${guest.name} (${guestId})`);
  return guest;
}

/**
 * Get guest by ID
 */
export async function getGuest(guestId: string, projectId: string): Promise<Guest | null> {
  const key = `guest:${projectId}:${guestId}`;
  return await kv.get(key);
}

/**
 * List all guests for a project
 */
export async function listGuests(projectId: string): Promise<Guest[]> {
  // Use the guests list index for consistency with campaign filterGuests
  const listKey = getGuestsListKey(projectId);
  const guestIds = await kv.get(listKey) || [];
  
  const guests: Guest[] = [];
  for (const guestId of guestIds) {
    const guest = await kv.get(`guest:${projectId}:${guestId}`);
    if (guest) {
      guests.push(guest);
    }
  }
  
  return guests;
}

/**
 * Update guest
 */
export async function updateGuest(
  guestId: string,
  projectId: string,
  updates: UpdateGuestInput
): Promise<Guest> {
  const existing = await getGuest(guestId, projectId);
  if (!existing) {
    throw new Error('Guest not found');
  }
  
  // Validate phone if being updated
  if (updates.phone) {
    const phoneValidation = validatePhone(updates.phone);
    if (!phoneValidation.valid) {
      throw new Error(phoneValidation.error);
    }
  }
  
  const updated: Guest = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  // If RSVP status is being updated and not already set, record the timestamp
  if (updates.rsvp_status && updates.rsvp_status !== 'pending' && !existing.rsvp_at) {
    updated.rsvp_at = new Date().toISOString();
  }
  
  const key = `guest:${projectId}:${guestId}`;
  await kv.set(key, updated);
  
  console.log(`Guest updated: ${updated.name} (${guestId})`);
  return updated;
}

/**
 * Delete guest
 */
export async function deleteGuest(guestId: string, projectId: string): Promise<void> {
  // Delete guest from KV store
  const key = `guest:${projectId}:${guestId}`;
  await kv.del(key);
  
  // Remove from guests list index
  const listKey = getGuestsListKey(projectId);
  const existingIds = await kv.get(listKey) || [];
  const newIds = existingIds.filter((id: string) => id !== guestId);
  await kv.set(listKey, newIds);
  
  console.log(`Guest deleted: ${guestId}`);
}

/**
 * Bulk create guests from import
 */
export async function bulkCreateGuests(
  guests: CreateGuestInput[],
  projectId: string,
  userId: string
): Promise<{ success: Guest[]; failed: Array<{ input: CreateGuestInput; error: string }> }> {
  const success: Guest[] = [];
  const failed: Array<{ input: CreateGuestInput; error: string }> = [];
  
  for (const guestInput of guests) {
    try {
      const guest = await createGuest(guestInput, projectId, userId);
      success.push(guest);
    } catch (error) {
      failed.push({
        input: guestInput,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  console.log(`Bulk import: ${success.length} success, ${failed.length} failed`);
  return { success, failed };
}

/**
 * Check-in guest (update checked_in_at timestamp)
 */
export async function checkInGuest(guestId: string, projectId: string): Promise<Guest> {
  const guest = await getGuest(guestId, projectId);
  if (!guest) {
    throw new Error('Guest not found');
  }
  
  if (guest.checked_in_at) {
    throw new Error('Guest already checked in');
  }
  
  const updated: Guest = {
    ...guest,
    checked_in_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const key = `guest:${projectId}:${guestId}`;
  await kv.set(key, updated);
  
  console.log(`Guest checked in: ${updated.name} (${guestId})`);
  return updated;
}

/**
 * Get guest statistics
 */
export async function getGuestStats(projectId: string): Promise<{
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  with_plus_one: number;
  checked_in: number;
}> {
  const guests = await listGuests(projectId);
  
  return {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvp_status === 'confirmed').length,
    declined: guests.filter(g => g.rsvp_status === 'declined').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    maybe: guests.filter(g => g.rsvp_status === 'maybe').length,
    with_plus_one: guests.filter(g => g.plus_one).length,
    checked_in: guests.filter(g => g.checked_in_at).length,
  };
}

/**
 * Seed sample guests for testing/demo purposes
 */
export async function seedSampleGuests(projectId: string, userId: string): Promise<Guest[]> {
  const sampleGuests: CreateGuestInput[] = [
    {
      name: "Budi Santoso",
      phone: "+6281234567001",
      email: "budi.santoso@email.com",
      category: "family",
      invitation_type: "both",
      plus_one: true,
      plus_one_name: "Siti Santoso",
      tags: ["groom_side"],
      notes: "Paman dari pihak pengantin pria"
    },
    {
      name: "Dewi Lestari",
      phone: "+6281234567002",
      email: "dewi.lestari@email.com",
      category: "friend",
      invitation_type: "both",
      plus_one: false,
      tags: ["bride_side", "college"],
      notes: "Teman kuliah pengantin wanita"
    },
    {
      name: "Ahmad Wijaya",
      phone: "+6281234567003",
      email: "ahmad.wijaya@email.com",
      category: "colleague",
      invitation_type: "reception_only",
      plus_one: true,
      plus_one_name: "Rina Wijaya",
      tags: ["office"],
      notes: "Rekan kerja di kantor"
    },
    {
      name: "Sri Wahyuni",
      phone: "+6281234567004",
      email: "sri.wahyuni@email.com",
      category: "vip",
      invitation_type: "both",
      plus_one: false,
      tags: ["bride_side", "vegetarian"],
      notes: "Kepala divisi - vegetarian"
    },
    {
      name: "Hendra Pratama",
      phone: "+6281234567005",
      category: "family",
      invitation_type: "ceremony_only",
      plus_one: false,
      tags: ["groom_side"],
      notes: "Sepupu jauh"
    },
    {
      name: "Rina Susanti",
      phone: "+6281234567006",
      email: "rina.susanti@email.com",
      category: "friend",
      invitation_type: "both",
      plus_one: true,
      plus_one_name: "Dani Kusuma",
      tags: ["bride_side", "high_school"],
      notes: "Teman SMA"
    },
    {
      name: "Eko Prasetyo",
      phone: "+6281234567007",
      email: "eko.prasetyo@email.com",
      category: "colleague",
      invitation_type: "both",
      plus_one: false,
      tags: ["office", "groom_side"],
      notes: "Tim project yang sama"
    },
    {
      name: "Maya Anggraini",
      phone: "+6281234567008",
      email: "maya.anggraini@email.com",
      category: "friend",
      invitation_type: "reception_only",
      plus_one: false,
      tags: ["bride_side"],
      notes: "Teman arisan"
    },
    {
      name: "Tono Suryadi",
      phone: "+6281234567009",
      email: "tono.suryadi@email.com",
      category: "vip",
      invitation_type: "both",
      plus_one: true,
      plus_one_name: "Lisa Suryadi",
      tags: ["boss", "groom_side"],
      notes: "Direktur perusahaan"
    },
    {
      name: "Lina Kartika",
      phone: "+6281234567010",
      email: "lina.kartika@email.com",
      category: "other",
      invitation_type: "both",
      plus_one: false,
      tags: ["neighbor"],
      notes: "Tetangga dekat rumah"
    },
  ];

  // Set some with different RSVP statuses after creation
  const rsvpStatuses: ('pending' | 'confirmed' | 'declined' | 'maybe')[] = [
    'confirmed', 'pending', 'confirmed', 'confirmed', 'maybe',
    'pending', 'declined', 'confirmed', 'confirmed', 'pending'
  ];

  const createdGuests: Guest[] = [];

  for (let i = 0; i < sampleGuests.length; i++) {
    const guest = await createGuest(sampleGuests[i], projectId, userId);
    
    // Update RSVP status if not pending
    if (rsvpStatuses[i] !== 'pending') {
      const updated = await updateGuest(guest.id, projectId, { rsvp_status: rsvpStatuses[i] });
      createdGuests.push(updated);
    } else {
      createdGuests.push(guest);
    }
  }

  console.log(`Seeded ${createdGuests.length} sample guests for project ${projectId}`);
  return createdGuests;
}

/**
 * Clear all guests for a project (for testing)
 */
export async function clearAllGuests(projectId: string): Promise<void> {
  const guests = await listGuests(projectId);
  
  for (const guest of guests) {
    await deleteGuest(guest.id, projectId);
  }
  
  // Also clear the list key
  const listKey = getGuestsListKey(projectId);
  await kv.set(listKey, []);
  
  console.log(`Cleared all guests for project ${projectId}`);
}
