import { Handle, Position } from '@xyflow/react';
import { Workflow } from 'lucide-react';

export function TriggerNode({ data, selected }: any) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
        border: selected
          ? '2px solid #f59e0b'
          : '1px solid rgba(245, 158, 11, 0.3)',
        minWidth: '200px',
        boxShadow: selected
          ? '0 8px 24px rgba(245, 158, 11, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Workflow size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'Start'}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        Flow starting point
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#f59e0b',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />
    </div>
  );
}
