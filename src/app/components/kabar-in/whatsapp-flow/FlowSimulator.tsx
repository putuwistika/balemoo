import { useState } from 'react';
import { useWhatsAppFlows } from '@/app/contexts/WhatsAppFlowContext';
import { X, RotateCcw } from 'lucide-react';

interface FlowSimulatorProps {
    onClose: () => void;
}

// Simple markdown inline parser for simulator preview
function parseSimulatorInline(text: string): (string | JSX.Element)[] {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let k = 0;
    while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
        const strikeMatch = remaining.match(/~~(.+?)~~/);
        const matches = [
            boldMatch ? { type: "b", m: boldMatch, idx: boldMatch.index! } : null,
            italicMatch ? { type: "i", m: italicMatch, idx: italicMatch.index! } : null,
            strikeMatch ? { type: "s", m: strikeMatch, idx: strikeMatch.index! } : null,
        ].filter(Boolean).sort((a, b) => a!.idx - b!.idx);
        if (matches.length === 0) { parts.push(remaining); break; }
        const f = matches[0]!;
        if (f.idx > 0) parts.push(remaining.substring(0, f.idx));
        k++;
        if (f.type === "b") parts.push(<strong key={k}>{f.m![1]}</strong>);
        else if (f.type === "i") parts.push(<em key={k}>{f.m![1]}</em>);
        else if (f.type === "s") parts.push(<s key={k}>{f.m![1]}</s>);
        remaining = remaining.substring(f.idx + f.m![0].length);
    }
    return parts;
}

function MarkdownText({ text }: { text: string }) {
    if (!text) return null;
    const lines = text.split("\n");
    return (
        <div>
            {lines.map((line, i) => {
                if (line.startsWith('### ')) return <div key={i} className="font-semibold">{parseSimulatorInline(line.slice(4))}</div>;
                if (line.startsWith('## ')) return <div key={i} className="font-bold">{parseSimulatorInline(line.slice(3))}</div>;
                if (line.startsWith('# ')) return <div key={i} className="font-bold text-lg">{parseSimulatorInline(line.slice(2))}</div>;
                if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} className="flex gap-1"><span>&bull;</span><span>{parseSimulatorInline(line.slice(2))}</span></div>;
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <div key={i}>{parseSimulatorInline(line)}</div>;
            })}
        </div>
    );
}

export function FlowSimulator({ onClose }: FlowSimulatorProps) {
    const { currentFlow } = useWhatsAppFlows();
    const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});

    if (!currentFlow || currentFlow.flow_json.screens.length === 0) {
        return null;
    }

    const currentScreen = currentFlow.flow_json.screens[currentScreenIndex];

    const handleRestart = () => {
        setCurrentScreenIndex(0);
        setFormData({});
    };

    const renderComponent = (component: any, index: number) => {
        switch (component.type) {
            case 'TextHeading':
                return (
                    <div key={index} className="text-xl font-bold text-gray-900 mb-2">
                        {component.text}
                    </div>
                );

            case 'TextSubheading':
                return (
                    <div key={index} className="text-lg font-semibold text-gray-800 mb-2">
                        {component.text}
                    </div>
                );

            case 'TextBody':
                return (
                    <div key={index} className={`text-gray-700 mb-3 ${component['font-weight'] === 'bold' || component['font-weight'] === 'bold_italic' ? 'font-bold' : ''} ${component['font-weight'] === 'italic' || component['font-weight'] === 'bold_italic' ? 'italic' : ''} ${component.strikethrough ? 'line-through' : ''}`}>
                        {component.markdown ? <MarkdownText text={component.text} /> : component.text}
                    </div>
                );

            case 'TextCaption':
                return (
                    <div key={index} className={`text-sm text-gray-600 mb-2 ${component['font-weight'] === 'bold' || component['font-weight'] === 'bold_italic' ? 'font-bold' : ''} ${component['font-weight'] === 'italic' || component['font-weight'] === 'bold_italic' ? 'italic' : ''} ${component.strikethrough ? 'line-through' : ''}`}>
                        {component.markdown ? <MarkdownText text={component.text} /> : component.text}
                    </div>
                );

            case 'TextInput':
                return (
                    <div key={index} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {component.label}
                            {component.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                            type={component['input-type'] || 'text'}
                            value={formData[component.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [component.name]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={component['helper-text'] || ''}
                        />
                    </div>
                );

            case 'RadioButtonsGroup':
                return (
                    <div key={index} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {component.label}
                            {component.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="space-y-2">
                            {component['data-source']?.map((option: any) => (
                                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={component.name}
                                        value={option.id}
                                        checked={formData[component.name] === option.id}
                                        onChange={(e) => setFormData({ ...formData, [component.name]: e.target.value })}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">{option.title}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'Footer':
                return (
                    <button
                        key={index}
                        onClick={() => {
                            const actionName = component['on-click-action']?.name;
                            if (actionName === 'navigate') {
                                const nextScreenId = component['on-click-action'].next?.name;
                                const nextIndex = currentFlow.flow_json.screens.findIndex(s => s.id === nextScreenId);
                                if (nextIndex !== -1) {
                                    setCurrentScreenIndex(nextIndex);
                                }
                            } else if (actionName === 'complete') {
                                alert('Flow completed! Data: ' + JSON.stringify(formData, null, 2));
                            } else if (actionName === 'data_exchange') {
                                alert('Data Exchange: Server would process this request.\nPayload: ' + JSON.stringify({ ...formData, ...(component['on-click-action'].payload || {}) }, null, 2));
                            }
                        }}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        {component.label}
                    </button>
                );

            default:
                return (
                    <div key={index} className="text-sm text-gray-500 italic mb-2">
                        {component.type} (preview not available)
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* WhatsApp Header */}
                <div className="bg-[#25D366] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded p-1">
                            ←
                        </button>
                        <div>
                            <div className="font-medium">{currentFlow.name}</div>
                            <div className="text-xs opacity-90">WhatsApp Flow</div>
                        </div>
                    </div>
                    <div className="text-xs">14:30</div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-auto p-4 bg-[#ECE5DD]">
                    <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                        {currentScreen.layout.children.map((component, index) =>
                            renderComponent(component, index)
                        )}
                        <div className="text-xs text-gray-400 text-right mt-2">14:30</div>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={handleRestart}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                        <RotateCcw size={16} />
                        Restart
                    </button>
                    <div className="text-xs text-gray-500">
                        Screen {currentScreenIndex + 1} of {currentFlow.flow_json.screens.length}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={16} />
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
