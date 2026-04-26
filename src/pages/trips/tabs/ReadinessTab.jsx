import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function ReadinessTab({ readiness }) {
  if (!readiness) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#5e5d59' }}>
        <div className="global-spinner" style={{ margin: '0 auto 1rem' }} />
        <p>Loading readiness check...</p>
      </div>
    );
  }

  const scoreColor = readiness.score >= 80 ? '#10b981' : readiness.score >= 50 ? '#0BA060' : '#ef4444';

  return (
    <div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: scoreColor }}>
          {readiness.score}%
        </div>
        <div style={{ color: '#5e5d59', fontSize: '1.05rem', marginBottom: '1.5rem' }}>Trip Readiness</div>
        <div style={{ background: '#faf9f5', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '999px', background: scoreColor, width: `${readiness.score}%`, transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {readiness.checklist && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 700, color: '#141413', marginBottom: '1rem' }}>Readiness Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {readiness.checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {item.status === 'done' ? <Check size={18} color="#10b981" /> : <AlertCircle size={18} color="#0BA060" />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#141413', fontSize: '0.9rem' }}>{item.label}</div>
                  {item.note && <div style={{ fontSize: '0.8rem', color: '#5e5d59', marginTop: '2px' }}>{item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
