import { useState } from 'react';
import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { COMPONENT_CATEGORIES } from '@/app/types/whatsappFlow';
import { createDefaultComponent, getComponentDisplayName, getComponentDescription, generateComponentName, extractFieldNames } from '@/app/utils/flowHelpers';
import { Plus } from 'lucide-react';
import type { ComponentType } from '@/app/types/whatsappFlow';

export function PropertiesPanel() {
    const {
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

                    <p className="text-xs text-gray-500 mt-4">
                        More properties will be available in the full implementation
                    </p>
                </div>
            )}
        </div>
    );
}
