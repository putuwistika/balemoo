import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { getComponentDisplayName } from '@/app/utils/flowHelpers';

export function ScreenEditor() {
    const {
        selectedScreen,
        selectedComponentIndex,
        selectComponent,
        deleteComponent,
    } = useWhatsAppFlows();

    if (!selectedScreen) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <p>Select a screen to edit</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedScreen.id}</h2>
                    {selectedScreen.title && (
                        <p className="text-gray-600">{selectedScreen.title}</p>
                    )}
                </div>

                {/* Components List */}
                <div className="space-y-3">
                    {selectedScreen.layout.children.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="mb-4">No components yet</p>
                            <p className="text-sm">Add components from the properties panel</p>
                        </div>
                    ) : (
                        selectedScreen.layout.children.map((component, index) => (
                            <div
                                key={index}
                                onClick={() => selectComponent(component, index)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedComponentIndex === index
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <GripVertical size={20} className="text-gray-400 mt-1" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                {getComponentDisplayName(component.type)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {component.type.startsWith('Text') && 'text' in component && (
                                                <div className="line-clamp-2">{component.text}</div>
                                            )}
                                            {('label' in component) && (
                                                <div className="line-clamp-1">{component.label}</div>
                                            )}
                                            {('name' in component) && (
                                                <div className="text-xs text-gray-500 mt-1">Field: {component.name}</div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this component?')) {
                                                deleteComponent(index);
                                            }
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
