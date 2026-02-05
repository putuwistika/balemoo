import { Handle, Position } from '@xyflow/react';
import { Timer } from 'lucide-react';

export function DelayNode({ data, selected }: any) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: selected ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.3)',
        minWidth: '200px',
        boxShadow: selected
          ? '0 8px 24px rgba(16, 185, 129, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#10b981', width: '12px', height: '12px', border: '2px solid white' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Timer size={18} style={{ color: '#10b981' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'Delay'}
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        Wait for duration
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#10b981', width: '12px', height: '12px', border: '2px solid white' }}
      />
    </div>
  );
}
