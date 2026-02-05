import React from 'react';
import type { CampaignStatus } from '@/app/types/campaign';
import { Badge } from '@/app/components/ui/badge';

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export function CampaignStatusBadge({ status, className = '' }: CampaignStatusBadgeProps) {
  const statusConfig = {
    draft: {
      label: 'Draft',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    ready: {
      label: 'Ready',
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    running: {
      label: 'Running',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    paused: {
      label: 'Paused',
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    completed: {
      label: 'Completed',
      variant: 'secondary' as const,
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    },
    archived: {
      label: 'Archived',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
