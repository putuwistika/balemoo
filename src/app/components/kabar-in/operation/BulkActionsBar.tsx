import React, { useState } from 'react';
import { useExecutions } from '@/app/contexts/ExecutionContext';
import { Button } from '@/app/components/ui/button';
import { RotateCcw, Pause, Play, Ban, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsBarProps {
  campaignId: string;
  selectedIds: string[];
  onComplete: () => void;
}

export function BulkActionsBar({ campaignId, selectedIds, onComplete }: BulkActionsBarProps) {
  const { bulkRetryExecutions, bulkPauseExecutions, bulkResumeExecutions, bulkCancelExecutions } =
    useExecutions();
  const [loading, setLoading] = useState(false);

  const handleBulkRetry = async () => {
    setLoading(true);
    try {
      const result = await bulkRetryExecutions(campaignId, selectedIds);

      if (result.succeeded.length > 0) {
        toast.success(`${result.succeeded.length} execution(s) retried successfully`);
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} execution(s) failed to retry`);
      }

      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry executions');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPause = async () => {
    setLoading(true);
    try {
      const result = await bulkPauseExecutions(selectedIds);

      if (result.succeeded.length > 0) {
        toast.success(`${result.succeeded.length} execution(s) paused successfully`);
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} execution(s) failed to pause`);
      }

      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to pause executions');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkResume = async () => {
    setLoading(true);
    try {
      const result = await bulkResumeExecutions(campaignId, selectedIds);

      if (result.succeeded.length > 0) {
        toast.success(`${result.succeeded.length} execution(s) resumed successfully`);
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} execution(s) failed to resume`);
      }

      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resume executions');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCancel = async () => {
    if (!confirm(`Are you sure you want to cancel ${selectedIds.length} execution(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await bulkCancelExecutions(selectedIds);

      if (result.succeeded.length > 0) {
        toast.success(`${result.succeeded.length} execution(s) cancelled successfully`);
      }

      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} execution(s) failed to cancel`);
      }

      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel executions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border-y border-blue-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} execution(s) selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkRetry}
            disabled={loading}
            className="bg-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1" />
            )}
            Retry
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkPause}
            disabled={loading}
            className="bg-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Pause className="h-4 w-4 mr-1" />
            )}
            Pause
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkResume}
            disabled={loading}
            className="bg-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Resume
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkCancel}
            disabled={loading}
            className="bg-white text-red-600 hover:text-red-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Ban className="h-4 w-4 mr-1" />
            )}
            Cancel
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            disabled={loading}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
