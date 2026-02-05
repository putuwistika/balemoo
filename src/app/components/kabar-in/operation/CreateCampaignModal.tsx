import React, { useState, useEffect } from 'react';
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
import { ChevronLeft, ChevronRight, Check, Loader2, Users, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { GuestSelectTable } from './GuestSelectTable';
import type { CreateCampaignInput } from '@/app/types/campaign';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCampaignModal({ open, onClose, onSuccess }: CreateCampaignModalProps) {
  const { createCampaign } = useCampaigns();
  const { chatflows, fetchChatflows } = useChatflows();
  const { selectedProject } = useProject();
  const { guests, fetchGuests } = useGuests();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chatflow_id: '',
  });

  // Selected guest IDs (direct selection instead of filters)
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);

  // Load chatflows and refresh guests on mount
  useEffect(() => {
    if (open && selectedProject?.id) {
      fetchChatflows({ projectId: selectedProject.id });
      // Always refresh guests when modal opens to get latest data
      refreshGuests();
    }
  }, [open, selectedProject?.id]);

  // Update selected guests when guests list changes
  useEffect(() => {
    if (open && guests.length > 0) {
      // Default: select all guests
      setSelectedGuestIds(guests.map((g) => g.id));
    }
  }, [guests, open]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({
        name: '',
        description: '',
        chatflow_id: '',
      });
    }
  }, [open]);

  const refreshGuests = async () => {
    try {
      setLoadingGuests(true);
      await fetchGuests();
    } catch (err) {
      console.error('Failed to refresh guests:', err);
    } finally {
      setLoadingGuests(false);
    }
  };

  const handleNext = () => {
    // Validation
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error('Please enter a campaign name');
        return;
      }
      if (!formData.chatflow_id) {
        toast.error('Please select a chatflow');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedProject?.id) {
      toast.error('No project selected');
      return;
    }

    if (selectedGuestIds.length === 0) {
      toast.error('Please select at least one guest');
      return;
    }

    setLoading(true);
    try {
      const input: CreateCampaignInput = {
        name: formData.name,
        description: formData.description || undefined,
        chatflow_id: formData.chatflow_id,
        guest_filter: {
          // Use custom_guest_ids for direct guest selection
          custom_guest_ids: selectedGuestIds,
        },
        trigger_type: 'manual',
      };

      await createCampaign(input, selectedProject.id);
      toast.success('Campaign created successfully!');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      chatflow_id: '',
    });
    setSelectedGuestIds([]);
    onClose();
  };

  // Allow both 'active' and 'draft' chatflows to be used in campaigns
  const availableChatflows = chatflows.filter((cf) => cf.status === 'active' || cf.status === 'draft');

  const steps = [
    { number: 1, title: 'Campaign Setup', description: 'Name, description & chatflow' },
    { number: 2, title: 'Select Guests', description: 'Choose target audience' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a campaign to send WhatsApp messages to selected guests
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-8 py-4 border-b">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step > s.number
                      ? 'bg-green-600 border-green-600 text-white'
                      : step === s.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                </div>
                <div className="ml-3">
                  <div
                    className={`text-sm font-medium ${
                      step >= s.number ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 ${step > s.number ? 'bg-green-600' : 'bg-gray-300'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          {step === 1 && (
            <Step1CampaignSetup
              formData={formData}
              setFormData={setFormData}
              chatflows={availableChatflows}
            />
          )}
          {step === 2 && (
            <div className="space-y-4">
              {/* Refresh button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshGuests}
                  disabled={loadingGuests}
                >
                  {loadingGuests ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Guests
                </Button>
              </div>
              <GuestSelectTable
                selectedGuestIds={selectedGuestIds}
                onSelectionChange={setSelectedGuestIds}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {step === 2 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{selectedGuestIds.length} guests selected</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              {step < 2 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || selectedGuestIds.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Campaign
                      <MessageSquare className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Campaign Setup (combined basic info + chatflow selection)
function Step1CampaignSetup({ formData, setFormData, chatflows }: any) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Campaign Name */}
      <div>
        <Label htmlFor="name" className="text-base font-medium">
          Campaign Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., VIP Initial Invitation"
          className="mt-2"
        />
        <p className="mt-1 text-sm text-gray-500">
          Choose a descriptive name to identify this campaign
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-base font-medium">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the purpose of this campaign..."
          rows={3}
          className="mt-2"
        />
      </div>

      {/* Chatflow Selection */}
      <div>
        <Label htmlFor="chatflow" className="text-base font-medium">
          Select Chatflow *
        </Label>
        <Select
          value={formData.chatflow_id}
          onValueChange={(value) => setFormData({ ...formData, chatflow_id: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose a chatflow to use" />
          </SelectTrigger>
          <SelectContent>
            {chatflows.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No active chatflows available. Create one first in Chatflow Studio.
              </div>
            ) : (
              chatflows.map((chatflow: any) => (
                <SelectItem key={chatflow.id} value={chatflow.id}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    {chatflow.name}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="mt-1 text-sm text-gray-500">
          The chatflow defines the message sequence that will be sent to guests
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">How it works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Set up your campaign name and select a chatflow</li>
          <li>2. Choose which guests to include in this campaign</li>
          <li>3. Start the campaign to begin sending messages</li>
        </ul>
      </div>
    </div>
  );
}
