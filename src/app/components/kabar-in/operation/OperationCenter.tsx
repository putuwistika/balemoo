import React, { useEffect, useState, useCallback } from 'react';
import { useCampaigns } from '@/app/contexts/CampaignContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { useGuests } from '@/app/contexts/GuestContext';
import { Button } from '@/app/components/ui/button';
import { Plus, Loader2, Users, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Campaign } from '@/app/types/campaign';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignStatusBadge } from './shared/CampaignStatusBadge';
import { toast } from 'sonner';
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

export function OperationCenter() {
  const { campaigns, loading, error, fetchCampaigns, deleteCampaign } = useCampaigns();
  const { selectedProject } = useProject();
  const { guests, seedSampleGuests, fetchGuests } = useGuests();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Memoize the fetch function to prevent infinite loops
  const loadCampaigns = useCallback(() => {
    if (selectedProject?.id) {
      fetchCampaigns(selectedProject.id);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleCreateSuccess = () => {
    loadCampaigns();
  };

  const handleSeedGuests = async () => {
    try {
      setSeeding(true);
      setSeedMessage(null);
      const seededGuests = await seedSampleGuests(true); // clear first
      setSeedMessage(`Berhasil menambahkan ${seededGuests.length} sample guests!`);
      // Refresh guests list
      await fetchGuests();
      setTimeout(() => setSeedMessage(null), 5000);
    } catch (err) {
      setSeedMessage(`Error: ${err instanceof Error ? err.message : 'Failed to seed guests'}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deleteTarget) return;
    
    try {
      setDeleting(true);
      await deleteCampaign(deleteTarget.id);
      toast.success(`Campaign "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">No Project Selected</h2>
          <p className="mt-2 text-gray-600">Please select a project to view campaigns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operation Center</h1>
          <p className="mt-2 text-gray-600">
            Create and manage WhatsApp campaigns for your guests
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Guest count indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {guests.length} guests
            </span>
          </div>
          
          {/* Seed Sample Guests button */}
          <Button
            variant="outline"
            onClick={handleSeedGuests}
            disabled={seeding}
            className="flex items-center gap-2"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {seeding ? 'Seeding...' : 'Seed Sample Guests'}
          </Button>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Seed Message */}
      {seedMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          seedMessage.startsWith('Error') 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <p>{seedMessage}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && campaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Campaigns Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first campaign to start sending WhatsApp messages to guests
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create First Campaign
          </Button>
        </div>
      )}

      {/* Campaign List */}
      {!loading && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              onDelete={() => setDeleteTarget(campaign)}
            />
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              All campaign data including executions and messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
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

// Campaign Card Component
function CampaignCard({ campaign, onDelete }: { campaign: Campaign; onDelete: () => void }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/kabar-in/operation/${campaign.id}`);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">{campaign.name}</h3>
        <div className="flex items-center gap-2">
          <CampaignStatusBadge status={campaign.status} />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {campaign.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {campaign.description}
        </p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Chatflow:</span>
          <span className="font-medium text-gray-900 truncate ml-2">
            {campaign.chatflow_name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Guests:</span>
          <span className="font-medium text-gray-900">
            {campaign.guest_filter?.custom_guest_ids?.length || campaign.stats?.total_guests || 0}
          </span>
        </div>
        {campaign.stats && campaign.status === 'running' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Running:</span>
              <span className="font-medium text-green-600">
                {campaign.stats.executions_running}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-purple-600">
                {campaign.stats.executions_completed}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
