import { useState, useRef } from 'react';
import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { generateScreenId, createDefaultScreen } from '@/app/utils/flowHelpers';

export function ScreenNavigator() {
    const {
        currentFlow,
        selectedScreen,
        selectScreen,
        addScreen,
        deleteScreen,
        reorderScreens,
    } = useWhatsAppFlows();

    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const dragRef = useRef<number | null>(null);

    if (!currentFlow) return null;

    const screens = currentFlow.flow_json.screens;

    const handleAddScreen = () => {
        const existingIds = screens.map((s) => s.id);
        const newId = generateScreenId(existingIds, 'SCREEN');
        const newScreen = createDefaultScreen(newId);
        addScreen(newScreen);
    };

    const handleDeleteScreen = (screenId: string) => {
        if (screens.length <= 1) {
            alert('Cannot delete the last screen');
            return;
        }
        if (confirm('Delete this screen?')) {
            deleteScreen(screenId);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragRef.current = index;
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragRef.current !== null && dragRef.current !== index) {
            setDropIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDropIndex(null);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = dragRef.current;
        if (sourceIndex === null || sourceIndex === targetIndex) {
            resetDragState();
            return;
        }

        const reordered = [...screens];
        const [moved] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, moved);
        reorderScreens(reordered);
        resetDragState();
    };

    const handleDragEnd = () => {
        resetDragState();
    };

    const resetDragState = () => {
        setDragIndex(null);
        setDropIndex(null);
        dragRef.current = null;
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

            <div className="space-y-1">
                {screens.map((screen, index) => (
                    <div
                        key={screen.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => selectScreen(screen)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedScreen?.id === screen.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        } ${dragIndex === index ? 'opacity-40' : ''} ${
                            dropIndex === index ? 'border-t-2 border-t-blue-500' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                                <div
                                    className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <GripVertical size={14} />
                                </div>
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
                            </div>
                            {screens.length > 1 && (
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
