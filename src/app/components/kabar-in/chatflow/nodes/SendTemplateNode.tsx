import { Handle, Position } from '@xyflow/react';
import { Mail } from 'lucide-react';

export function SendTemplateNode({ data, selected }: any) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: selected
          ? '2px solid #06b6d4'
          : '1px solid rgba(6, 182, 212, 0.3)',
        minWidth: '200px',
        boxShadow: selected
          ? '0 8px 24px rgba(6, 182, 212, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#06b6d4',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mail size={18} style={{ color: '#06b6d4' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'Send Template'}
        </div>
      </div>

      {/* Show template name if configured */}
      {data.config?.templateName && (
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.75rem',
            color: '#06b6d4',
            fontWeight: 500,
            marginBottom: '4px',
          }}
        >
          📄 {data.config.templateName}
        </div>
      )}

      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        {data.config?.templateId ? 'Template configured' : 'Send WhatsApp template'}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#06b6d4',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />
    </div>
  );
}
