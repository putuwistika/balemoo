import React, { useEffect, useState, useCallback } from 'react';
import { useCampaigns } from '@/app/contexts/CampaignContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { Button } from '@/app/components/ui/button';
import { Plus, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Campaign } from '@/app/types/campaign';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignStatusBadge } from './shared/CampaignStatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { toast } from 'sonner';

/**
 * Operation Center - Campaign Management Dashboard
 * 
 * Features:
 * - List all campaigns for current project
 * - Create new campaigns
 * - Delete campaigns
 * - Navigate to campaign details
 * - Project isolation (only shows campaigns for selected project)
 */
export function OperationCenter() {
  const navigate = useNavigate();
  const { selectedProject } = useProject();
  const { campaigns, loading, fetchCampaigns, deleteCampaign } = useCampaigns();

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch campaigns when project changes
  useEffect(() => {
    if (selectedProject?.id) {
      fetchCampaigns(selectedProject.id);
    }
  }, [selectedProject?.id, fetchCampaigns]);

  // Refresh campaigns
  const handleRefresh = useCallback(async () => {
    if (!selectedProject?.id) return;
    setRefreshing(true);
    try {
      await fetchCampaigns(selectedProject.id);
      toast.success('Campaigns refreshed');
    } catch (error) {
      toast.error('Failed to refresh campaigns');
    } finally {
      setRefreshing(false);
    }
  }, [selectedProject?.id, fetchCampaigns]);

  // Delete campaign
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteCampaign(deleteTarget.id);
      toast.success(`Campaign "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      if (selectedProject?.id) {
        fetchCampaigns(selectedProject.id);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete campaign';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  // Navigate to campaign detail
  const handleCampaignClick = (campaign: Campaign) => {
    navigate(`/kabar-in/operation/${campaign.id}`);
  };

  // No project selected
  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operation Center</h1>
          <p className="text-gray-600 mt-1">
            Manage campaigns for {selectedProject.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Campaign List */}
      {loading && campaigns.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => handleCampaignClick(campaign)}
              onDelete={() => setDeleteTarget(campaign)}
            />
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          if (selectedProject?.id) {
            fetchCampaigns(selectedProject.id);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Plus className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Create your first campaign to start sending messages to your guests
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Create Campaign
      </Button>
    </div>
  );
}

/**
 * Campaign Card Component
 */
interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
  onDelete: () => void;
}

function CampaignCard({ campaign, onClick, onDelete }: CampaignCardProps) {
  // Calculate guest count from guest_filter or stats
  const guestCount = campaign.guest_filter?.custom_guest_ids?.length
    || campaign.stats?.total_guests
    || 0;

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {campaign.name}
          </h3>
          <CampaignStatusBadge status={campaign.status} className="mt-2" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {campaign.description}
        </p>
      )}

      {/* Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Chatflow:</span>
          <span className="font-medium text-gray-900 truncate ml-2">
            {campaign.chatflow_name || 'Not set'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Guests:</span>
          <span className="font-medium text-gray-900">{guestCount}</span>
        </div>
        {campaign.stats && campaign.status !== 'draft' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500">Completed:</span>
              <span className="font-medium text-green-600">
                {campaign.stats.executions_completed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Failed:</span>
              <span className="font-medium text-red-600">
                {campaign.stats.executions_failed}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Created date */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        Created {new Date(campaign.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
