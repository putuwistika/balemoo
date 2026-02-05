import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '@/app/contexts/CampaignContext';
import { useExecutions } from '@/app/contexts/ExecutionContext';
import { Button } from '@/app/components/ui/button';
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Ban,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { CampaignStatusBadge } from './shared/CampaignStatusBadge';
import { ExecutionList } from './ExecutionList';
import type { Campaign } from '@/app/types/campaign';

export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { getCampaignById, startCampaign, pauseCampaign, resumeCampaign, cancelCampaign } =
    useCampaigns();
  const { fetchExecutions } = useExecutions();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
      fetchExecutions(campaignId);
    }
  }, [campaignId]);

  // Poll for updates every 5 seconds for running campaigns
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

  const handleStart = async () => {
    if (!campaignId) return;

    setActionLoading(true);
    try {
      await startCampaign(campaignId);
      toast.success('Campaign started successfully!');
      await loadCampaign();
      if (campaignId) {
        fetchExecutions(campaignId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start campaign');
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause campaign');
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to resume campaign');
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel campaign');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

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
              <Button onClick={handleStart} disabled={actionLoading}>
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
      {campaign.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Guests"
            value={campaign.stats.total_guests}
            color="blue"
          />
          <StatCard
            icon={Loader2}
            label="Running"
            value={campaign.stats.executions_running}
            color="green"
            iconClassName="animate-spin"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={campaign.stats.executions_completed}
            color="purple"
          />
          <StatCard
            icon={XCircle}
            label="Failed"
            value={campaign.stats.executions_failed}
            color="red"
          />
        </div>
      )}

      {/* Execution List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Guest Executions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track the progress of each guest through the chatflow
          </p>
        </div>
        <ExecutionList campaignId={campaignId!} />
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'red';
  iconClassName?: string;
}

function StatCard({ icon: Icon, label, value, color, iconClassName = '' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className={`h-6 w-6 ${iconClassName}`} />
        </div>
      </div>
    </div>
  );
}
