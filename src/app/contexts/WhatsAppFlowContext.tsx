import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { createClient } from '@supabase/supabase-js';
import { projectId as supabaseProjectId, publicAnonKey } from '@/utils/supabase/info';
import type {
    WhatsAppFlow,
    WhatsAppFlowTemplate,
    FlowJSON,
    FlowScreen,
    Component,
    FlowCategory,
} from '@/app/types/whatsappFlow';
import { validateFlowJSON, type ValidationResult } from '@/app/utils/flowValidation';
import { cloneFlow as cloneFlowHelper, syncScreenData } from '@/app/utils/flowHelpers';

// Initialize Supabase client
const supabase = createClient(
    `https://${supabaseProjectId}.supabase.co`,
    publicAnonKey
);

interface WhatsAppFlowContextType {
    flows: WhatsAppFlow[];
    templates: WhatsAppFlowTemplate[];
    currentFlow: WhatsAppFlow | null;
    selectedScreen: FlowScreen | null;
    selectedComponent: Component | null;
    selectedComponentIndex: number | null;
    loading: boolean;
    error: string | null;
    validationResult: ValidationResult | null;

    // Flow operations
    fetchFlows: () => Promise<void>;
    getFlowById: (id: string) => Promise<WhatsAppFlow | null>;
    createFlow: (name: string, category: FlowCategory, description?: string) => Promise<WhatsAppFlow>;
    createFlowFromTemplate: (templateId: string, name: string) => Promise<WhatsAppFlow>;
    updateFlow: (id: string, updates: Partial<WhatsAppFlow>) => Promise<WhatsAppFlow>;
    deleteFlow: (id: string) => Promise<void>;
    cloneFlow: (id: string, newName: string) => Promise<WhatsAppFlow>;

    // Template operations
    fetchTemplates: () => Promise<void>;

    // Screen operations
    setCurrentFlow: (flow: WhatsAppFlow | null) => void;
    selectScreen: (screen: FlowScreen | null) => void;
    addScreen: (screen: FlowScreen) => void;
    updateScreen: (screenId: string, updates: Partial<FlowScreen>) => void;
    deleteScreen: (screenId: string) => void;
    reorderScreens: (screens: FlowScreen[]) => void;

    // Component operations
    selectComponent: (component: Component | null, index: number | null) => void;
    addComponent: (component: Component) => void;
    updateComponent: (index: number, updates: Partial<Component>) => void;
    deleteComponent: (index: number) => void;
    reorderComponents: (components: Component[]) => void;

    // Validation
    validateCurrentFlow: () => ValidationResult;

    // Auto-save
    saveCurrentFlow: () => Promise<void>;
}

const WhatsAppFlowContext = createContext<WhatsAppFlowContextType | undefined>(undefined);

export function WhatsAppFlowProvider({ children }: { children: ReactNode }) {
    const { user, accessToken } = useAuth();
    const { selectedProject } = useProject();

    const [flows, setFlows] = useState<WhatsAppFlow[]>([]);
    const [templates, setTemplates] = useState<WhatsAppFlowTemplate[]>([]);
    const [currentFlow, setCurrentFlowState] = useState<WhatsAppFlow | null>(null);
    const [selectedScreen, setSelectedScreen] = useState<FlowScreen | null>(null);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

    // Auto-save timer
    const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

    // Fetch flows for current project
    const fetchFlows = useCallback(async () => {
        if (!user || !selectedProject?.id) {
            setFlows([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('whatsapp_flows')
                .select('*')
                .eq('project_id', selectedProject.id)
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;

            setFlows(data || []);
        } catch (err: any) {
            console.error('Error fetching flows:', err);
            setError(err.message || 'Failed to fetch flows');
            setFlows([]);
        } finally {
            setLoading(false);
        }
    }, [user, selectedProject]);

    // Get flow by ID
    const getFlowById = async (id: string): Promise<WhatsAppFlow | null> => {
        if (!user || !selectedProject?.id) return null;

        try {
            const { data, error: fetchError } = await supabase
                .from('whatsapp_flows')
                .select('*')
                .eq('id', id)
                .eq('project_id', selectedProject.id)
                .single();

            if (fetchError) throw fetchError;

            return data;
        } catch (err: any) {
            console.error('Error fetching flow:', err);
            return null;
        }
    };

    // Create new flow
    const createFlow = async (
        name: string,
        category: FlowCategory,
        description?: string
    ): Promise<WhatsAppFlow> => {
        if (!user || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const newFlow: Partial<WhatsAppFlow> = {
                project_id: selectedProject.id,
                name,
                description,
                category,
                status: 'draft',
                version: '5.0',
                flow_json: {
                    version: '5.0',
                    screens: [],
                },
                created_by: user.id,
            };

            const { data, error: createError } = await supabase
                .from('whatsapp_flows')
                .insert([newFlow])
                .select()
                .single();

            if (createError) throw createError;

            setFlows((prev) => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error creating flow:', err);
            throw err;
        }
    };

    // Create flow from template
    const createFlowFromTemplate = async (
        templateId: string,
        name: string
    ): Promise<WhatsAppFlow> => {
        if (!user || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            // Fetch template
            const { data: template, error: templateError } = await supabase
                .from('whatsapp_flow_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (templateError) throw templateError;

            // Create flow from template
            const newFlow: Partial<WhatsAppFlow> = {
                project_id: selectedProject.id,
                name,
                description: template.description,
                category: template.category,
                status: 'draft',
                version: '5.0',
                flow_json: template.flow_json,
                created_by: user.id,
            };

            const { data, error: createError } = await supabase
                .from('whatsapp_flows')
                .insert([newFlow])
                .select()
                .single();

            if (createError) throw createError;

            setFlows((prev) => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error creating flow from template:', err);
            throw err;
        }
    };

    // Update flow
    const updateFlow = async (
        id: string,
        updates: Partial<WhatsAppFlow>
    ): Promise<WhatsAppFlow> => {
        if (!user || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const { data, error: updateError } = await supabase
                .from('whatsapp_flows')
                .update(updates)
                .eq('id', id)
                .eq('project_id', selectedProject.id)
                .select()
                .single();

            if (updateError) throw updateError;

            setFlows((prev) => prev.map((f) => (f.id === id ? data : f)));

            // Update current flow if it's the one being updated
            if (currentFlow?.id === id) {
                setCurrentFlowState(data);
            }

            return data;
        } catch (err: any) {
            console.error('Error updating flow:', err);
            throw err;
        }
    };

    // Delete flow
    const deleteFlow = async (id: string): Promise<void> => {
        if (!user || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const { error: deleteError } = await supabase
                .from('whatsapp_flows')
                .delete()
                .eq('id', id)
                .eq('project_id', selectedProject.id);

            if (deleteError) throw deleteError;

            setFlows((prev) => prev.filter((f) => f.id !== id));

            if (currentFlow?.id === id) {
                setCurrentFlowState(null);
            }
        } catch (err: any) {
            console.error('Error deleting flow:', err);
            throw err;
        }
    };

    // Clone flow
    const cloneFlow = async (id: string, newName: string): Promise<WhatsAppFlow> => {
        if (!user || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const original = await getFlowById(id);
            if (!original) throw new Error('Flow not found');

            const cloned = cloneFlowHelper(original, newName);

            const newFlow: Partial<WhatsAppFlow> = {
                ...cloned,
                project_id: selectedProject.id,
                created_by: user.id,
            };

            const { data, error: createError } = await supabase
                .from('whatsapp_flows')
                .insert([newFlow])
                .select()
                .single();

            if (createError) throw createError;

            setFlows((prev) => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error cloning flow:', err);
            throw err;
        }
    };

    // Fetch templates
    const fetchTemplates = async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('whatsapp_flow_templates')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setTemplates(data || []);
        } catch (err: any) {
            console.error('Error fetching templates:', err);
        }
    };

    // Set current flow
    const setCurrentFlow = (flow: WhatsAppFlow | null) => {
        setCurrentFlowState(flow);
        setSelectedScreen(flow?.flow_json?.screens?.[0] || null);
        setSelectedComponent(null);
        setSelectedComponentIndex(null);
        setValidationResult(null);
    };

    // Select screen
    const selectScreen = (screen: FlowScreen | null) => {
        setSelectedScreen(screen);
        setSelectedComponent(null);
        setSelectedComponentIndex(null);
    };

    // Add screen
    const addScreen = (screen: FlowScreen) => {
        if (!currentFlow) return;

        const updatedFlowJSON: FlowJSON = {
            ...currentFlow.flow_json,
            screens: [...currentFlow.flow_json.screens, screen],
        };

        setCurrentFlowState({
            ...currentFlow,
            flow_json: updatedFlowJSON,
        });

        // Trigger auto-save
        triggerAutoSave();
    };

    // Update screen
    const updateScreen = (screenId: string, updates: Partial<FlowScreen>) => {
        if (!currentFlow) return;

        const updatedScreens = currentFlow.flow_json.screens.map((s) =>
            s.id === screenId ? { ...s, ...updates } : s
        );

        const updatedFlowJSON: FlowJSON = {
            ...currentFlow.flow_json,
            screens: updatedScreens,
        };

        setCurrentFlowState({
            ...currentFlow,
            flow_json: updatedFlowJSON,
        });

        // Update selected screen if it's the one being updated
        if (selectedScreen?.id === screenId) {
            setSelectedScreen({ ...selectedScreen, ...updates });
        }

        // Trigger auto-save
        triggerAutoSave();
    };

    // Delete screen
    const deleteScreen = (screenId: string) => {
        if (!currentFlow) return;

        const updatedScreens = currentFlow.flow_json.screens.filter((s) => s.id !== screenId);

        const updatedFlowJSON: FlowJSON = {
            ...currentFlow.flow_json,
            screens: updatedScreens,
        };

        setCurrentFlowState({
            ...currentFlow,
            flow_json: updatedFlowJSON,
        });

        // Clear selection if deleted screen was selected
        if (selectedScreen?.id === screenId) {
            setSelectedScreen(updatedScreens[0] || null);
        }

        // Trigger auto-save
        triggerAutoSave();
    };

    // Reorder screens
    const reorderScreens = (screens: FlowScreen[]) => {
        if (!currentFlow) return;

        const updatedFlowJSON: FlowJSON = {
            ...currentFlow.flow_json,
            screens,
        };

        setCurrentFlowState({
            ...currentFlow,
            flow_json: updatedFlowJSON,
        });

        // Trigger auto-save
        triggerAutoSave();
    };

    // Select component
    const selectComponent = (component: Component | null, index: number | null) => {
        setSelectedComponent(component);
        setSelectedComponentIndex(index);
    };

    // Add component
    const addComponent = (component: Component) => {
        if (!currentFlow || !selectedScreen) return;

        const updatedComponents = [...selectedScreen.layout.children, component];

        const updatedScreen: FlowScreen = {
            ...selectedScreen,
            layout: {
                ...selectedScreen.layout,
                children: updatedComponents,
            },
        };

        // Sync screen data with components
        const syncedScreen = syncScreenData(updatedScreen);

        updateScreen(selectedScreen.id, syncedScreen);
    };

    // Update component
    const updateComponent = (index: number, updates: Partial<Component>) => {
        if (!currentFlow || !selectedScreen) return;

        const updatedComponents = selectedScreen.layout.children.map((c, i) =>
            i === index ? { ...c, ...updates } : c
        );

        const updatedScreen: FlowScreen = {
            ...selectedScreen,
            layout: {
                ...selectedScreen.layout,
                children: updatedComponents,
            },
        };

        // Sync screen data with components
        const syncedScreen = syncScreenData(updatedScreen);

        updateScreen(selectedScreen.id, syncedScreen);

        // Update selected component
        if (selectedComponentIndex === index) {
            setSelectedComponent({ ...selectedComponent!, ...updates });
        }
    };

    // Delete component
    const deleteComponent = (index: number) => {
        if (!currentFlow || !selectedScreen) return;

        const updatedComponents = selectedScreen.layout.children.filter((_, i) => i !== index);

        const updatedScreen: FlowScreen = {
            ...selectedScreen,
            layout: {
                ...selectedScreen.layout,
                children: updatedComponents,
            },
        };

        // Sync screen data with components
        const syncedScreen = syncScreenData(updatedScreen);

        updateScreen(selectedScreen.id, syncedScreen);

        // Clear selection if deleted component was selected
        if (selectedComponentIndex === index) {
            setSelectedComponent(null);
            setSelectedComponentIndex(null);
        }
    };

    // Reorder components
    const reorderComponents = (components: Component[]) => {
        if (!currentFlow || !selectedScreen) return;

        const updatedScreen: FlowScreen = {
            ...selectedScreen,
            layout: {
                ...selectedScreen.layout,
                children: components,
            },
        };

        updateScreen(selectedScreen.id, updatedScreen);
    };

    // Validate current flow
    const validateCurrentFlow = (): ValidationResult => {
        if (!currentFlow) {
            return {
                valid: false,
                errors: [{ message: 'No flow selected', type: 'error' }],
                warnings: [],
            };
        }

        const result = validateFlowJSON(currentFlow.flow_json);
        setValidationResult(result);
        return result;
    };

    // Auto-save trigger
    const triggerAutoSave = () => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        const timer = setTimeout(() => {
            saveCurrentFlow();
        }, 2000); // 2 seconds debounce

        setAutoSaveTimer(timer);
    };

    // Save current flow
    const saveCurrentFlow = async () => {
        if (!currentFlow) return;

        try {
            await updateFlow(currentFlow.id, {
                flow_json: currentFlow.flow_json,
            });
        } catch (err: any) {
            console.error('Auto-save failed:', err);
        }
    };

    // Fetch flows on mount and when project changes
    useEffect(() => {
        if (user && selectedProject?.id) {
            fetchFlows();
            fetchTemplates();
        } else {
            setFlows([]);
            setTemplates([]);
        }
    }, [user, selectedProject, fetchFlows]);

    // Cleanup auto-save timer
    useEffect(() => {
        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [autoSaveTimer]);

    const value: WhatsAppFlowContextType = {
        flows,
        templates,
        currentFlow,
        selectedScreen,
        selectedComponent,
        selectedComponentIndex,
        loading,
        error,
        validationResult,
        fetchFlows,
        getFlowById,
        createFlow,
        createFlowFromTemplate,
        updateFlow,
        deleteFlow,
        cloneFlow,
        fetchTemplates,
        setCurrentFlow,
        selectScreen,
        addScreen,
        updateScreen,
        deleteScreen,
        reorderScreens,
        selectComponent,
        addComponent,
        updateComponent,
        deleteComponent,
        reorderComponents,
        validateCurrentFlow,
        saveCurrentFlow,
    };

    return (
        <WhatsAppFlowContext.Provider value={value}>
            {children}
        </WhatsAppFlowContext.Provider>
    );
}

export function useWhatsAppFlows() {
    const context = useContext(WhatsAppFlowContext);
    if (context === undefined) {
        throw new Error('useWhatsAppFlows must be used within a WhatsAppFlowProvider');
    }
    return context;
}
