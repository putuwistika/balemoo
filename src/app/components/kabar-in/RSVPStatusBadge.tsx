import React from 'react';
import { CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import type { RSVPStatus } from '../../types/guest';

interface RSVPStatusBadgeProps {
  status: RSVPStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  maybe: {
    label: 'Maybe',
    icon: HelpCircle,
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
};

const sizeConfig = {
  sm: {
    padding: '4px 8px',
    fontSize: '11px',
    iconSize: 12,
    borderRadius: '8px',
  },
  md: {
    padding: '6px 12px',
    fontSize: '13px',
    iconSize: 14,
    borderRadius: '10px',
  },
  lg: {
    padding: '8px 16px',
    fontSize: '14px',
    iconSize: 16,
    borderRadius: '12px',
  },
};

export const RSVPStatusBadge: React.FC<RSVPStatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeStyle.padding,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: sizeStyle.borderRadius,
        fontSize: sizeStyle.fontSize,
        fontWeight: 600,
        color: config.color,
      }}
    >
      <Icon size={sizeStyle.iconSize} />
      <span>{config.label}</span>
    </div>
  );
};
