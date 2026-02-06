import React from 'react';
import type { ExecutionStatus } from '@/app/types/execution';
import { Badge } from '@/app/components/ui/badge';

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
  className?: string;
}

/**
 * Execution Status Badge Component
 * 
 * Displays execution status with appropriate color coding
 */
export function ExecutionStatusBadge({ status, className = '' }: ExecutionStatusBadgeProps) {
  const statusConfig: Record<ExecutionStatus, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'bg-gray-100 text-gray-800',
    },
    running: {
      label: 'Running',
      className: 'bg-blue-100 text-blue-800',
    },
    paused: {
      label: 'Paused',
      className: 'bg-yellow-100 text-yellow-800',
    },
    waiting: {
      label: 'Waiting',
      className: 'bg-amber-100 text-amber-800',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800',
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-100 text-red-800',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-600',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="secondary" className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
