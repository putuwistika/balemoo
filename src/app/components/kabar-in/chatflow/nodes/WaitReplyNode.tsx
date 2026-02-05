import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export function WaitReplyNode({ data, selected }: any) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: selected ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)',
        minWidth: '200px',
        boxShadow: selected
          ? '0 8px 24px rgba(59, 130, 246, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#3b82f6', width: '12px', height: '12px', border: '2px solid white' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Clock size={18} style={{ color: '#3b82f6' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'Wait Reply'}
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        Wait for user response
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#3b82f6', width: '12px', height: '12px', border: '2px solid white' }}
      />
    </div>
  );
}
