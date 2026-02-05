import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data, selected }: any) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: selected ? '2px solid #8b5cf6' : '1px solid rgba(139, 92, 246, 0.3)',
        minWidth: '200px',
        boxShadow: selected
          ? '0 8px 24px rgba(139, 92, 246, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#8b5cf6', width: '12px', height: '12px', border: '2px solid white' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GitBranch size={18} style={{ color: '#8b5cf6' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'Condition'}
        </div>
      </div>

      {/* Show condition details if configured */}
      {data.config?.variable && data.config?.value && (
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.75rem',
            color: '#8b5cf6',
            fontWeight: 500,
            marginBottom: '4px',
            padding: '6px 8px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '6px',
          }}
        >
          {data.config.variable} {data.config.operator === 'equals' ? '==' :
           data.config.operator === 'not_equals' ? '!=' :
           data.config.operator === 'contains' ? '⊃' : '~'} {data.config.value}
        </div>
      )}

      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '0.75rem',
          color: '#6b7280',
        }}
      >
        {data.config?.variable ? 'Condition configured' : 'Branch based on logic'}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ background: '#10b981', width: '12px', height: '12px', border: '2px solid white', left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ background: '#ef4444', width: '12px', height: '12px', border: '2px solid white', left: '70%' }}
      />
    </div>
  );
}
