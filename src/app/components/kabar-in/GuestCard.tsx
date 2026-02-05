import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Tag, Users, Calendar, CheckCircle2, Clock, XCircle, HelpCircle, Edit, Trash2, Eye } from 'lucide-react';
import type { Guest } from '../../types/guest';

interface GuestCardProps {
  guest: Guest;
  onView?: (guest: Guest) => void;
  onEdit?: (guest: Guest) => void;
  onDelete?: (guest: Guest) => void;
}

const categoryColors: Record<string, string> = {
  family: '#10b981',
  friend: '#3b82f6',
  colleague: '#f59e0b',
  vip: '#a855f7',
  other: '#64748b',
};

const categoryLabels: Record<string, string> = {
  family: 'Family',
  friend: 'Friend',
  colleague: 'Colleague',
  vip: 'VIP',
  other: 'Other',
};

const rsvpStatusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  declined: XCircle,
  maybe: HelpCircle,
};

const rsvpStatusColors = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  declined: '#ef4444',
  maybe: '#6b7280',
};

const rsvpStatusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
  maybe: 'Maybe',
};

const invitationTypeLabels = {
  ceremony_only: 'Ceremony Only',
  reception_only: 'Reception Only',
  both: 'Both Events',
};

export const GuestCard: React.FC<GuestCardProps> = ({ guest, onView, onEdit, onDelete }) => {
  const categoryColor = categoryColors[guest.category] || categoryColors.other;
  const RSVPIcon = rsvpStatusIcons[guest.rsvp_status];
  const rsvpColor = rsvpStatusColors[guest.rsvp_status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, translateY: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      {/* Main Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Category Color Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
          }}
        />

        {/* Checked-in Badge */}
        {guest.checked_in_at && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '6px 12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle2 size={14} />
            Checked In
          </div>
        )}

        {/* Guest Name & Category */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} style={{ color: categoryColor }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1a1a1a',
                  marginBottom: '2px',
                  lineHeight: '1.2',
                }}
              >
                {guest.name}
              </h3>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  background: `${categoryColor}15`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: categoryColor,
                }}
              >
                {categoryLabels[guest.category]}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#4b5563' }}>{guest.phone}</span>
          </div>
          {guest.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {guest.email}
              </span>
            </div>
          )}
        </div>

        {/* RSVP Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            background: `${rsvpColor}10`,
            border: `1px solid ${rsvpColor}30`,
            borderRadius: '12px',
            marginBottom: '16px',
          }}
        >
          <RSVPIcon size={18} style={{ color: rsvpColor }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: rsvpColor }}>
            {rsvpStatusLabels[guest.rsvp_status]}
          </span>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            {invitationTypeLabels[guest.invitation_type]}
          </div>
        </div>

        {/* Plus One Info */}
        {guest.plus_one && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              marginBottom: '16px',
            }}
          >
            <Users size={16} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '13px', color: '#4b5563' }}>
              {guest.plus_one_name || 'Plus One'}
              {guest.plus_one_confirmed && (
                <span style={{ marginLeft: '4px', color: '#10b981', fontWeight: 600 }}>✓</span>
              )}
            </span>
          </div>
        )}

        {/* Tags */}
        {guest.tags && guest.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {guest.tags.slice(0, 3).map((tag, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#6b7280',
                }}
              >
                <Tag size={12} />
                {tag}
              </div>
            ))}
            {guest.tags.length > 3 && (
              <div
                style={{
                  padding: '4px 10px',
                  background: 'rgba(107, 114, 128, 0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#6b7280',
                }}
              >
                +{guest.tags.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Table Number */}
        {guest.table_number && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#8b5cf6',
              }}
            >
              Table {guest.table_number}
            </div>
          </div>
        )}

        {/* RSVP Date */}
        {guest.rsvp_at && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '12px',
            }}
          >
            <Calendar size={14} />
            RSVP: {new Date(guest.rsvp_at).toLocaleDateString()}
          </div>
        )}

        {/* Hover Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            gap: '8px',
            opacity: 0,
          }}
          className="group-hover:opacity-100"
        >
          {onView && (
            <button
              onClick={() => onView(guest)}
              style={{
                padding: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Eye size={16} style={{ color: '#3b82f6' }} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(guest)}
              style={{
                padding: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Edit size={16} style={{ color: '#10b981' }} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(guest)}
              style={{
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Trash2 size={16} style={{ color: '#ef4444' }} />
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
