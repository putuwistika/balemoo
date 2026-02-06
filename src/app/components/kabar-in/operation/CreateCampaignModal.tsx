import React, { useState, useEffect, useCallback } from 'react';
import { useCampaigns } from '@/app/contexts/CampaignContext';
import { useChatflows } from '@/app/contexts/ChatflowContext';
import { useProject } from '@/app/contexts/ProjectContext';
import { useGuests } from '@/app/contexts/GuestContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import { X, ChevronLeft, ChevronRight, Loader2, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { GuestSelectTable } from './GuestSelectTable';
import type { CreateCampaignInput } from '@/app/types/campaign';
import type { Guest } from '@/app/types/guest';
import type { Chatflow } from '@/app/types/chatflow';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Create Campaign Modal
 * 
 * Two-step wizard:
 * - Step 1: Campaign details (name, description, chatflow)
 * - Step 2: Select guests
 * 
 * Features:
 * - Project isolation (uses selectedProject.id)
 * - Guest selection persists during modal lifetime
 * - Proper form validation
 */
export function CreateCampaignModal({ open, onClose, onSuccess }: CreateCampaignModalProps) {
  const { selectedProject } = useProject();
  const { createCampaign } = useCampaigns();
  const { chatflows, fetchChatflows } = useChatflows();
  const { guests, fetchGuests } = useGuests();

  // Wizard step (1 or 2)
  const [step, setStep] = useState(1);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chatflow_id: '',
  });

  // Selected guest IDs - tracks user's selection
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);

  // Flag to track if initial guest selection has been done
  const [hasInitiallySelected, setHasInitiallySelected] = useState(false);

  // Load chatflows and guests when modal opens
  useEffect(() => {
    if (open && selectedProject?.id) {
      fetchChatflows({ projectId: selectedProject.id });
      refreshGuests();
    }
  }, [open, selectedProject?.id]);

  // Auto-select all guests ONLY ONCE when guests are first loaded
  useEffect(() => {
    if (open && guests.length > 0 && !hasInitiallySelected) {
      setSelectedGuestIds(guests.map((g: Guest) => g.id));
      setHasInitiallySelected(true);
    }
  }, [open, guests.length, hasInitiallySelected]);

  // Reset modal state when opening/closing
  useEffect(() => {
    if (open) {
      // Reset to initial state when opening
      setStep(1);
      setFormData({ name: '', description: '', chatflow_id: '' });
      setHasInitiallySelected(false);
      // Don't clear selectedGuestIds here - let the auto-select effect handle it
    } else {
      // Clear everything when closing
      setSelectedGuestIds([]);
      setHasInitiallySelected(false);
    }
  }, [open]);

  // Refresh guests from backend
  const refreshGuests = useCallback(async () => {
    if (!selectedProject?.id) return;

    setLoadingGuests(true);
    try {
      await fetchGuests();
    } catch (error) {
      console.error('Failed to refresh guests:', error);
    } finally {
      setLoadingGuests(false);
    }
  }, [selectedProject?.id, fetchGuests]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedProject?.id) {
      toast.error('Please select a project first');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    if (!formData.chatflow_id) {
      toast.error('Please select a chatflow');
      return;
    }

    if (selectedGuestIds.length === 0) {
      toast.error('Please select at least one guest');
      return;
    }

    setLoading(true);
    try {
      const input: CreateCampaignInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        chatflow_id: formData.chatflow_id,
        guest_filter: {
          custom_guest_ids: selectedGuestIds,
        },
      };

      await createCampaign(input, selectedProject.id);
      toast.success(`Campaign "${formData.name}" created with ${selectedGuestIds.length} guests`);
      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create campaign';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Validate Step 1
  const isStep1Valid = formData.name.trim() && formData.chatflow_id;

  // Validate Step 2
  const isStep2Valid = selectedGuestIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            Create Campaign - Step {step} of 2
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 px-6 py-4 border-b bg-gray-50">
          <StepIndicator
            step={1}
            currentStep={step}
            label="Campaign Details"
          />
          <div className="flex-1 h-px bg-gray-300" />
          <StepIndicator
            step={2}
            currentStep={step}
            label="Select Guests"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <Step1Content
              formData={formData}
              setFormData={setFormData}
              chatflows={chatflows}
            />
          ) : (
            <Step2Content
              guests={guests}
              selectedGuestIds={selectedGuestIds}
              setSelectedGuestIds={setSelectedGuestIds}
              loading={loadingGuests}
              onRefresh={refreshGuests}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(1)}
            disabled={loading}
          >
            {step === 1 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {step === 2 && (
              <span className="text-sm text-gray-600 mr-4">
                {selectedGuestIds.length} of {guests.length} guests selected
              </span>
            )}

            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isStep2Valid}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Step Indicator Component
 */
interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
}

function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${isActive
            ? 'bg-blue-600 text-white'
            : isCompleted
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-500'
          }
        `}
      >
        {step}
      </div>
      <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

/**
 * Step 1: Campaign Details
 */
interface Step1ContentProps {
  formData: {
    name: string;
    description: string;
    chatflow_id: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    chatflow_id: string;
  }>>;
  chatflows: Chatflow[];
}

function Step1Content({ formData, setFormData, chatflows }: Step1ContentProps) {
  return (
    <div className="space-y-6 max-w-lg">
      {/* Campaign Name */}
      <div>
        <Label htmlFor="campaign-name" className="text-base font-medium">
          Campaign Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="campaign-name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Enter campaign name"
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="campaign-description" className="text-base font-medium">
          Description
        </Label>
        <Textarea
          id="campaign-description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the purpose of this campaign..."
          rows={3}
          className="mt-2"
        />
      </div>

      {/* Chatflow Selection */}
      <div>
        <Label htmlFor="campaign-chatflow" className="text-base font-medium">
          Select Chatflow <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.chatflow_id}
          onValueChange={(value: string) =>
            setFormData({ ...formData, chatflow_id: value })
          }
        >
          <SelectTrigger id="campaign-chatflow" className="mt-2">
            <SelectValue placeholder="Choose a chatflow to use" />
          </SelectTrigger>
          <SelectContent>
            {chatflows.length === 0 ? (
              <SelectItem value="_none" disabled>
                No chatflows available
              </SelectItem>
            ) : (
              chatflows.map((cf: Chatflow) => (
                <SelectItem key={cf.id} value={cf.id}>
                  {cf.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {chatflows.length === 0 && (
          <p className="text-sm text-amber-600 mt-2">
            Please create a chatflow first before creating a campaign.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Step 2: Select Guests
 */
interface Step2ContentProps {
  guests: Guest[];
  selectedGuestIds: string[];
  setSelectedGuestIds: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  onRefresh: () => void;
}

function Step2Content({
  guests,
  selectedGuestIds,
  setSelectedGuestIds,
  loading,
  onRefresh,
}: Step2ContentProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Select Recipients</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Guest Selection Table */}
      <GuestSelectTable
        guests={guests}
        selectedIds={selectedGuestIds}
        onSelectionChange={setSelectedGuestIds}
        loading={loading}
      />
    </div>
  );
}
