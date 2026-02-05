// Guest Management Types for Kabar.in CRM

export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';
export type GuestCategory = 'family' | 'friend' | 'colleague' | 'vip' | 'other';
export type InvitationType = 'ceremony_only' | 'reception_only' | 'both';

export interface Guest {
  id: string;
  name: string;
  phone: string; // WhatsApp number (must include country code)
  email?: string;
  category: GuestCategory;
  invitation_type: InvitationType;
  rsvp_status: RSVPStatus;
  plus_one: boolean;
  plus_one_name?: string;
  plus_one_confirmed?: boolean;
  tags: string[]; // e.g., ["bride_side", "close_friend", "vegetarian"]
  table_number?: string;
  notes?: string;
  qr_code?: string; // Generated QR code for check-in
  invited_at?: string; // ISO date when invitation was sent
  rsvp_at?: string; // ISO date when RSVP was received
  checked_in_at?: string; // ISO date when guest checked in
  created_at: string;
  updated_at: string;
  project_id: string; // Link to wedding project
  created_by: string; // User ID who added this guest
}

export interface CreateGuestInput {
  name: string;
  phone: string;
  email?: string;
  category: GuestCategory;
  invitation_type: InvitationType;
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
  category?: GuestCategory;
  invitation_type?: InvitationType;
  rsvp_status?: RSVPStatus;
  plus_one?: boolean;
  plus_one_name?: string;
  plus_one_confirmed?: boolean;
  tags?: string[];
  table_number?: string;
  notes?: string;
}

export interface BulkImportGuest {
  name: string;
  phone: string;
  email?: string;
  category?: string;
  invitation_type?: string;
  plus_one?: string; // "yes" or "no"
  tags?: string; // comma-separated
  table_number?: string;
  notes?: string;
}

export interface GuestStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  with_plus_one: number;
  checked_in: number;
  by_category: Record<GuestCategory, number>;
  by_invitation_type: Record<InvitationType, number>;
}

export interface GuestFilterOptions {
  search?: string;
  category?: GuestCategory | 'all';
  rsvp_status?: RSVPStatus | 'all';
  invitation_type?: InvitationType | 'all';
  tags?: string[];
  has_plus_one?: boolean;
  checked_in?: boolean;
}

export interface GuestSortOptions {
  field: 'name' | 'created_at' | 'rsvp_at' | 'table_number';
  direction: 'asc' | 'desc';
}
