import React from 'react';
import { Send, MessageCircle, GitBranch, Clock, CheckCircle } from 'lucide-react';

interface PhaseIndicatorProps {
  phase: string;
  className?: string;
}

export function PhaseIndicator({ phase, className = '' }: PhaseIndicatorProps) {
  const phaseConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
    'Blasting Phase': {
      icon: Send,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    'Response Phase': {
      icon: MessageCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    'Processing Phase': {
      icon: GitBranch,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
    },
    'Follow-up Phase': {
      icon: Clock,
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
    },
    'Completion': {
      icon: CheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
  };

  const config = phaseConfig[phase] || phaseConfig['Processing Phase'];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${className}`}
    >
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{phase}</span>
    </div>
  );
}
