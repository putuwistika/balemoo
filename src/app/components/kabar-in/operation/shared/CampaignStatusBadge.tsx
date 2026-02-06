import React from 'react';
import type { CampaignStatus } from '@/app/types/campaign';
import { Badge } from '@/app/components/ui/badge';

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

/**
 * Campaign Status Badge Component
 * 
 * Displays campaign status with appropriate color coding
 */
export function CampaignStatusBadge({ status, className = '' }: CampaignStatusBadgeProps) {
  const statusConfig: Record<CampaignStatus, { label: string; className: string }> = {
    draft: {
      label: 'Draft',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    ready: {
      label: 'Ready',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    running: {
      label: 'Running',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    paused: {
      label: 'Paused',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    completed: {
      label: 'Completed',
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    },
    archived: {
      label: 'Archived',
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant="secondary" className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
