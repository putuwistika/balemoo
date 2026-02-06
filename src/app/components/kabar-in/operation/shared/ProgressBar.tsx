import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Progress Bar Component
 * 
 * Displays a progress bar with optional label
 */
export function ProgressBar({
  progress,
  size = 'md',
  showLabel = true,
  className = ''
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Determine color based on progress
  const getColor = (value: number) => {
    if (value >= 100) return 'bg-green-500';
    if (value >= 66) return 'bg-blue-500';
    if (value >= 33) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className={className}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${getColor(clampedProgress)}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-600 mt-1 text-right">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
