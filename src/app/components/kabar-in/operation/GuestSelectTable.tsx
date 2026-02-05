import React, { useState, useMemo, useEffect } from 'react';
import { useGuests } from '@/app/contexts/GuestContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  Check,
  Loader2,
  Users,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import type { Guest, GuestCategory, InvitationType, RSVPStatus } from '@/app/types/guest';

interface GuestSelectTableProps {
  selectedGuestIds: string[];
  onSelectionChange: (guestIds: string[]) => void;
}

interface ColumnFilter {
  category: GuestCategory[];
  invitation_type: InvitationType[];
  rsvp_status: RSVPStatus[];
  tags: string[];
  has_plus_one: boolean | null;
}

export function GuestSelectTable({ selectedGuestIds, onSelectionChange }: GuestSelectTableProps) {
  const { guests, loading, fetchGuests } = useGuests();
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({
    category: [],
    invitation_type: [],
    rsvp_status: [],
    tags: [],
    has_plus_one: null,
  });

  // Get distinct values for each filterable column
  const distinctValues = useMemo(() => {
    const categories = new Set<GuestCategory>();
    const invitationTypes = new Set<InvitationType>();
    const rsvpStatuses = new Set<RSVPStatus>();
    const allTags = new Set<string>();

    guests.forEach((guest) => {
      categories.add(guest.category);
      invitationTypes.add(guest.invitation_type);
      rsvpStatuses.add(guest.rsvp_status);
      guest.tags?.forEach((tag) => allTags.add(tag));
    });

    return {
      categories: Array.from(categories).sort(),
      invitationTypes: Array.from(invitationTypes).sort(),
      rsvpStatuses: Array.from(rsvpStatuses).sort(),
      tags: Array.from(allTags).sort(),
    };
  }, [guests]);

  // Filter guests based on search and column filters
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          guest.name.toLowerCase().includes(query) ||
          guest.phone.includes(query) ||
          guest.email?.toLowerCase().includes(query) ||
          guest.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (columnFilters.category.length > 0 && !columnFilters.category.includes(guest.category)) {
        return false;
      }

      // Invitation type filter
      if (
        columnFilters.invitation_type.length > 0 &&
        !columnFilters.invitation_type.includes(guest.invitation_type)
      ) {
        return false;
      }

      // RSVP status filter
      if (
        columnFilters.rsvp_status.length > 0 &&
        !columnFilters.rsvp_status.includes(guest.rsvp_status)
      ) {
        return false;
      }

      // Tags filter
      if (columnFilters.tags.length > 0) {
        const hasMatchingTag = columnFilters.tags.some((tag) => guest.tags?.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Plus one filter
      if (columnFilters.has_plus_one !== null && guest.plus_one !== columnFilters.has_plus_one) {
        return false;
      }

      return true;
    });
  }, [guests, searchQuery, columnFilters]);

  // Check if a guest is selected
  const isSelected = (guestId: string) => selectedGuestIds.includes(guestId);

  // Check if all filtered guests are selected
  const allFilteredSelected =
    filteredGuests.length > 0 && filteredGuests.every((g) => selectedGuestIds.includes(g.id));

  // Check if some filtered guests are selected
  const someFilteredSelected =
    filteredGuests.some((g) => selectedGuestIds.includes(g.id)) && !allFilteredSelected;

  // Toggle single guest selection
  const toggleGuest = (guestId: string) => {
    if (isSelected(guestId)) {
      onSelectionChange(selectedGuestIds.filter((id) => id !== guestId));
    } else {
      onSelectionChange([...selectedGuestIds, guestId]);
    }
  };

  // Select all filtered guests
  const selectAllFiltered = () => {
    const filteredIds = filteredGuests.map((g) => g.id);
    const newSelection = [...new Set([...selectedGuestIds, ...filteredIds])];
    onSelectionChange(newSelection);
  };

  // Deselect all filtered guests
  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredGuests.map((g) => g.id));
    onSelectionChange(selectedGuestIds.filter((id) => !filteredIds.has(id)));
  };

  // Toggle all filtered guests
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      deselectAllFiltered();
    } else {
      selectAllFiltered();
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setColumnFilters({
      category: [],
      invitation_type: [],
      rsvp_status: [],
      tags: [],
      has_plus_one: null,
    });
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery ||
    columnFilters.category.length > 0 ||
    columnFilters.invitation_type.length > 0 ||
    columnFilters.rsvp_status.length > 0 ||
    columnFilters.tags.length > 0 ||
    columnFilters.has_plus_one !== null;

  // Badge colors for different values
  const getCategoryColor = (category: GuestCategory) => {
    const colors: Record<GuestCategory, string> = {
      family: 'bg-purple-100 text-purple-800',
      friend: 'bg-blue-100 text-blue-800',
      colleague: 'bg-green-100 text-green-800',
      vip: 'bg-amber-100 text-amber-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getRSVPColor = (status: RSVPStatus) => {
    const colors: Record<RSVPStatus, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      declined: 'bg-red-100 text-red-800',
      maybe: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading guests...</span>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Guests Found</h3>
        <p className="text-gray-500 mb-4">Add guests to your project first before creating a campaign.</p>
        <Button variant="outline" onClick={() => fetchGuests()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-blue-600" />
          <div>
            <span className="font-medium text-blue-900">
              {selectedGuestIds.length} of {guests.length} guests selected
            </span>
            {hasActiveFilters && (
              <span className="text-sm text-blue-700 ml-2">
                ({filteredGuests.length} shown after filters)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAllFiltered}>
            Select All Shown
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAllFiltered}>
            Deselect All Shown
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, phone, email, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {/* Select All Checkbox */}
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allFilteredSelected}
                    // @ts-ignore
                    indeterminate={someFilteredSelected}
                    onCheckedChange={toggleAllFiltered}
                  />
                </th>

                {/* Name Column */}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>

                {/* Category Column with Filter */}
                <th className="px-4 py-3 text-left">
                  <ColumnFilterDropdown
                    label="Category"
                    options={distinctValues.categories}
                    selectedValues={columnFilters.category}
                    onChange={(values) =>
                      setColumnFilters({ ...columnFilters, category: values as GuestCategory[] })
                    }
                    renderOption={(option) => (
                      <span className="capitalize">{option}</span>
                    )}
                  />
                </th>

                {/* RSVP Status Column with Filter */}
                <th className="px-4 py-3 text-left">
                  <ColumnFilterDropdown
                    label="RSVP"
                    options={distinctValues.rsvpStatuses}
                    selectedValues={columnFilters.rsvp_status}
                    onChange={(values) =>
                      setColumnFilters({ ...columnFilters, rsvp_status: values as RSVPStatus[] })
                    }
                    renderOption={(option) => (
                      <span className="capitalize">{option}</span>
                    )}
                  />
                </th>

                {/* Invitation Type Column with Filter */}
                <th className="px-4 py-3 text-left">
                  <ColumnFilterDropdown
                    label="Invitation"
                    options={distinctValues.invitationTypes}
                    selectedValues={columnFilters.invitation_type}
                    onChange={(values) =>
                      setColumnFilters({
                        ...columnFilters,
                        invitation_type: values as InvitationType[],
                      })
                    }
                    renderOption={(option) => (
                      <span className="capitalize">{option.replace('_', ' ')}</span>
                    )}
                  />
                </th>

                {/* Tags Column with Filter */}
                <th className="px-4 py-3 text-left">
                  <ColumnFilterDropdown
                    label="Tags"
                    options={distinctValues.tags}
                    selectedValues={columnFilters.tags}
                    onChange={(values) => setColumnFilters({ ...columnFilters, tags: values })}
                    renderOption={(option) => <span>{option}</span>}
                  />
                </th>

                {/* Plus One Column */}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">+1</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No guests match your current filters.
                    {hasActiveFilters && (
                      <Button variant="link" onClick={clearAllFilters} className="ml-2">
                        Clear filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected(guest.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleGuest(guest.id)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected(guest.id)}
                        onCheckedChange={() => toggleGuest(guest.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">{guest.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          guest.category
                        )}`}
                      >
                        {guest.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRSVPColor(
                          guest.rsvp_status
                        )}`}
                      >
                        {guest.rsvp_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {guest.invitation_type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {guest.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {guest.tags && guest.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{guest.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {guest.plus_one ? (
                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-sm text-gray-500">
        {hasActiveFilters ? (
          <span>
            Showing {filteredGuests.length} of {guests.length} guests
          </span>
        ) : (
          <span>Showing all {guests.length} guests</span>
        )}
      </div>
    </div>
  );
}

// Column Filter Dropdown Component
interface ColumnFilterDropdownProps<T extends string> {
  label: string;
  options: T[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
  renderOption: (option: T) => React.ReactNode;
}

function ColumnFilterDropdown<T extends string>({
  label,
  options,
  selectedValues,
  onChange,
  renderOption,
}: ColumnFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (option: T) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const selectAll = () => {
    onChange([...options]);
  };

  const clearAll = () => {
    onChange([]);
  };

  const hasSelection = selectedValues.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-1 text-sm font-medium transition-colors ${
            hasSelection ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {label}
          {hasSelection && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {/* Search */}
        {options.length > 5 && (
          <div className="mb-2">
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Select/Clear All */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>

        {/* Options */}
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredOptions.length === 0 ? (
            <div className="text-sm text-gray-500 py-2 text-center">No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <span className="text-sm">{renderOption(option)}</span>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
