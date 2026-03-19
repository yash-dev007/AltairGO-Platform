import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, Shirt, AlertTriangle, Phone, Calendar, Star, Info } from 'lucide-react';
import { getDailyBriefing } from '../../services/api.js';
import toast from 'react-hot-toast';

const DailyBriefingPage = () => {
  const { id, day } = useParams();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyBriefing(id, day)
      .then(setBriefing)
      .catch(() => toast.error('Could not load briefing'))
      .finally(() => setLoading(false));
  }, [id, day]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="global-spinner" />
    </div>
  );

  if (!briefing) return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <p style={{ color: '#64748b' }}>No briefing data available.</p>
      <Link to={`/trip/${id}`} style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none' }}>Back to Trip</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link to={`/trip/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 500, marginBottom: '2rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Trip
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Day {day} Briefing</h1>
        {briefing.date && <p style={{ color: '#64748b', marginBottom: '2rem' }}>{briefing.date}</p>}

        {/* Morning Tip */}
        {briefing.morning_tip && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Star size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.4rem' }}>Morning Tip</h3>
                <p style={{ color: '#047857', lineHeight: 1.6 }}>{briefing.morning_tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {briefing.weather_alerts && briefing.weather_alerts.length > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudRain size={18} /> Weather Alerts
            </h3>
            {briefing.weather_alerts.map((a, i) => (
              <div key={i} style={{ color: '#d97706', marginBottom: '0.4rem' }}>• {a.message || a}</div>
            ))}
          </div>
        )}

        {/* What to Carry */}
        {briefing.what_to_carry && briefing.what_to_carry.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> What to Carry
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {briefing.what_to_carry.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                  <span style={{ color: '#4ade80' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dress Code */}
        {briefing.dress_code && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shirt size={18} /> Dress Code
            </h3>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{briefing.dress_code}</p>
          </div>
        )}

        {/* Today's Bookings */}
        {briefing.todays_bookings && briefing.todays_bookings.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Today's Confirmed Bookings</h3>
            {briefing.todays_bookings.map((b, i) => (
              <div key={i} style={{ padding: '0.75rem 0', borderBottom: i < briefing.todays_bookings.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{b.type || b.booking_type}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.details || b.provider_name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Local Events */}
        {briefing.local_events && briefing.local_events.length > 0 && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#0c4a6e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} /> Local Events Today
            </h3>
            {briefing.local_events.map((e, i) => (
              <div key={i} style={{ marginBottom: '0.5rem', color: '#0369a1' }}>• {e.name || e}</div>
            ))}
          </div>
        )}

        {/* Emergency Contacts */}
        {briefing.emergency_contacts && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: '#991b1b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} /> Emergency Contacts
            </h3>
            {Object.entries(briefing.emergency_contacts).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
                <span style={{ color: '#7f1d1d', textTransform: 'capitalize' }}>{k.replace('_', ' ')}</span>
                <span style={{ fontWeight: 700, color: '#991b1b' }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyBriefingPage;
