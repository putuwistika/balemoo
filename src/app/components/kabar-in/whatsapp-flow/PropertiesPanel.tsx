import { useState } from 'react';
import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { COMPONENT_CATEGORIES } from '@/app/types/whatsappFlow';
import { createDefaultComponent, getComponentDisplayName, getComponentDescription, generateComponentName, extractFieldNames } from '@/app/utils/flowHelpers';
import { Plus, Trash2 } from 'lucide-react';
import type { ComponentType, Action, NavigateAction, CompleteAction, DataExchangeAction } from '@/app/types/whatsappFlow';

export function PropertiesPanel() {
    const {
        currentFlow,
        selectedScreen,
        selectedComponent,
        selectedComponentIndex,
        updateScreen,
        updateComponent,
        addComponent,
    } = useWhatsAppFlows();

    const [showComponentPalette, setShowComponentPalette] = useState(false);

    if (!selectedScreen) {
        return (
            <div className="p-4">
                <p className="text-gray-500 text-sm">Select a screen to view properties</p>
            </div>
        );
    }

    const handleAddComponent = (type: ComponentType) => {
        let newComponent = createDefaultComponent(type);

        // Generate unique name for input components
        if ('name' in newComponent) {
            const existingNames = extractFieldNames(selectedScreen);
            const baseName = type.toLowerCase().replace(/group|component/gi, '');
            const uniqueName = generateComponentName(existingNames, baseName);
            newComponent = { ...newComponent, name: uniqueName };
        }

        addComponent(newComponent);
        setShowComponentPalette(false);
    };

    const allScreenIds = currentFlow?.flow_json.screens.map((s) => s.id) || [];

    // Get the current action from a component
    const getAction = (): Action | undefined => {
        if (!selectedComponent) return undefined;
        if ('on-click-action' in selectedComponent) {
            return (selectedComponent as any)['on-click-action'];
        }
        return undefined;
    };

    const getOnSelectAction = (): Action | undefined => {
        if (!selectedComponent) return undefined;
        if ('on-select-action' in selectedComponent) {
            return (selectedComponent as any)['on-select-action'];
        }
        return undefined;
    };

    const handleActionTypeChange = (actionName: string) => {
        if (selectedComponentIndex === null) return;

        let newAction: Action;
        if (actionName === 'navigate') {
            const otherScreens = allScreenIds.filter((id) => id !== selectedScreen.id);
            newAction = {
                name: 'navigate',
                next: { type: 'screen', name: otherScreens[0] || '' },
                payload: {},
            } as NavigateAction;
        } else if (actionName === 'complete') {
            newAction = { name: 'complete', payload: {} } as CompleteAction;
        } else {
            newAction = { name: 'data_exchange', payload: {} } as DataExchangeAction;
        }

        updateComponent(selectedComponentIndex, { 'on-click-action': newAction } as any);
    };

    const handleNextScreenChange = (screenId: string) => {
        if (selectedComponentIndex === null) return;
        const action = getAction();
        if (!action || action.name !== 'navigate') return;

        const updated: NavigateAction = {
            ...action,
            next: { type: 'screen', name: screenId },
        };
        updateComponent(selectedComponentIndex, { 'on-click-action': updated } as any);
    };

    const handleOnSelectActionChange = (actionName: string) => {
        if (selectedComponentIndex === null) return;

        if (actionName === 'none') {
            // Remove on-select-action
            const { 'on-select-action': _, ...rest } = selectedComponent as any;
            // We can't easily remove a key via updateComponent, so set it to undefined
            updateComponent(selectedComponentIndex, { 'on-select-action': undefined } as any);
            return;
        }

        let newAction: Action;
        if (actionName === 'data_exchange') {
            newAction = { name: 'data_exchange', payload: {} } as DataExchangeAction;
        } else {
            newAction = { name: 'update_data', payload: {} } as any;
        }

        updateComponent(selectedComponentIndex, { 'on-select-action': newAction } as any);
    };

    const handlePayloadChange = (key: string, value: string, actionProp: 'on-click-action' | 'on-select-action') => {
        if (selectedComponentIndex === null || !selectedComponent) return;
        const action = actionProp === 'on-click-action' ? getAction() : getOnSelectAction();
        if (!action) return;

        const updatedPayload = { ...(action.payload || {}), [key]: value };
        const updatedAction = { ...action, payload: updatedPayload };
        updateComponent(selectedComponentIndex, { [actionProp]: updatedAction } as any);
    };

    const handlePayloadRemove = (key: string, actionProp: 'on-click-action' | 'on-select-action') => {
        if (selectedComponentIndex === null || !selectedComponent) return;
        const action = actionProp === 'on-click-action' ? getAction() : getOnSelectAction();
        if (!action) return;

        const updatedPayload = { ...(action.payload || {}) };
        delete updatedPayload[key];
        const updatedAction = { ...action, payload: updatedPayload };
        updateComponent(selectedComponentIndex, { [actionProp]: updatedAction } as any);
    };

    const isFooter = selectedComponent?.type === 'Footer';
    const hasOnSelectAction = selectedComponent && (
        selectedComponent.type === 'RadioButtonsGroup' ||
        selectedComponent.type === 'CheckboxGroup' ||
        selectedComponent.type === 'Dropdown' ||
        selectedComponent.type === 'DatePicker' ||
        selectedComponent.type === 'CalendarPicker'
    );

    return (
        <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Properties</h2>

            {/* Add Component Button */}
            <button
                onClick={() => setShowComponentPalette(!showComponentPalette)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Plus size={16} />
                Add Component
            </button>

            {/* Component Palette */}
            {showComponentPalette && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg max-h-96 overflow-auto">
                    {COMPONENT_CATEGORIES.map((category) => (
                        <div key={category.name} className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                {category.label}
                            </h3>
                            <div className="space-y-1">
                                {category.components.map((componentType) => (
                                    <button
                                        key={componentType}
                                        onClick={() => handleAddComponent(componentType)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-white rounded transition-colors"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {getComponentDisplayName(componentType)}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {getComponentDescription(componentType)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Screen Properties */}
            {!selectedComponent && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Screen ID
                        </label>
                        <input
                            type="text"
                            value={selectedScreen.id}
                            onChange={(e) => updateScreen(selectedScreen.id, { id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={selectedScreen.title || ''}
                            onChange={(e) => updateScreen(selectedScreen.id, { title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="terminal"
                            checked={selectedScreen.terminal || false}
                            onChange={(e) => updateScreen(selectedScreen.id, { terminal: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="terminal" className="text-sm text-gray-700">
                            Terminal Screen
                        </label>
                    </div>

                    {selectedScreen.terminal && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="success"
                                checked={selectedScreen.success || false}
                                onChange={(e) => updateScreen(selectedScreen.id, { success: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="success" className="text-sm text-gray-700">
                                Success
                            </label>
                        </div>
                    )}
                </div>
            )}

            {/* Component Properties */}
            {selectedComponent && selectedComponentIndex !== null && (
                <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                        {getComponentDisplayName(selectedComponent.type)}
                    </div>

                    {/* Text property */}
                    {selectedComponent.type.startsWith('Text') && 'text' in selectedComponent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Text
                            </label>
                            <textarea
                                value={selectedComponent.text}
                                onChange={(e) => updateComponent(selectedComponentIndex, { text: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Label property */}
                    {'label' in selectedComponent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Label
                            </label>
                            <input
                                type="text"
                                value={selectedComponent.label}
                                onChange={(e) => updateComponent(selectedComponentIndex, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Name property */}
                    {'name' in selectedComponent && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Field Name
                            </label>
                            <input
                                type="text"
                                value={selectedComponent.name}
                                onChange={(e) => updateComponent(selectedComponentIndex, { name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Required property */}
                    {'required' in selectedComponent && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="required"
                                checked={selectedComponent.required || false}
                                onChange={(e) => updateComponent(selectedComponentIndex, { required: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="required" className="text-sm text-gray-700">
                                Required
                            </label>
                        </div>
                    )}

                    {/* Footer Action Editor */}
                    {isFooter && (
                        <ActionEditor
                            action={getAction()}
                            actionProp="on-click-action"
                            label="On Click Action"
                            actionTypes={['navigate', 'complete', 'data_exchange']}
                            allScreenIds={allScreenIds}
                            currentScreenId={selectedScreen.id}
                            onActionTypeChange={handleActionTypeChange}
                            onNextScreenChange={handleNextScreenChange}
                            onPayloadChange={handlePayloadChange}
                            onPayloadRemove={handlePayloadRemove}
                        />
                    )}

                    {/* On-Select Action Editor for selection components */}
                    {hasOnSelectAction && (
                        <OnSelectActionEditor
                            action={getOnSelectAction()}
                            onActionChange={handleOnSelectActionChange}
                            onPayloadChange={handlePayloadChange}
                            onPayloadRemove={handlePayloadRemove}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// --- Sub-components ---

function ActionEditor({
    action,
    actionProp,
    label,
    actionTypes,
    allScreenIds,
    currentScreenId,
    onActionTypeChange,
    onNextScreenChange,
    onPayloadChange,
    onPayloadRemove,
}: {
    action: Action | undefined;
    actionProp: 'on-click-action' | 'on-select-action';
    label: string;
    actionTypes: string[];
    allScreenIds: string[];
    currentScreenId: string;
    onActionTypeChange: (name: string) => void;
    onNextScreenChange: (screenId: string) => void;
    onPayloadChange: (key: string, value: string, prop: 'on-click-action' | 'on-select-action') => void;
    onPayloadRemove: (key: string, prop: 'on-click-action' | 'on-select-action') => void;
}) {
    const [newPayloadKey, setNewPayloadKey] = useState('');

    const actionName = action?.name || 'navigate';
    const navigableScreens = allScreenIds.filter((id) => id !== currentScreenId);

    return (
        <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase">{label}</h3>

            {/* Action Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                </label>
                <select
                    value={actionName}
                    onChange={(e) => onActionTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    {actionTypes.map((t) => (
                        <option key={t} value={t}>
                            {t === 'navigate' ? 'Navigate to Screen' : t === 'complete' ? 'Complete Flow' : 'Data Exchange (Server)'}
                        </option>
                    ))}
                </select>
            </div>

            {/* Next Screen (only for navigate) */}
            {actionName === 'navigate' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Screen
                    </label>
                    {navigableScreens.length > 0 ? (
                        <select
                            value={action && 'next' in action ? action.next.name : ''}
                            onChange={(e) => onNextScreenChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {navigableScreens.map((id) => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-xs text-gray-500">No other screens available. Add more screens first.</p>
                    )}
                </div>
            )}

            {/* Payload Editor */}
            <PayloadEditor
                payload={action?.payload}
                actionProp={actionProp}
                newPayloadKey={newPayloadKey}
                setNewPayloadKey={setNewPayloadKey}
                onPayloadChange={onPayloadChange}
                onPayloadRemove={onPayloadRemove}
            />
        </div>
    );
}

function OnSelectActionEditor({
    action,
    onActionChange,
    onPayloadChange,
    onPayloadRemove,
}: {
    action: Action | undefined;
    onActionChange: (name: string) => void;
    onPayloadChange: (key: string, value: string, prop: 'on-click-action' | 'on-select-action') => void;
    onPayloadRemove: (key: string, prop: 'on-click-action' | 'on-select-action') => void;
}) {
    const [newPayloadKey, setNewPayloadKey] = useState('');
    const currentValue = action?.name || 'none';

    return (
        <div className="border-t border-gray-200 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase">On-Select Action</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                </label>
                <select
                    value={currentValue}
                    onChange={(e) => onActionChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="none">None</option>
                    <option value="data_exchange">Data Exchange (Server)</option>
                    <option value="update_data">Update Data</option>
                </select>
            </div>

            {action && (
                <PayloadEditor
                    payload={action.payload}
                    actionProp="on-select-action"
                    newPayloadKey={newPayloadKey}
                    setNewPayloadKey={setNewPayloadKey}
                    onPayloadChange={onPayloadChange}
                    onPayloadRemove={onPayloadRemove}
                />
            )}
        </div>
    );
}

function PayloadEditor({
    payload,
    actionProp,
    newPayloadKey,
    setNewPayloadKey,
    onPayloadChange,
    onPayloadRemove,
}: {
    payload: Record<string, any> | undefined;
    actionProp: 'on-click-action' | 'on-select-action';
    newPayloadKey: string;
    setNewPayloadKey: (key: string) => void;
    onPayloadChange: (key: string, value: string, prop: 'on-click-action' | 'on-select-action') => void;
    onPayloadRemove: (key: string, prop: 'on-click-action' | 'on-select-action') => void;
}) {
    const entries = Object.entries(payload || {});

    const handleAddKey = () => {
        const key = newPayloadKey.trim();
        if (!key) return;
        onPayloadChange(key, '', actionProp);
        setNewPayloadKey('');
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Payload
            </label>
            <div className="space-y-2">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-600 w-24 truncate" title={key}>
                            {key}
                        </span>
                        <input
                            type="text"
                            value={typeof value === 'string' ? value : JSON.stringify(value)}
                            onChange={(e) => onPayloadChange(key, e.target.value, actionProp)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => onPayloadRemove(key, actionProp)}
                            className="p-1 text-gray-400 hover:text-red-600"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newPayloadKey}
                        onChange={(e) => setNewPayloadKey(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
                        placeholder="New key..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAddKey}
                        disabled={!newPayloadKey.trim()}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
