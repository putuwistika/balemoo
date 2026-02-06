import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import type { WhatsAppFlow, FlowCategory } from '@/app/types/whatsappFlow';
import { Plus, Search, Filter, Edit2, Copy, Trash2, Eye, FileJson } from 'lucide-react';

export function FlowList() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const {
        flows,
        templates,
        loading,
        error,
        createFlow,
        createFlowFromTemplate,
        deleteFlow,
        cloneFlow,
        fetchFlows,
    } = useWhatsAppFlows();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [flowToDelete, setFlowToDelete] = useState<WhatsAppFlow | null>(null);

    useEffect(() => {
        fetchFlows();
    }, [fetchFlows]);

    const filteredFlows = flows.filter((flow) => {
        const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateBlankFlow = async () => {
        try {
            const newFlow = await createFlow('New Flow', 'OTHER', 'Description');
            navigate(`/kabar-in/${projectId}/whatsapp-flows/${newFlow.id}`);
        } catch (err) {
            console.error('Failed to create flow:', err);
        }
    };

    const handleCreateFromTemplate = async (templateId: string, templateName: string) => {
        try {
            const newFlow = await createFlowFromTemplate(templateId, `${templateName} - Copy`);
            setShowTemplateModal(false);
            navigate(`/kabar-in/${projectId}/whatsapp-flows/${newFlow.id}`);
        } catch (err) {
            console.error('Failed to create flow from template:', err);
        }
    };

    const handleCloneFlow = async (flow: WhatsAppFlow) => {
        try {
            const clonedFlow = await cloneFlow(flow.id, `${flow.name} - Copy`);
            navigate(`/kabar-in/${projectId}/whatsapp-flows/${clonedFlow.id}`);
        } catch (err) {
            console.error('Failed to clone flow:', err);
        }
    };

    const handleDeleteFlow = async () => {
        if (!flowToDelete) return;

        try {
            await deleteFlow(flowToDelete.id);
            setShowDeleteModal(false);
            setFlowToDelete(null);
        } catch (err) {
            console.error('Failed to delete flow:', err);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'deprecated':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getCategoryLabel = (category: FlowCategory) => {
        return category.replace(/_/g, ' ');
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">WhatsApp Flows</h1>
                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Create Flow
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search flows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="deprecated">Deprecated</option>
                    </select>
                </div>
            </div>

            {/* Flow Grid */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading flows...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-red-500">{error}</div>
                    </div>
                ) : filteredFlows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FileJson size={48} className="mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">No flows yet</p>
                        <p className="text-sm mb-4">Create your first WhatsApp Flow to get started</p>
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Flow
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFlows.map((flow) => (
                            <div
                                key={flow.id}
                                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div
                                    onClick={() => navigate(`/kabar-in/${projectId}/whatsapp-flows/${flow.id}`)}
                                    className="p-6"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{flow.name}</h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(flow.status)}`}>
                                            {flow.status}
                                        </span>
                                    </div>

                                    {flow.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{flow.description}</p>
                                    )}

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                            {getCategoryLabel(flow.category)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {flow.flow_json.screens.length} screen{flow.flow_json.screens.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        Updated {new Date(flow.updated_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/kabar-in/${projectId}/whatsapp-flows/${flow.id}`);
                                        }}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCloneFlow(flow);
                                        }}
                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="Clone"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFlowToDelete(flow);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Create New Flow</h2>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-auto max-h-[calc(80vh-140px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Blank Flow Option */}
                                <div
                                    onClick={handleCreateBlankFlow}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <Plus size={48} className="text-gray-400 mb-3" />
                                        <h3 className="font-semibold text-gray-900 mb-2">Blank Flow</h3>
                                        <p className="text-sm text-gray-600">Start from scratch</p>
                                    </div>
                                </div>

                                {/* Templates */}
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => handleCreateFromTemplate(template.id, template.name)}
                                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                                        {template.description && (
                                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                                {getCategoryLabel(template.category)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {template.flow_json.screens.length} screens
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && flowToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Delete Flow</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete <strong>{flowToDelete.name}</strong>? This action cannot be undone.
                            </p>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setFlowToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteFlow}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
