import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { ScreenNavigator } from './ScreenNavigator';
import { ScreenEditor } from './ScreenEditor';
import { PropertiesPanel } from './PropertiesPanel';
import { FlowSimulator } from './FlowSimulator';
import { exportFlowJSON, importFlowJSON } from '@/app/utils/flowHelpers';
import { Save, Check, AlertCircle, Eye, Download, Upload, ArrowLeft } from 'lucide-react';

export function FlowStudio() {
    const { flowId } = useParams<{ flowId: string }>();
    const navigate = useNavigate();
    const {
        currentFlow,
        loading,
        error,
        validationResult,
        getFlowById,
        setCurrentFlow,
        validateCurrentFlow,
        saveCurrentFlow,
    } = useWhatsAppFlows();

    const [showSimulator, setShowSimulator] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

    useEffect(() => {
        if (flowId) {
            loadFlow();
        }
    }, [flowId]);

    const loadFlow = async () => {
        if (!flowId) return;

        const flow = await getFlowById(flowId);
        if (flow) {
            setCurrentFlow(flow);
        }
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            await saveCurrentFlow();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
        } catch (err) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleValidate = () => {
        const result = validateCurrentFlow();
        if (result.valid) {
            alert('Flow is valid! ✅');
        } else {
            alert(`Flow has ${result.errors.length} error(s). Check the console for details.`);
            console.log('Validation errors:', result.errors);
        }
    };

    const handleExport = () => {
        if (!currentFlow) return;
        exportFlowJSON(currentFlow);
    };

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const flowJSON = await importFlowJSON(file);
                if (currentFlow) {
                    setCurrentFlow({
                        ...currentFlow,
                        flow_json: flowJSON,
                    });
                    alert('Flow JSON imported successfully!');
                }
            } catch (err) {
                alert('Failed to import Flow JSON. Please check the file format.');
            }
        };
        input.click();
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading flow...</div>
            </div>
        );
    }

    if (error || !currentFlow) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-red-500">{error || 'Flow not found'}</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/kabar-in/whatsapp-flows`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <input
                        type="text"
                        value={currentFlow.name}
                        onChange={(e) => setCurrentFlow({ ...currentFlow, name: e.target.value })}
                        className="text-xl font-bold text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Save Status */}
                    {saveStatus && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded text-sm">
                            {saveStatus === 'saving' && (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                                    <span className="text-gray-600">Saving...</span>
                                </>
                            )}
                            {saveStatus === 'saved' && (
                                <>
                                    <Check size={16} className="text-green-600" />
                                    <span className="text-green-600">Saved</span>
                                </>
                            )}
                            {saveStatus === 'error' && (
                                <>
                                    <AlertCircle size={16} className="text-red-600" />
                                    <span className="text-red-600">Save failed</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Validation Status */}
                    {validationResult && !validationResult.valid && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded text-sm text-red-600">
                            <AlertCircle size={16} />
                            <span>{validationResult.errors.length} error(s)</span>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Save size={16} />
                        Save
                    </button>

                    <button
                        onClick={handleValidate}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Check size={16} />
                        Validate
                    </button>

                    <button
                        onClick={() => setShowSimulator(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye size={16} />
                        Preview
                    </button>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Export/Import
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={handleExport}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                            >
                                <Download size={16} />
                                Export JSON
                            </button>
                            <button
                                onClick={handleImport}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                            >
                                <Upload size={16} />
                                Import JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Three-Panel Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Screen Navigator */}
                <div className="w-64 bg-white border-r border-gray-200 overflow-auto">
                    <ScreenNavigator />
                </div>

                {/* Center - Screen Editor */}
                <div className="flex-1 overflow-auto">
                    <ScreenEditor />
                </div>

                {/* Right Sidebar - Properties Panel */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
                    <PropertiesPanel />
                </div>
            </div>

            {/* Simulator Modal */}
            {showSimulator && (
                <FlowSimulator onClose={() => setShowSimulator(false)} />
            )}
        </div>
    );
}
