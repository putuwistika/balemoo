import React, { useState, useMemo } from 'react';
import { useGuests } from '@/app/contexts/GuestContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Search, Loader2, Users, UserCheck } from 'lucide-react';
import type { Guest } from '@/app/types/guest';

interface GuestSelectTableProps {
  guests: Guest[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
}

/**
 * Guest Select Table Component
 * 
 * Features:
 * - Search/filter guests
 * - Select all / deselect all
 * - Individual guest selection
 * - Shows selection count
 * - Accessible checkboxes with aria-labels
 */
export function GuestSelectTable({
  guests,
  selectedIds,
  onSelectionChange,
  loading = false,
}: GuestSelectTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter guests based on search query
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;

    const query = searchQuery.toLowerCase();
    return guests.filter((guest) =>
      guest.name.toLowerCase().includes(query) ||
      guest.phone.includes(query) ||
      guest.email?.toLowerCase().includes(query)
    );
  }, [guests, searchQuery]);

  // Selection state helpers
  const allSelected = filteredGuests.length > 0 &&
    filteredGuests.every((g) => selectedIds.includes(g.id));
  const someSelected = filteredGuests.some((g) => selectedIds.includes(g.id)) && !allSelected;

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Add all filtered guests to selection
      const newIds = new Set(selectedIds);
      filteredGuests.forEach((g) => newIds.add(g.id));
      onSelectionChange(Array.from(newIds));
    } else {
      // Remove all filtered guests from selection
      const filteredIds = new Set(filteredGuests.map((g) => g.id));
      onSelectionChange(selectedIds.filter((id) => !filteredIds.has(id)));
    }
  };

  // Handle individual selection
  const handleSelectOne = (guestId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, guestId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== guestId));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Empty state
  if (guests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
        <p className="text-gray-600">
          Add guests to your project first before creating a campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with search and stats */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selection stats */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCheck className="h-4 w-4" />
            <span>
              <span className="font-medium text-gray-900">{selectedIds.length}</span>
              {' '}of{' '}
              <span className="font-medium text-gray-900">{guests.length}</span>
              {' '}selected
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label={allSelected ? 'Deselect all guests' : 'Select all guests'}
                  className={someSelected ? 'data-[state=checked]:bg-blue-600' : ''}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Category
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No guests match your search
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  selected={selectedIds.includes(guest.id)}
                  onSelect={(checked) => handleSelectOne(guest.id, checked)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with quick actions */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectionChange(guests.map((g) => g.id))}
        >
          Select All ({guests.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectionChange([])}
        >
          Deselect All
        </Button>
      </div>
    </div>
  );
}

/**
 * Guest Row Component
 */
interface GuestRowProps {
  guest: Guest;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

function GuestRow({ guest, selected, onSelect }: GuestRowProps) {
  return (
    <tr
      className={`hover:bg-gray-50 cursor-pointer ${selected ? 'bg-blue-50' : ''}`}
      onClick={() => onSelect(!selected)}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          aria-label={`Select ${guest.name}`}
        />
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-gray-900">{guest.name}</div>
          {guest.email && (
            <div className="text-sm text-gray-500">{guest.email}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700">{guest.phone}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
          {guest.category || 'general'}
        </span>
      </td>
    </tr>
  );
}
