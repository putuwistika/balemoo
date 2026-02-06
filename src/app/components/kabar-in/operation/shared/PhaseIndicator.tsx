import React from 'react';

interface PhaseIndicatorProps {
  phase: string;
  className?: string;
}

/**
 * Phase Indicator Component
 * 
 * Displays the current phase of an execution with icon
 */
export function PhaseIndicator({ phase, className = '' }: PhaseIndicatorProps) {
  const phaseConfig: Record<string, { label: string; color: string }> = {
    invitation: {
      label: 'Invitation',
      color: 'text-blue-600 bg-blue-50',
    },
    reminder: {
      label: 'Reminder',
      color: 'text-amber-600 bg-amber-50',
    },
    thank_you: {
      label: 'Thank You',
      color: 'text-green-600 bg-green-50',
    },
    follow_up: {
      label: 'Follow Up',
      color: 'text-purple-600 bg-purple-50',
    },
  };

  const config = phaseConfig[phase] || {
    label: phase.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    color: 'text-gray-600 bg-gray-50',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
        ${config.color} ${className}
      `}
    >
      {config.label}
    </span>
  );
}
