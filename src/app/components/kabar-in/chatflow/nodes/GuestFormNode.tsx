import { Handle, Position } from '@xyflow/react';
import { ClipboardList, CheckCircle, RotateCcw } from 'lucide-react';
import type { GuestFormConfig } from '@/app/types/chatflow';

interface GuestFormNodeProps {
  data: {
    label: string;
    config?: GuestFormConfig | null;
  };
  selected: boolean;
}

export function GuestFormNode({ data, selected }: GuestFormNodeProps) {
  const config = data.config as GuestFormConfig | null;
  const questionCount = config?.questions?.length || 0;
  const hasConfirmation = config?.enableConfirmation || false;
  const hasJumpOnMaxRetry = config?.onMaxRetry?.action === 'jump_to_node' && config?.onMaxRetry?.jumpToNodeId;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
        border: selected ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.3)',
        minWidth: '220px',
        boxShadow: selected
          ? '0 8px 24px rgba(16, 185, 129, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ 
          background: '#10b981', 
          width: '12px', 
          height: '12px', 
          border: '2px solid white' 
        }}
      />

      {/* Header */}
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
          <ClipboardList size={18} style={{ color: '#10b981' }} />
        </div>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {data.label || 'Guest Form'}
        </div>
      </div>

      {/* Info badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          {questionCount > 0 ? `${questionCount} question${questionCount > 1 ? 's' : ''}` : 'No questions yet'}
        </div>
        
        {hasConfirmation && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              color: '#059669',
            }}
          >
            <CheckCircle size={12} />
            <span>Confirmation enabled</span>
          </div>
        )}
        
        {hasJumpOnMaxRetry && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              color: '#f59e0b',
            }}
          >
            <RotateCcw size={12} />
            <span>Retry jump configured</span>
          </div>
        )}
      </div>

      {/* Output Handles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        {/* Confirmed output */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <Handle
            type="source"
            position={Position.Bottom}
            id="confirmed"
            style={{
              position: 'relative',
              transform: 'none',
              background: '#10b981',
              width: '10px',
              height: '10px',
              border: '2px solid white',
              left: 0,
              bottom: 0,
            }}
          />
          <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 500 }}>
            Confirmed
          </span>
        </div>

        {/* Max Retry output (optional) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 500 }}>
            Max Retry
          </span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="max_retry"
            style={{
              position: 'relative',
              transform: 'none',
              background: '#f59e0b',
              width: '10px',
              height: '10px',
              border: '2px solid white',
              right: 0,
              bottom: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
