import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Upload, Download, Users, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGuests } from '../../contexts/GuestContext';
import { GuestCard } from './GuestCard';
import type { Guest, RSVPStatus, GuestCategory } from '../../types/guest';
import { toast } from 'sonner';

export const GuestList: React.FC = () => {
  const { user } = useAuth();
  const { guests, filteredGuests, loading, stats, filters, setFilters, deleteGuest } = useGuests();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRSVPFilter, setSelectedRSVPFilter] = useState<RSVPStatus | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<GuestCategory | 'all'>('all');

  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          You need admin access to manage guests.
        </p>
      </div>
    );
  }

  // Update filters when search or filters change
  React.useEffect(() => {
    setFilters({
      search: searchTerm,
      rsvp_status: selectedRSVPFilter,
      category: selectedCategoryFilter,
    });
  }, [searchTerm, selectedRSVPFilter, selectedCategoryFilter]);

  const handleDelete = async (guest: Guest) => {
    if (window.confirm(`Are you sure you want to delete ${guest.name}?`)) {
      try {
        await deleteGuest(guest.id);
        toast.success('Guest deleted successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete guest');
      }
    }
  };

  const rsvpFilterTabs = [
    { value: 'all' as const, label: 'All', icon: Users, count: stats?.total || 0 },
    { value: 'confirmed' as const, label: 'Confirmed', icon: CheckCircle2, count: stats?.confirmed || 0 },
    { value: 'pending' as const, label: 'Pending', icon: Clock, count: stats?.pending || 0 },
    { value: 'maybe' as const, label: 'Maybe', icon: HelpCircle, count: stats?.maybe || 0 },
    { value: 'declined' as const, label: 'Declined', icon: XCircle, count: stats?.declined || 0 },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
              }}
            >
              Guest Management
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              Manage your wedding guest list and track RSVPs
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => toast.info('CSV Import coming soon!')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Upload size={18} />
              Import CSV
            </button>
            <button
              onClick={() => toast.info('Add Guest form coming soon!')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Plus size={18} />
              Add Guest
            </button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'Total Guests', value: stats.total, color: '#10b981' },
            { label: 'Confirmed', value: stats.confirmed, color: '#10b981' },
            { label: 'Pending', value: stats.pending, color: '#f59e0b' },
            { label: 'With Plus One', value: stats.with_plus_one, color: '#3b82f6' },
            { label: 'Checked In', value: stats.checked_in, color: '#8b5cf6' },
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '24px' }}
      >
        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: '16px',
          }}
        >
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            type="text"
            placeholder="Search guests by name, phone, email, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              fontSize: '15px',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* RSVP Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {rsvpFilterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedRSVPFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedRSVPFilter(tab.value)}
                style={{
                  padding: '10px 16px',
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(255, 255, 255, 0.9)',
                  color: isActive ? 'white' : '#4b5563',
                  border: isActive ? 'none' : '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                <Icon size={16} />
                {tab.label}
                <span
                  style={{
                    padding: '2px 8px',
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Guest Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading guests...</div>
        </div>
      ) : filteredGuests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '64px 32px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Users size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
            No guests found
          </h3>
          <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px' }}>
            {guests.length === 0
              ? 'Get started by adding your first guest or importing from CSV'
              : 'Try adjusting your search or filters'}
          </p>
          <button
            onClick={() => toast.info('Add Guest form coming soon!')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={18} />
            Add Your First Guest
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GuestCard
                guest={guest}
                onView={() => toast.info('Guest details modal coming soon!')}
                onEdit={() => toast.info('Edit guest form coming soon!')}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
