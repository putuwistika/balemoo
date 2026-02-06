import React, { useState } from 'react';
import { useExecutions } from '@/app/contexts/ExecutionContext';
import { Button } from '@/app/components/ui/button';
import { Loader2, RotateCcw, Pause, Play, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsBarProps {
  campaignId: string;
  selectedIds: string[];
  onComplete: () => void;
}

/**
 * Bulk Actions Bar Component
 * 
 * Provides bulk actions for selected executions:
 * - Retry failed executions
 * - Pause running executions
 * - Resume paused executions
 * - Cancel executions
 */
export function BulkActionsBar({ campaignId, selectedIds, onComplete }: BulkActionsBarProps) {
  const { bulkRetryExecutions, bulkPauseExecutions, bulkResumeExecutions, bulkCancelExecutions } =
    useExecutions();

  const [loading, setLoading] = useState<string | null>(null);

  const handleRetry = async () => {
    setLoading('retry');
    try {
      const result = await bulkRetryExecutions(campaignId, selectedIds);
      toast.success(`Retried ${result.success} execution(s)`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} execution(s) failed to retry`);
      }
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retry executions';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handlePause = async () => {
    setLoading('pause');
    try {
      const result = await bulkPauseExecutions(selectedIds);
      toast.success(`Paused ${result.success} execution(s)`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} execution(s) failed to pause`);
      }
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to pause executions';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async () => {
    setLoading('resume');
    try {
      const result = await bulkResumeExecutions(campaignId, selectedIds);
      toast.success(`Resumed ${result.success} execution(s)`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} execution(s) failed to resume`);
      }
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resume executions';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm(`Are you sure you want to cancel ${selectedIds.length} execution(s)?`)) {
      return;
    }

    setLoading('cancel');
    try {
      const result = await bulkCancelExecutions(selectedIds);
      toast.success(`Cancelled ${result.success} execution(s)`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} execution(s) failed to cancel`);
      }
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel executions';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
      <span className="text-sm font-medium text-blue-800">
        {selectedIds.length} execution(s) selected
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={isLoading}
          className="text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          {loading === 'retry' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-1" />
          )}
          Retry
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          disabled={isLoading}
          className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
        >
          {loading === 'pause' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Pause className="h-4 w-4 mr-1" />
          )}
          Pause
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResume}
          disabled={isLoading}
          className="text-green-700 border-green-300 hover:bg-green-100"
        >
          {loading === 'resume' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          Resume
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
          className="text-red-700 border-red-300 hover:bg-red-100"
        >
          {loading === 'cancel' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Ban className="h-4 w-4 mr-1" />
          )}
          Cancel
        </Button>
      </div>
    </div>
  );
}
