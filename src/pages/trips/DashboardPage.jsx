import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { MapPin, Clock, DollarSign, Star, Share2, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { getUserTrips, shareTrip } from '../../services/api.js';
import { DashboardSkeleton } from '../../components/Skeleton/Skeleton.jsx';
import toast from 'react-hot-toast';

const TripCard = ({ trip, onShare }) => {
  const navigate = useNavigate();
  const itinerary = trip.itinerary_json
    ? (typeof trip.itinerary_json === 'string' ? JSON.parse(trip.itinerary_json) : trip.itinerary_json)
    : null;
  const title = trip.trip_title || itinerary?.trip_title || 'My Trip';
  const totalCost = trip.total_cost || trip.budget || itinerary?.total_cost || 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
    >
      {/* Color Banner */}
      <div style={{
        height: '8px',
        background: 'linear-gradient(90deg, #1e293b, #475569)',
      }} />

      <div style={{ padding: '1.5rem', flex: 1 }}>
        <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{title}</h3>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {trip.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b' }}>
              <Clock size={14} /> {trip.duration} days
            </div>
          )}
          {totalCost > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b' }}>
              <DollarSign size={14} /> ₹{Number(totalCost).toLocaleString('en-IN')}
            </div>
          )}
          {trip.travelers && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b' }}>
              <MapPin size={14} /> {trip.travelers} pax
            </div>
          )}
        </div>

        {trip.quality_score && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#065f46', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Star size={12} fill="#065f46" stroke="none" /> {trip.quality_score}/100
          </div>
        )}

        {trip.created_at && (
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
            {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f8fafc', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => navigate(`/trip/${trip.id}`)}
          style={{ flex: 1, padding: '0.6rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          View <ArrowRight size={14} />
        </button>
        <button
          onClick={() => onShare(trip.id)}
          style={{ width: '38px', height: '38px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
        >
          <Share2 size={14} />
        </button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login?redirect=/trips'); return; }
    fetchTrips();
  }, [user, authLoading]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getUserTrips(page);
      const items = Array.isArray(data) ? data : (data.trips || []);
      setTrips(prev => page === 1 ? items : [...prev, ...items]);
      setHasMore(items.length >= 12);
    } catch {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (tripId) => {
    try {
      const data = await shareTrip(tripId);
      const url = data.share_url || `${window.location.origin}/trip/shared/${data.share_token}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied!');
    } catch {
      toast.error('Could not get share link');
    }
  };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem 2rem' }}>
      <DashboardSkeleton count={3} />
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Hello, {user.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
              {trips.length > 0 ? `You have ${trips.length} saved trip${trips.length > 1 ? 's' : ''}` : 'Plan your next adventure'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to="/planner"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#1e293b', color: 'white', textDecoration: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem' }}
            >
              <Plus size={16} /> New Trip
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{ padding: '0.7rem 1.25rem', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </div>
        </div>

        {loading && trips.length === 0 ? (
          <DashboardSkeleton count={6} />
        ) : trips.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} onShare={handleShare} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <button
                  onClick={() => { setPage(p => p + 1); fetchTrips(); }}
                  disabled={loading}
                  style={{ padding: '0.85rem 2.5rem', background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px dashed #e2e8f0',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✈️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>No Saved Trips Yet</h2>
            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              Start planning your next adventure with our AI-powered trip generator. It only takes 2 minutes!
            </p>
            <Link
              to="/planner"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '1rem 2.5rem', background: '#1e293b', color: 'white', textDecoration: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '1rem' }}
            >
              <Sparkles size={20} /> Plan Your First Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
