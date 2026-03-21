import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, DollarSign, Clock, Share2, ArrowLeft, Star, ChevronDown, ChevronUp,
  Utensils, Camera, Mountain, Landmark, Sun, Moon, AlertCircle, Check, X,
  Plus, Pencil, RefreshCw, BookOpen, Package, TrendingUp, FileText, Coffee
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getTrip, shareTrip, getTripBookings, approveBooking, rejectBooking, cancelBooking,
  executeAllBookings, getExpenses, addExpense, deleteExpense, getTripReadiness,
  swapActivity, updateTripNotes, getTripSummary, getTripReview, submitTripReview,
} from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const BOOKING_TYPE_ICONS = {
  hotel: '🏨', flight: '✈️', activity: '🎯', restaurant: '🍽️',
  airport_transfer: '🚖', daily_cab: '🚕',
};

const PACING_COLORS = { intense: '#ef4444', moderate: '#f59e0b', relaxed: '#10b981' };
const BOOKING_STATUS_COLORS = {
  pending: '#f59e0b', approved: '#10b981', executed: '#3b82f6',
  failed: '#ef4444', cancelled: '#94a3b8', rejected: '#ef4444'
};

const ActivityIcon = ({ type }) => {
  const t = (type || '').toLowerCase();
  if (t.includes('restaurant') || t.includes('food') || t.includes('cafe')) return <Utensils size={16} />;
  if (t.includes('beach') || t.includes('nature') || t.includes('viewpoint')) return <Mountain size={16} />;
  if (t.includes('museum') || t.includes('temple') || t.includes('heritage')) return <Landmark size={16} />;
  if (t.includes('photo')) return <Camera size={16} />;
  return <Star size={16} />;
};

const TripViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [expandedDays, setExpandedDays] = useState(new Set([1]));
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [notes, setNotes] = useState('');
  const [expenseForm, setExpenseForm] = useState({ category: 'food', description: '', amount_inr: '', trip_day: 1 });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [tripSummary, setTripSummary] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', tags: [] });
  const [submittingReview, setSubmittingReview] = useState(false);

  const REVIEW_TAGS = ['great-value', 'well-paced', 'hidden-gems', 'family-friendly', 'romantic', 'adventure', 'foodie', 'budget-friendly'];
  const RATING_LABELS = ['', 'Disappointing', 'Below average', 'Average', 'Good', 'Excellent'];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const data = await getTrip(id);
      setTrip(data);
      setNotes(data.user_notes || '');
      // Silently pre-load bookings so we can show pending-bookings banner on itinerary tab
      getTripBookings(id).then(d => setBookings(d.bookings || d || [])).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const data = await shareTrip(id);
      const url = data.share_url || `${window.location.origin}/trip/shared/${data.share_token}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard!');
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const loadBookings = async () => {
    try {
      const data = await getTripBookings(id);
      setBookings(data.bookings || data || []);
    } catch { toast.error('Could not load bookings'); }
  };

  const loadExpenses = async () => {
    try {
      const data = await getExpenses(id);
      setExpenses(data.expenses || data || []);
    } catch { toast.error('Could not load expenses'); }
  };

  const loadReadiness = async () => {
    try {
      const data = await getTripReadiness(id);
      setReadiness(data);
    } catch { toast.error('Could not load readiness'); }
  };

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'expenses') loadExpenses();
    if (activeTab === 'readiness') loadReadiness();
    if (activeTab === 'summary') loadSummary();
  }, [activeTab]);

  const loadSummary = async () => {
    try {
      const [sumData, reviewData] = await Promise.allSettled([
        getTripSummary(id),
        getTripReview(id),
      ]);
      if (sumData.status === 'fulfilled') setTripSummary(sumData.value);
      if (reviewData.status === 'fulfilled' && reviewData.value?.review) {
        const r = reviewData.value.review;
        setExistingReview(r);
        setReviewForm({ rating: r.rating || 0, comment: r.comment || '', tags: r.tags || [] });
      }
    } catch { /* silent */ }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) { toast.error('Please select a rating'); return; }
    setSubmittingReview(true);
    try {
      await submitTripReview(id, reviewForm);
      toast.success(existingReview ? 'Review updated!' : 'Review submitted!');
      loadSummary();
    } catch (err) { toast.error(err.message || 'Could not submit review'); }
    finally { setSubmittingReview(false); }
  };

  const toggleReviewTag = (tag) => {
    setReviewForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag].slice(0, 5),
    }));
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await approveBooking(bookingId);
      toast.success('Booking approved');
      loadBookings();
    } catch { toast.error('Failed to approve'); }
  };

  const handleExecuteAll = async () => {
    try {
      await executeAllBookings(id);
      toast.success('All approved bookings executed!');
      loadBookings();
    } catch (err) { toast.error(err.message || 'Execute failed'); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(id, { ...expenseForm, amount_inr: Number(expenseForm.amount_inr) });
      toast.success('Expense logged!');
      setExpenseForm({ category: 'food', description: '', amount_inr: '', trip_day: 1 });
      setShowExpenseForm(false);
      loadExpenses();
    } catch { toast.error('Failed to add expense'); }
  };

  const handleSaveNotes = async () => {
    if (savingNotes) return;
    setSavingNotes(true);
    try {
      await updateTripNotes(id, { notes });
      toast.success('Notes saved');
    } catch { toast.error('Could not save notes'); }
    finally { setSavingNotes(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
      <div className="global-spinner" />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Trip Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>This trip doesn't exist or you don't have access.</p>
      <Link to="/trips" style={{ color: '#1e293b', fontWeight: 600, textDecoration: 'none', background: '#f1f5f9', padding: '0.75rem 1.5rem', borderRadius: '50px' }}>
        My Trips
      </Link>
    </div>
  );

  const itinerary = (() => {
    try {
      return trip.itinerary_json
        ? (typeof trip.itinerary_json === 'string' ? JSON.parse(trip.itinerary_json) : trip.itinerary_json)
        : trip;
    } catch { return trip; }
  })();

  const days = itinerary?.itinerary || [];
  const totalCost = itinerary?.total_cost || trip.total_cost || trip.budget || 0;
  const tripTitle = itinerary?.trip_title || trip.trip_title || 'My Trip';
  const qualityScore = trip.quality_score;
  const insights = itinerary?.smart_insights || [];
  const packingTips = itinerary?.packing_tips || [];

  const TABS = [
    { key: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
    { key: 'bookings', label: 'Bookings', icon: <Package size={16} /> },
    { key: 'expenses', label: 'Expenses', icon: <DollarSign size={16} /> },
    { key: 'readiness', label: 'Readiness', icon: <TrendingUp size={16} /> },
    { key: 'notes', label: 'Notes', icon: <FileText size={16} /> },
    { key: 'summary', label: 'Summary', icon: <Star size={16} /> },
  ];

  const toggleDay = (n) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/trips" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
            <ArrowLeft size={18} /> My Trips
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleShare}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '50px', background: 'white', cursor: 'pointer', color: '#475569', fontWeight: 500, fontFamily: 'inherit', fontSize: '0.9rem' }}
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Trip Hero Card */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                {tripTitle}
              </h1>
              <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                {trip.duration && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> {trip.duration} Days
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} /> ₹{Number(totalCost).toLocaleString('en-IN')}
                </span>
                {trip.travelers && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> {trip.travelers} travelers
                  </span>
                )}
              </div>
            </div>
            {qualityScore && (
              <div
                title="Quality score (0–100) measures itinerary diversity, budget fit, activity spread, and pacing balance."
                style={{ background: qualityScore >= 80 ? '#f0fdf4' : '#fffbeb', border: `1px solid ${qualityScore >= 80 ? '#bbf7d0' : '#fde68a'}`, borderRadius: '12px', padding: '0.75rem 1.25rem', textAlign: 'center', cursor: 'help' }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: qualityScore >= 80 ? '#065f46' : '#92400e' }}>{qualityScore}</div>
                <div style={{ fontSize: '0.75rem', color: qualityScore >= 80 ? '#047857' : '#b45309', fontWeight: 600 }}>Quality Score ⓘ</div>
              </div>
            )}
          </div>

          {/* Smart Insights */}
          {insights.length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Smart Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {insights.map((insight, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>•</span>
                    {typeof insight === 'string' ? insight : insight.text || insight.insight || JSON.stringify(insight)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '1rem 1.25rem',
                  border: 'none', background: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
                  fontWeight: 600, color: activeTab === t.key ? '#1e293b' : '#94a3b8',
                  borderBottom: activeTab === t.key ? '2px solid #1e293b' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ITINERARY TAB */}
        {activeTab === 'itinerary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Pending bookings nudge banner */}
            {bookings.some(b => b.status === 'pending') && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📋</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
                      {bookings.filter(b => b.status === 'pending').length} booking{bookings.filter(b => b.status === 'pending').length > 1 ? 's' : ''} awaiting your approval
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#b45309' }}>Review and approve before executing</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  style={{ padding: '0.5rem 1.1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  Review Bookings →
                </button>
              </div>
            )}

            {days.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                No itinerary data available.
              </div>
            ) : (
              days.map((day) => {
                const dayNum = day.day || day.day_number;
                const isExpanded = expandedDays.has(dayNum);
                const activities = day.activities || [];
                const pacing = day.pacing_level || 'moderate';
                const theme = day.theme || day.location;

                return (
                  <div key={dayNum} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div
                      onClick={() => toggleDay(dayNum)}
                      style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', flexShrink: 0 }}>
                          {dayNum}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                            Day {dayNum}{theme ? ` — ${theme}` : ''}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
                            {day.date && <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{day.date}</span>}
                            {theme && theme !== day.location && (
                              <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{theme}</span>
                            )}
                            <span style={{ fontSize: '0.78rem', background: PACING_COLORS[pacing] + '20', color: PACING_COLORS[pacing], padding: '2px 8px', borderRadius: '999px', fontWeight: 600, textTransform: 'capitalize' }}>{pacing}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {day.day_total && (
                          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                            ₹{Number(day.day_total).toLocaleString('en-IN')}
                          </span>
                        )}
                        <Link
                          to={`/trip/${id}/briefing/${dayNum}`}
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7', background: '#f0f9ff', padding: '4px 10px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          Day Brief
                        </Link>
                        {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #f1f5f9' }}>
                        {activities.map((act, ai) => {
                          const isMeal = act.type?.toLowerCase().includes('restaurant') || act.name?.toLowerCase().includes('lunch') || act.name?.toLowerCase().includes('breakfast') || act.name?.toLowerCase().includes('dinner');
                          return (
                            <div key={ai} style={{
                              padding: '1rem 1.5rem',
                              borderBottom: ai < activities.length - 1 ? '1px solid #f8fafc' : 'none',
                              display: 'flex',
                              gap: '1rem',
                              alignItems: 'flex-start',
                              background: isMeal ? '#fffbeb' : 'white',
                              transition: 'background 0.15s',
                            }}
                              onMouseEnter={(e) => { if (!isMeal) e.currentTarget.style.background = '#f8fafc'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = isMeal ? '#fffbeb' : 'white'; }}
                            >
                              {/* Time chip */}
                              <div style={{ minWidth: '70px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', paddingTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                                {act.time || act.start_time || ''}
                              </div>

                              {/* Icon */}
                              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: isMeal ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMeal ? '#d97706' : '#64748b', flexShrink: 0 }}>
                                {isMeal ? <Coffee size={16} /> : <ActivityIcon type={act.type} />}
                              </div>

                              {/* Content */}
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{act.name}</div>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                                    {act.cost > 0 && (
                                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                        ₹{Number(act.cost).toLocaleString('en-IN')}
                                      </span>
                                    )}
                                    {act.is_photo_spot && (
                                      <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>📸</span>
                                    )}
                                    {act.difficulty_level && act.difficulty_level !== 'easy' && (
                                      <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '6px', fontWeight: 600, textTransform: 'capitalize' }}>{act.difficulty_level}</span>
                                    )}
                                  </div>
                                </div>

                                {act.description && (
                                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>{act.description}</p>
                                )}

                                {act.why_this_fits && (
                                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                                    {act.why_this_fits}
                                  </p>
                                )}

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '6px', flexWrap: 'wrap' }}>
                                  {act.avg_visit_duration_hours && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Clock size={11} /> {act.avg_visit_duration_hours}h
                                    </span>
                                  )}
                                  {act.dress_code && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>👔 {act.dress_code}</span>
                                  )}
                                  {act.queue_wait_minutes > 0 && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>⏱ {act.queue_wait_minutes}min queue</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Accommodation */}
                        {day.accommodation && (
                          <div style={{ padding: '1rem 1.5rem', background: '#f0f9ff', borderTop: '1px solid #e0f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, marginBottom: '2px' }}>STAY</div>
                              <div style={{ fontWeight: 700, color: '#0c4a6e' }}>{day.accommodation.hotel_name || day.accommodation}</div>
                              {day.accommodation.price_per_night && (
                                <div style={{ fontSize: '0.8rem', color: '#0369a1' }}>₹{Number(day.accommodation.price_per_night).toLocaleString('en-IN')}/night</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Packing Tips */}
            {packingTips.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} /> Packing Tips
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {packingTips.map((tip, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                      <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>
                      {typeof tip === 'string' ? tip : tip.tip || JSON.stringify(tip)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
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
              <button
                onClick={handleExecuteAll}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <Check size={16} /> Confirm & Book All Approved
              </button>
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
                            <span style={{
                              fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                              background: (BOOKING_STATUS_COLORS[b.status] || '#94a3b8') + '20',
                              color: BOOKING_STATUS_COLORS[b.status] || '#94a3b8',
                              textTransform: 'capitalize',
                            }}>
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
                              <button onClick={() => handleApproveBooking(b.id)} style={{ padding: '0.5rem 1rem', background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Approve</button>
                              <button onClick={() => rejectBooking(b.id).then(loadBookings)} style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Reject</button>
                            </>
                          )}
                          {(b.status === 'approved' || b.status === 'executed') && (
                            <button onClick={() => cancelBooking(b.id).then(loadBookings)} style={{ padding: '0.5rem 1rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.2rem' }}>Expense Tracker</h2>
              <button
                onClick={() => setShowExpenseForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <Plus size={16} /> Log Expense
              </button>
            </div>

            {showExpenseForm && (
              <form onSubmit={handleAddExpense} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Add Expense</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Category</label>
                    <select value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}>
                      {['food', 'transport', 'accommodation', 'activities', 'shopping', 'misc'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Amount (₹)</label>
                    <input type="number" min={1} required value={expenseForm.amount_inr} onChange={e => setExpenseForm(p => ({ ...p, amount_inr: e.target.value }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} placeholder="0" />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Description</label>
                  <input type="text" required value={expenseForm.description} onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }} placeholder="e.g. Lunch at cafe" />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setShowExpenseForm(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* Chart */}
            {expenses.length > 0 && (() => {
              const byCategory = {};
              expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount_inr || 0); });
              const chartData = Object.entries(byCategory).map(([k, v]) => ({ category: k, actual: v }));
              return (
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', fontSize: '1rem' }}>Spending by Category</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Actual']} contentStyle={{ borderRadius: '8px' }} />
                      <Bar dataKey="actual" fill="#1e293b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Total Spent</span>
                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>
                      ₹{expenses.reduce((s, e) => s + (e.amount_inr || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })()}

            {expenses.length > 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {expenses.map((exp, i) => (
                  <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < expenses.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{exp.description}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', textTransform: 'capitalize' }}>{exp.category} • Day {exp.trip_day}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{Number(exp.amount_inr).toLocaleString('en-IN')}</span>
                      <button onClick={() => deleteExpense(exp.id).then(loadExpenses)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <DollarSign size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No expenses logged yet. Track your spending as you travel!</p>
              </div>
            )}
          </div>
        )}

        {/* READINESS TAB */}
        {activeTab === 'readiness' && (
          <div>
            {readiness ? (
              <>
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', fontWeight: 800, color: readiness.score >= 80 ? '#10b981' : readiness.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {readiness.score}%
                  </div>
                  <div style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem' }}>Trip Readiness</div>
                  <div style={{ background: '#f1f5f9', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', background: readiness.score >= 80 ? '#10b981' : readiness.score >= 50 ? '#f59e0b' : '#ef4444', width: `${readiness.score}%`, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                {readiness.checklist && (
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Readiness Checklist</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {readiness.checklist.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <div style={{ flexShrink: 0, marginTop: '2px' }}>
                            {item.status === 'done' ? <Check size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{item.label}</div>
                            {item.note && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{item.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div className="global-spinner" style={{ margin: '0 auto 1rem' }} />
                <p>Loading readiness check...</p>
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Trip Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Add notes, reminders, and important details about your trip..."
                style={{ width: '100%', minHeight: '200px', padding: '1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', resize: 'vertical', lineHeight: 1.6, color: '#1e293b' }}
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{ marginTop: '0.75rem', padding: '0.7rem 1.5rem', background: savingNotes ? '#94a3b8' : '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: savingNotes ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Post-trip summary */}
            {tripSummary ? (
              <>
                {/* Spend overview */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', fontSize: '1rem' }}>Trip Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Days', value: tripSummary.num_days },
                      { label: 'Activities', value: tripSummary.total_activities },
                      { label: 'Planned Budget', value: tripSummary.planned_budget ? `₹${Number(tripSummary.planned_budget).toLocaleString('en-IN')}` : '—' },
                      { label: 'Actual Spend', value: tripSummary.actual_spend ? `₹${Number(tripSummary.actual_spend).toLocaleString('en-IN')}` : '—' },
                    ].map((m, i) => (
                      <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{m.label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{m.value ?? '—'}</div>
                      </div>
                    ))}
                  </div>

                  {tripSummary.highlights?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Highlights</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {tripSummary.highlights.map((h, i) => (
                          <span key={i} style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                            {typeof h === 'string' ? h : h.name || JSON.stringify(h)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tripSummary.top_activity_types?.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.5rem' }}>What you loved doing</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {tripSummary.top_activity_types.map((t, i) => (
                          <span key={i} style={{ background: '#f0f9ff', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Smart insights from summary */}
                {tripSummary.smart_insights?.length > 0 && (
                  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', fontSize: '1rem' }}>Insights</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {tripSummary.smart_insights.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                          <span style={{ color: '#4ade80', flexShrink: 0 }}>•</span>
                          {typeof s === 'string' ? s : s.text || JSON.stringify(s)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <TrendingUp size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                <p style={{ fontSize: '0.9rem' }}>Summary will be available after your trip ends.</p>
              </div>
            )}

            {/* Review form */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>
                {existingReview ? 'Your Review' : 'Rate This Trip'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                {existingReview ? 'Update your review below.' : 'Share your experience to help improve future recommendations.'}
              </p>

              <form onSubmit={handleSubmitReview}>
                {/* Star rating */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '1.8rem', lineHeight: 1, color: n <= reviewForm.rating ? '#f59e0b' : '#e2e8f0', transition: 'color 0.15s' }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {reviewForm.rating > 0 && (
                    <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>{RATING_LABELS[reviewForm.rating]}</div>
                  )}
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Tags (up to 5)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {REVIEW_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleReviewTag(tag)}
                        style={{
                          padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          background: reviewForm.tags.includes(tag) ? '#1e293b' : '#f1f5f9',
                          color: reviewForm.tags.includes(tag) ? 'white' : '#64748b',
                          border: 'none',
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    placeholder="Share what made this trip special (optional)..."
                    maxLength={2000}
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', resize: 'vertical', lineHeight: 1.6, color: '#1e293b', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.rating}
                  style={{ padding: '0.75rem 2rem', background: submittingReview || !reviewForm.rating ? '#94a3b8' : '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: submittingReview || !reviewForm.rating ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                >
                  {submittingReview ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripViewerPage;
