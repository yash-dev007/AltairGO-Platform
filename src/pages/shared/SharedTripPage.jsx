import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Calendar, ChevronDown, ChevronUp, Star, Sparkles } from 'lucide-react';
import { getSharedTrip } from '../../services/api.js';

const SharedTripPage = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set([1]));

  useEffect(() => {
    getSharedTrip(token)
      .then(setTrip)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="global-spinner" /></div>;

  if (error || !trip) return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Trip not found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>This shared trip link may have expired.</p>
      <Link to="/" style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none', background: '#f1f5f9', padding: '0.75rem 1.5rem', borderRadius: '50px' }}>Go Home</Link>
    </div>
  );

  const itinerary = trip.itinerary_json
    ? (typeof trip.itinerary_json === 'string' ? JSON.parse(trip.itinerary_json) : trip.itinerary_json)
    : trip;
  const days = itinerary?.itinerary || [];
  const title = itinerary?.trip_title || trip.trip_title || 'Shared Trip';
  const totalCost = itinerary?.total_cost || trip.total_cost || 0;
  const insights = itinerary?.smart_insights || [];

  const toggleDay = (n) => setExpandedDays(prev => {
    const next = new Set(prev);
    next.has(n) ? next.delete(n) : next.add(n);
    return next;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Shared Banner */}
      <div style={{ background: '#1e293b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>Altair<span style={{ color: '#4ade80' }}>GO</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          <Sparkles size={14} color="#4ade80" /> Shared itinerary — read only
        </div>
        <Link to="/planner" style={{ background: '#4ade80', color: '#0f172a', padding: '0.5rem 1.25rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
          Plan My Trip
        </Link>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Hero Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>{title}</h1>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem', flexWrap: 'wrap' }}>
            {trip.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {trip.duration} days</span>}
            {totalCost > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> ₹{Number(totalCost).toLocaleString('en-IN')}</span>}
            {trip.travelers && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {trip.travelers} travelers</span>}
          </div>

          {insights.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Smart Insights</h3>
              {insights.map((insight, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.88rem', color: '#475569', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#4ade80' }}>•</span>
                  {typeof insight === 'string' ? insight : insight.text || insight.insight || ''}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Days */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {days.map((day) => {
            const dayNum = day.day || day.day_number;
            const isExpanded = expandedDays.has(dayNum);
            const activities = day.activities || [];

            return (
              <div key={dayNum} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div
                  onClick={() => toggleDay(dayNum)}
                  style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e293b', fontSize: '0.85rem', flexShrink: 0 }}>
                      {dayNum}
                    </div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>
                      Day {dayNum}{day.theme ? ` — ${day.theme}` : ''}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                </div>

                {isExpanded && activities.length > 0 && (
                  <div style={{ borderTop: '1px solid #f1f5f9' }}>
                    {activities.map((act, ai) => (
                      <div key={ai} style={{ padding: '0.9rem 1.5rem', borderBottom: ai < activities.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', minWidth: '60px', paddingTop: '2px' }}>{act.time || ''}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{act.name}</div>
                          {act.description && <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', lineHeight: 1.5 }}>{act.description}</p>}
                          {act.cost > 0 && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginTop: '4px' }}>₹{Number(act.cost).toLocaleString('en-IN')}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '3rem', textAlign: 'center', background: '#1e293b', borderRadius: '20px', padding: '2.5rem' }}>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem' }}>Love this itinerary?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>Create your own personalized trip in minutes with AltairGO's AI engine</p>
          <Link to="/planner" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#4ade80', color: '#0f172a', padding: '1rem 2.5rem', borderRadius: '50px', fontWeight: 700, textDecoration: 'none' }}>
            <Sparkles size={18} /> Plan My Own Trip
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedTripPage;
