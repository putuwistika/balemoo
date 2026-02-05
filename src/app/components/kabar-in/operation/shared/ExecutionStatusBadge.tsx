import React from 'react';
import type { ExecutionStatus } from '@/app/types/execution';
import { Badge } from '@/app/components/ui/badge';
import { Clock, Loader2, CheckCircle, XCircle, Pause, Ban, HourglassIcon } from 'lucide-react';

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
  showIcon?: boolean;
  className?: string;
}

export function ExecutionStatusBadge({
  status,
  showIcon = true,
  className = ''
}: ExecutionStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    },
    pending_session: {
      label: 'Waiting Session',
      icon: HourglassIcon,
      className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
    },
    queued: {
      label: 'Queued',
      icon: Clock,
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    },
    running: {
      label: 'Running',
      icon: Loader2,
      className: 'bg-green-100 text-green-700 hover:bg-green-100',
      iconClassName: 'animate-spin',
    },
    paused: {
      label: 'Paused',
      icon: Pause,
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 hover:bg-red-100',
    },
    cancelled: {
      label: 'Cancelled',
      icon: Ban,
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`${config.className} ${className} flex items-center gap-1`}>
      {showIcon && <Icon className={`h-3 w-3 ${config.iconClassName || ''}`} />}
      {config.label}
    </Badge>
  );
}
