import React, { useState, useEffect } from 'react';
import { useExecutions } from '@/app/contexts/ExecutionContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { ExecutionStatusBadge } from './shared/ExecutionStatusBadge';
import { PhaseIndicator } from './shared/PhaseIndicator';
import { ProgressBar } from './shared/ProgressBar';
import { BulkActionsBar } from './BulkActionsBar';
import type { ChatflowExecution, ExecutionStatus } from '@/app/types/execution';

interface ExecutionListProps {
  campaignId: string;
}

export function ExecutionList({ campaignId }: ExecutionListProps) {
  const { executions, loading, fetchExecutions } = useExecutions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchExecutions(campaignId);
  }, [campaignId]);

  const filteredExecutions = executions.filter((execution) => {
    // Search filter
    const matchesSearch =
      search === '' ||
      execution.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      execution.guest_phone.includes(search);

    // Status filter
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredExecutions.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (executionId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, executionId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== executionId));
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedIds([]);
    fetchExecutions(campaignId);
  };

  const allSelected =
    filteredExecutions.length > 0 && selectedIds.length === filteredExecutions.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredExecutions.length;

  if (loading && executions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ExecutionStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredExecutions.length} of {executions.length} executions
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          campaignId={campaignId}
          selectedIds={selectedIds}
          onComplete={handleBulkActionComplete}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'data-[state=checked]:bg-blue-600' : ''}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Guest
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Phase
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Progress
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredExecutions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No executions found
                </td>
              </tr>
            ) : (
              filteredExecutions.map((execution) => (
                <ExecutionRow
                  key={execution.id}
                  execution={execution}
                  selected={selectedIds.includes(execution.id)}
                  onSelect={(checked) => handleSelectOne(execution.id, checked)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Execution Row Component
interface ExecutionRowProps {
  execution: ChatflowExecution;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

function ExecutionRow({ execution, selected, onSelect }: ExecutionRowProps) {
  const completedNodes = execution.node_history.filter((n) => n.status === 'completed').length;
  const totalNodes = execution.node_history.length || 1;
  const progress = (completedNodes / totalNodes) * 100;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <Checkbox checked={selected} onCheckedChange={onSelect} />
      </td>
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-gray-900">{execution.guest_name}</div>
          <div className="text-sm text-gray-500">{execution.guest_phone}</div>
        </div>
      </td>
      <td className="px-4 py-4">
        <ExecutionStatusBadge status={execution.status} />
      </td>
      <td className="px-4 py-4">
        {execution.current_phase ? (
          <PhaseIndicator phase={execution.current_phase} />
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="w-32">
          <ProgressBar progress={progress} size="sm" showLabel={false} />
          <div className="text-xs text-gray-500 mt-1">
            {completedNodes}/{totalNodes} nodes
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </td>
    </tr>
  );
}
