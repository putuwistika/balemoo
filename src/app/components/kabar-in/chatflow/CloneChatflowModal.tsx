import React, { useState, useEffect } from 'react';
import { useChatflows } from '@/app/contexts/ChatflowContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Copy, Loader2, FolderOpen, Workflow } from 'lucide-react';
import { toast } from 'sonner';

interface ChatflowBrowseItem {
  id: string;
  name: string;
  description: string;
  status: string;
  nodesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CloneChatflowModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (clonedChatflow: any) => void;
}

export function CloneChatflowModal({ open, onClose, onSuccess }: CloneChatflowModalProps) {
  const { browseChatflows, cloneChatflow, fetchChatflows } = useChatflows();
  const { selectedProject, projects } = useProject();

  const [loading, setLoading] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [chatflowsByProject, setChatflowsByProject] = useState<Record<string, ChatflowBrowseItem[]>>({});
  
  // Form state
  const [sourceProjectId, setSourceProjectId] = useState<string>('');
  const [selectedChatflowId, setSelectedChatflowId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');

  // Load chatflows from all projects when modal opens
  useEffect(() => {
    if (open) {
      loadChatflows();
      // Reset form
      setSourceProjectId('');
      setSelectedChatflowId('');
      setNewName('');
    }
  }, [open]);

  // Update new name when chatflow is selected
  useEffect(() => {
    if (selectedChatflowId && sourceProjectId) {
      const chatflow = chatflowsByProject[sourceProjectId]?.find(cf => cf.id === selectedChatflowId);
      if (chatflow) {
        setNewName(`${chatflow.name} (Copy)`);
      }
    }
  }, [selectedChatflowId, sourceProjectId, chatflowsByProject]);

  const loadChatflows = async () => {
    try {
      setBrowsing(true);
      const result = await browseChatflows();
      setChatflowsByProject(result);
    } catch (err) {
      console.error('Failed to browse chatflows:', err);
      toast.error('Failed to load chatflows');
    } finally {
      setBrowsing(false);
    }
  };

  const handleClone = async () => {
    if (!selectedProject?.id) {
      toast.error('Please select a target project first');
      return;
    }

    if (!selectedChatflowId) {
      toast.error('Please select a chatflow to clone');
      return;
    }

    if (!newName.trim()) {
      toast.error('Please enter a name for the cloned chatflow');
      return;
    }

    try {
      setLoading(true);
      const cloned = await cloneChatflow(
        selectedChatflowId,
        newName.trim(),
        selectedProject.id,
        sourceProjectId
      );
      
      toast.success('Chatflow cloned successfully');
      
      // Refresh chatflows list for current project
      await fetchChatflows({ projectId: selectedProject.id });
      
      if (onSuccess) {
        onSuccess(cloned);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Failed to clone chatflow:', err);
      toast.error(err.message || 'Failed to clone chatflow');
    } finally {
      setLoading(false);
    }
  };

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  // Get available chatflows for selected source project
  const availableChatflows = sourceProjectId ? (chatflowsByProject[sourceProjectId] || []) : [];

  // Get project IDs that have chatflows
  const projectIdsWithChatflows = Object.keys(chatflowsByProject).filter(
    projectId => chatflowsByProject[projectId].length > 0
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy size={20} />
            Clone Chatflow from Another Project
          </DialogTitle>
          <DialogDescription>
            Clone an existing chatflow from any project to the current project ({selectedProject?.name}).
          </DialogDescription>
        </DialogHeader>

        {browsing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span className="text-sm text-gray-500">Loading chatflows...</span>
          </div>
        ) : projectIdsWithChatflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Workflow size={48} className="mx-auto mb-4 opacity-50" />
            <p>No chatflows found in any project.</p>
            <p className="text-sm">Create a chatflow first before cloning.</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Source Project */}
            <div className="space-y-2">
              <Label htmlFor="sourceProject" className="flex items-center gap-2">
                <FolderOpen size={16} />
                Source Project
              </Label>
              <Select value={sourceProjectId} onValueChange={(val) => {
                setSourceProjectId(val);
                setSelectedChatflowId(''); // Reset chatflow selection
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source project..." />
                </SelectTrigger>
                <SelectContent>
                  {projectIdsWithChatflows.map((projectId) => (
                    <SelectItem key={projectId} value={projectId}>
                      {getProjectName(projectId)} ({chatflowsByProject[projectId].length} chatflows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chatflow Selection */}
            {sourceProjectId && (
              <div className="space-y-2">
                <Label htmlFor="chatflow" className="flex items-center gap-2">
                  <Workflow size={16} />
                  Chatflow to Clone
                </Label>
                <Select value={selectedChatflowId} onValueChange={setSelectedChatflowId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chatflow..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChatflows.map((chatflow) => (
                      <SelectItem key={chatflow.id} value={chatflow.id}>
                        <div className="flex flex-col">
                          <span>{chatflow.name}</span>
                          <span className="text-xs text-gray-400">
                            {chatflow.nodesCount} nodes - {chatflow.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* New Name */}
            {selectedChatflowId && (
              <div className="space-y-2">
                <Label htmlFor="newName">New Chatflow Name</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter name for the cloned chatflow..."
                />
              </div>
            )}

            {/* Selected chatflow info */}
            {selectedChatflowId && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <p className="font-medium text-amber-800">Clone Details:</p>
                <ul className="mt-1 text-amber-700 space-y-1">
                  <li>From: {getProjectName(sourceProjectId)}</li>
                  <li>To: {selectedProject?.name}</li>
                  <li>Chatflow: {availableChatflows.find(cf => cf.id === selectedChatflowId)?.name}</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleClone}
            disabled={loading || !selectedChatflowId || !newName.trim()}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Cloning...
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" />
                Clone Chatflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
