import React from 'react';
import { Package, Check } from 'lucide-react';

const BOOKING_TYPE_ICONS = {
  hotel: '🏨', flight: '✈️', activity: '🎯', restaurant: '🍽️',
  airport_transfer: '🚖', daily_cab: '🚕',
};

const BOOKING_STATUS_COLORS = {
  pending: '#f59e0b', approved: '#10b981', executed: '#3b82f6',
  failed: '#ef4444', cancelled: '#94a3b8', rejected: '#ef4444',
};

export default function BookingsTab({
  bookings,
  onApprove,
  onReject,
  onCancel,
  onExecuteAll,
}) {
  return (
    <div>
      {/* Workflow explainer */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {[
          { step: '1', label: 'Review', desc: 'Check each booking below' },
          { step: '2', label: 'Approve', desc: 'Click Approve on items you want' },
          { step: '3', label: 'Confirm & Book', desc: 'Hit the button to execute all at once' },
        ].map((s) => (
          <div key={s.step} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', minWidth: '140px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0ea5e9', color: 'white', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0c4a6e' }}>{s.label}</div>
              <div style={{ fontSize: '0.77rem', color: '#0369a1' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.2rem' }}>Booking Plan</h2>
        {bookings.some(b => b.status === 'approved') && (
          <button
            onClick={onExecuteAll}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            <Check size={16} /> Confirm & Book All Approved
          </button>
        )}
      </div>

      {/* Status summary bar */}
      {bookings.length > 0 && (() => {
        const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});
        const pills = Object.entries(counts).map(([status, count]) => ({ status, count }));
        return (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {pills.map(({ status, count }) => (
              <span key={status} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, background: (BOOKING_STATUS_COLORS[status] || '#94a3b8') + '18', color: BOOKING_STATUS_COLORS[status] || '#94a3b8', textTransform: 'capitalize' }}>
                {count} {status}
              </span>
            ))}
          </div>
        );
      })()}

      {bookings.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No bookings found. Generate a trip to see booking options.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((b) => {
            const typeIcon = BOOKING_TYPE_ICONS[b.booking_type] || '📌';
            const itemName = b.item_name || b.provider_name || b.booking_type?.replace(/_/g, ' ');
            const cost = b.cost_inr || b.estimated_cost;
            return (
              <div key={b.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${BOOKING_STATUS_COLORS[b.status] || '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{typeIcon}</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{itemName}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: (BOOKING_STATUS_COLORS[b.status] || '#94a3b8') + '20', color: BOOKING_STATUS_COLORS[b.status] || '#94a3b8', textTransform: 'capitalize' }}>
                        {b.status}
                      </span>
                      {b.self_arranged && (
                        <span title="You'll handle this booking yourself" style={{ fontSize: '0.75rem', background: '#f0f9ff', color: '#0284c7', padding: '3px 8px', borderRadius: '999px', fontWeight: 600, cursor: 'help' }}>Self-arranged ⓘ</span>
                      )}
                    </div>
                    {b.partner_name && <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>via {b.partner_name}</div>}
                    {b.notes && <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>{b.notes}</div>}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {cost > 0 && <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>₹{Number(cost).toLocaleString('en-IN')}</span>}
                      {b.booking_url && (
                        <a href={b.booking_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>View booking ↗</a>
                      )}
                      {b.booking_ref && (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ref: {b.booking_ref}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => onApprove(b.id)} style={{ padding: '0.5rem 1rem', background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Approve</button>
                        <button onClick={() => onReject(b.id)} style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Reject</button>
                      </>
                    )}
                    {(b.status === 'approved' || b.status === 'executed' || b.status === 'booked') && (
                      <button onClick={() => onCancel(b.id)} style={{ padding: '0.5rem 1rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
