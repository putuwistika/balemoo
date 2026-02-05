import { Handle, Position } from '@xyflow/react';
import { Flag } from 'lucide-react';

export function EndNode({ data, selected }: any) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(100, 116, 139, 0.05) 100%)',
        border: selected ? '2px solid #64748b' : '1px solid rgba(100, 116, 139, 0.3)',
        minWidth: '200px',
        boxShadow: selected
          ? '0 8px 24px rgba(100, 116, 139, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#64748b', width: '12px', height: '12px', border: '2px solid white' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(100, 116, 139, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Flag size={18} style={{ color: '#64748b' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'End'}
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        End conversation
      </div>
    </div>
  );
}
