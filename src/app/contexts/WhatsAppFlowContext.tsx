import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import { projectId as supabaseProjectId, publicAnonKey } from '/utils/supabase/info';
import type {
    WhatsAppFlow,
    WhatsAppFlowTemplate,
    FlowJSON,
    FlowScreen,
    Component,
    FlowCategory,
} from '@/app/types/whatsappFlow';
import { validateFlowJSON, type ValidationResult } from '@/app/utils/flowValidation';
import { syncScreenData } from '@/app/utils/flowHelpers';

// Map backend record to frontend WhatsAppFlow type
function mapFlowFromBackend(record: any): WhatsAppFlow {
    return {
        id: record.id,
        project_id: record.projectId,
        name: record.name,
        description: record.description,
        category: record.category,
        status: record.status,
        flow_json: record.flowJson,
        version: record.version,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        created_by: record.createdBy,
        published_at: record.publishedAt,
    };
}

// Map backend template to frontend WhatsAppFlowTemplate type
function mapTemplateFromBackend(record: any): WhatsAppFlowTemplate {
    return {
        id: record.id,
        name: record.name,
        description: record.description,
        category: record.category,
        thumbnail_url: record.thumbnailUrl,
        flow_json: record.flowJson,
        is_public: record.isPublic,
        created_at: record.createdAt,
    };
}

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

    // Auto-save timer ref (useRef to avoid re-renders)
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Ref to latest currentFlow for auto-save
    const currentFlowRef = useRef<WhatsAppFlow | null>(null);
    currentFlowRef.current = currentFlow;

    const baseUrl = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-deeab278`;

    const getHeaders = useCallback(() => ({
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Token': accessToken || '',
        'Content-Type': 'application/json',
    }), [accessToken]);

    // Fetch flows for current project
    const fetchFlows = useCallback(async () => {
        if (!user || !accessToken || !selectedProject?.id) {
            setFlows([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${baseUrl}/wa-flows?projectId=${encodeURIComponent(selectedProject.id)}`,
                {
                    method: 'GET',
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch flows');
            }

            const data = await response.json();
            const mappedFlows = (data.flows || []).map(mapFlowFromBackend);
            setFlows(mappedFlows);
        } catch (err: any) {
            console.error('Error fetching flows:', err);
            setError(err.message || 'Failed to fetch flows');
            setFlows([]);
        } finally {
            setLoading(false);
        }
    }, [user, accessToken, selectedProject, baseUrl, getHeaders]);

    // Get flow by ID
    const getFlowById = async (id: string): Promise<WhatsAppFlow | null> => {
        if (!user || !accessToken || !selectedProject?.id) return null;

        try {
            const response = await fetch(
                `${baseUrl}/wa-flows/${id}?projectId=${encodeURIComponent(selectedProject.id)}`,
                {
                    method: 'GET',
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch flow');
            }

            const data = await response.json();
            return data.flow ? mapFlowFromBackend(data.flow) : null;
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
        if (!user || !accessToken || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const response = await fetch(`${baseUrl}/wa-flows`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    name,
                    description,
                    category,
                    projectId: selectedProject.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create flow');
            }

            const data = await response.json();
            const newFlow = mapFlowFromBackend(data.flow);
            setFlows((prev) => [newFlow, ...prev]);
            return newFlow;
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
        if (!user || !accessToken || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const response = await fetch(`${baseUrl}/wa-flows/from-template`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    templateId,
                    name,
                    projectId: selectedProject.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create flow from template');
            }

            const data = await response.json();
            const newFlow = mapFlowFromBackend(data.flow);
            setFlows((prev) => [newFlow, ...prev]);
            return newFlow;
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
        if (!user || !accessToken || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            // Map frontend field names to backend field names
            const backendUpdates: any = {};
            if (updates.name !== undefined) backendUpdates.name = updates.name;
            if (updates.description !== undefined) backendUpdates.description = updates.description;
            if (updates.category !== undefined) backendUpdates.category = updates.category;
            if (updates.status !== undefined) backendUpdates.status = updates.status;
            if (updates.flow_json !== undefined) backendUpdates.flowJson = updates.flow_json;

            const response = await fetch(
                `${baseUrl}/wa-flows/${id}?projectId=${encodeURIComponent(selectedProject.id)}`,
                {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(backendUpdates),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update flow');
            }

            const data = await response.json();
            const updatedFlow = mapFlowFromBackend(data.flow);

            setFlows((prev) => prev.map((f) => (f.id === id ? updatedFlow : f)));

            if (currentFlowRef.current?.id === id) {
                setCurrentFlowState(updatedFlow);
            }

            return updatedFlow;
        } catch (err: any) {
            console.error('Error updating flow:', err);
            throw err;
        }
    };

    // Delete flow
    const deleteFlow = async (id: string): Promise<void> => {
        if (!user || !accessToken || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const response = await fetch(
                `${baseUrl}/wa-flows/${id}?projectId=${encodeURIComponent(selectedProject.id)}`,
                {
                    method: 'DELETE',
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete flow');
            }

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
        if (!user || !accessToken || !selectedProject?.id) {
            throw new Error('Unauthorized or no project selected');
        }

        try {
            const response = await fetch(`${baseUrl}/wa-flows/${id}/clone`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    newName,
                    sourceProjectId: selectedProject.id,
                    targetProjectId: selectedProject.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to clone flow');
            }

            const data = await response.json();
            const clonedFlow = mapFlowFromBackend(data.flow);
            setFlows((prev) => [clonedFlow, ...prev]);
            return clonedFlow;
        } catch (err: any) {
            console.error('Error cloning flow:', err);
            throw err;
        }
    };

    // Fetch templates
    const fetchTemplates = useCallback(async () => {
        if (!user || !accessToken) return;

        try {
            const response = await fetch(`${baseUrl}/wa-flow-templates`, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch templates');
            }

            const data = await response.json();
            const mappedTemplates = (data.templates || []).map(mapTemplateFromBackend);
            setTemplates(mappedTemplates);
        } catch (err: any) {
            console.error('Error fetching templates:', err);
        }
    }, [user, accessToken, baseUrl, getHeaders]);

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

        if (selectedScreen?.id === screenId) {
            setSelectedScreen({ ...selectedScreen, ...updates });
        }

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

        if (selectedScreen?.id === screenId) {
            setSelectedScreen(updatedScreens[0] || null);
        }

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

        const syncedScreen = syncScreenData(updatedScreen);
        updateScreen(selectedScreen.id, syncedScreen);

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

        const syncedScreen = syncScreenData(updatedScreen);
        updateScreen(selectedScreen.id, syncedScreen);

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
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            saveCurrentFlow();
        }, 2000);
    };

    // Save current flow
    const saveCurrentFlow = async () => {
        const flow = currentFlowRef.current;
        if (!flow) return;

        try {
            await updateFlow(flow.id, {
                flow_json: flow.flow_json,
                name: flow.name,
            });
        } catch (err: any) {
            console.error('Auto-save failed:', err);
        }
    };

    // Fetch flows on mount and when project changes
    useEffect(() => {
        if (user && accessToken && selectedProject?.id) {
            fetchFlows();
            fetchTemplates();
        } else {
            setFlows([]);
            setTemplates([]);
        }
    }, [user, accessToken, selectedProject, fetchFlows, fetchTemplates]);

    // Cleanup auto-save timer
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

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
