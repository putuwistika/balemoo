import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { Plus, Trash2 } from 'lucide-react';
import { generateScreenId, createDefaultScreen } from '@/app/utils/flowHelpers';

export function ScreenNavigator() {
    const {
        currentFlow,
        selectedScreen,
        selectScreen,
        addScreen,
        deleteScreen,
    } = useWhatsAppFlows();

    if (!currentFlow) return null;

    const handleAddScreen = () => {
        const existingIds = currentFlow.flow_json.screens.map((s) => s.id);
        const newId = generateScreenId(existingIds, 'SCREEN');
        const newScreen = createDefaultScreen(newId);
        addScreen(newScreen);
    };

    const handleDeleteScreen = (screenId: string) => {
        if (currentFlow.flow_json.screens.length <= 1) {
            alert('Cannot delete the last screen');
            return;
        }
        if (confirm('Delete this screen?')) {
            deleteScreen(screenId);
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Screens</h2>
                <button
                    onClick={handleAddScreen}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Add Screen"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-2">
                {currentFlow.flow_json.screens.map((screen, index) => (
                    <div
                        key={screen.id}
                        onClick={() => selectScreen(screen)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedScreen?.id === screen.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">{screen.id}</div>
                                {screen.title && (
                                    <div className="text-xs text-gray-600 mt-1">{screen.title}</div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    {screen.terminal && (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                            Terminal
                                        </span>
                                    )}
                                    {index === 0 && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                            Start
                                        </span>
                                    )}
                                </div>
                            </div>
                            {currentFlow.flow_json.screens.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteScreen(screen.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
