import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '@/app/contexts/CampaignContext';
import { useExecutions } from '@/app/contexts/ExecutionContext';
import { useGuests } from '@/app/contexts/GuestContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  ChevronLeft,
  Play,
  Pause,
  Ban,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { CampaignStatusBadge } from './shared/CampaignStatusBadge';
import { ExecutionList } from './ExecutionList';
import type { Campaign } from '@/app/types/campaign';
import type { Guest } from '@/app/types/guest';

/**
 * Campaign Detail Page
 * 
 * Features:
 * - Display campaign information
 * - Show campaign stats (total guests, running, completed, failed)
 * - Campaign actions (start, pause, resume, cancel)
 * - For DRAFT campaigns: Show selected guests from guest_filter
 * - For RUNNING/COMPLETED campaigns: Show execution list
 * - Auto-refresh for running campaigns
 */
export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { getCampaignById, startCampaign, pauseCampaign, resumeCampaign, cancelCampaign } =
    useCampaigns();
  const { executions, fetchExecutions } = useExecutions();
  const { guests, fetchGuests } = useGuests();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load campaign and guests on mount
  useEffect(() => {
    if (campaignId) {
      loadCampaign();
      fetchExecutions(campaignId);
    }
    if (selectedProject?.id) {
      fetchGuests();
    }
  }, [campaignId, selectedProject?.id]);

  // Auto-refresh for running campaigns (every 5 seconds)
  useEffect(() => {
    if (campaign?.status === 'running') {
      const interval = setInterval(() => {
        loadCampaign();
        if (campaignId) {
          fetchExecutions(campaignId);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, campaignId]);

  const loadCampaign = async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      const data = await getCampaignById(campaignId);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  // Get selected guests from guest_filter
  const selectedGuests = useMemo(() => {
    if (!campaign?.guest_filter?.custom_guest_ids) return [];

    const selectedIds = new Set(campaign.guest_filter.custom_guest_ids);
    return guests.filter((g: Guest) => selectedIds.has(g.id));
  }, [campaign?.guest_filter?.custom_guest_ids, guests]);

  // Campaign Actions
  const handleStart = async () => {
    if (!campaignId) return;

    setActionLoading(true);
    try {
      await startCampaign(campaignId);
      toast.success('Campaign started successfully!');
      await loadCampaign();
      fetchExecutions(campaignId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to start campaign';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!campaignId) return;

    setActionLoading(true);
    try {
      await pauseCampaign(campaignId);
      toast.success('Campaign paused');
      await loadCampaign();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to pause campaign';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!campaignId) return;

    setActionLoading(true);
    try {
      await resumeCampaign(campaignId);
      toast.success('Campaign resumed');
      await loadCampaign();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resume campaign';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!campaignId) return;
    if (!confirm('Are you sure you want to cancel this campaign?')) return;

    setActionLoading(true);
    try {
      await cancelCampaign(campaignId);
      toast.success('Campaign cancelled');
      await loadCampaign();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel campaign';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Not found state
  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Campaign Not Found</h2>
          <Button onClick={() => navigate('/kabar-in/operation')} className="mt-4">
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  // Calculate guest count from guest_filter or stats
  const totalGuests = campaign.guest_filter?.custom_guest_ids?.length
    || campaign.stats?.total_guests
    || 0;

  // Determine if campaign is in draft mode (show guests) or running mode (show executions)
  const isDraft = campaign.status === 'draft';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/kabar-in/operation')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Campaigns
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            {campaign.description && (
              <p className="text-gray-600">{campaign.description}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              Chatflow: <span className="font-medium text-gray-700">{campaign.chatflow_name}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {campaign.status === 'draft' && (
              <Button onClick={handleStart} disabled={actionLoading || totalGuests === 0}>
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Campaign
              </Button>
            )}

            {campaign.status === 'running' && (
              <Button onClick={handlePause} disabled={actionLoading} variant="outline">
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Pause className="h-4 w-4 mr-2" />
                )}
                Pause
              </Button>
            )}

            {campaign.status === 'paused' && (
              <>
                <Button onClick={handleResume} disabled={actionLoading}>
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Resume
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  variant="destructive"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-2" />
                  )}
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Guests"
          value={totalGuests}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Running"
          value={campaign.stats?.executions_running || 0}
          color="yellow"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={campaign.stats?.executions_completed || 0}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Failed"
          value={campaign.stats?.executions_failed || 0}
          color="red"
        />
      </div>

      {/* Content: Selected Guests (for draft) or Execution List (for running/completed) */}
      {isDraft ? (
        <SelectedGuestsList
          guests={selectedGuests}
          totalSelected={totalGuests}
          loading={guests.length === 0}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Guest Executions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track the progress of each guest through the chatflow
            </p>
          </div>
          <ExecutionList campaignId={campaignId!} />
        </div>
      )}
    </div>
  );
}

/**
 * Selected Guests List Component (for draft campaigns)
 */
interface SelectedGuestsListProps {
  guests: Guest[];
  totalSelected: number;
  loading: boolean;
}

function SelectedGuestsList({ guests, totalSelected, loading }: SelectedGuestsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter guests based on search
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;

    const query = searchQuery.toLowerCase();
    return guests.filter((guest) =>
      guest.name.toLowerCase().includes(query) ||
      guest.phone.includes(query) ||
      guest.email?.toLowerCase().includes(query)
    );
  }, [guests, searchQuery]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Selected Guests</h2>
            <p className="text-sm text-gray-600 mt-1">
              These guests will receive messages when you start the campaign
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <UserCheck className="h-4 w-4" />
            <span className="font-medium">{totalSelected} guests selected</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? 'No guests match your search' : 'No guests selected for this campaign'}
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{guest.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{guest.phone}</td>
                  <td className="px-6 py-4 text-gray-700">{guest.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {guest.category || 'general'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        Showing {filteredGuests.length} of {totalSelected} guests
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'red';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
