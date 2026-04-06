import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, DollarSign, Clock, Share2, ArrowLeft, Star,
  AlertCircle, Package, TrendingUp, FileText, X, Layers,
} from 'lucide-react';
import {
  getTrip, shareTrip, getTripBookings, approveBooking, rejectBooking, cancelBooking,
  executeAllBookings, getExpenses, addExpense, deleteExpense, getTripReadiness,
  updateTripNotes, getTripSummary, getTripReview, submitTripReview,
  getHotelOptions, swapHotel, addActivity, removeActivity, editActivity, getTripVariants,
} from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

import ItineraryTab from './tabs/ItineraryTab.jsx';
import BookingsTab from './tabs/BookingsTab.jsx';
import ExpensesTab from './tabs/ExpensesTab.jsx';
import ReadinessTab from './tabs/ReadinessTab.jsx';
import NotesTab from './tabs/NotesTab.jsx';
import SummaryTab from './tabs/SummaryTab.jsx';

const TripViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core trip data
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('itinerary');

  // Itinerary tab state
  const [expandedDays, setExpandedDays] = useState(new Set([1]));

  // Bookings state
  const [bookings, setBookings] = useState([]);

  // Expenses state
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ category: 'food', description: '', amount_inr: '', trip_day: 1 });
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Readiness state
  const [readiness, setReadiness] = useState(null);

  // Notes state
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Summary / review state
  const [tripSummary, setTripSummary] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', tags: [] });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Variants state
  const [variantsModal, setVariantsModal] = useState({ open: false, loading: false, variants: [] });

  // Modal state
  const [hotelModal, setHotelModal] = useState({
    open: false, dayNum: null, options: [], loading: false, customMode: false,
    customForm: { custom_hotel_name: '', cost_per_night: '', category: 'mid' },
  });
  const [addActModal, setAddActModal] = useState({
    open: false, dayNum: null, saving: false,
    form: { name: '', description: '', type: 'sightseeing', scheduled_time: '10:00', duration_minutes: 90, cost: 0 },
  });
  const [editActModal, setEditActModal] = useState({
    open: false, dayNum: null, actName: '', saving: false,
    form: { cost_override: '', user_note: '', scheduled_time: '', duration_minutes: '' },
  });

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTrip();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'expenses') loadExpenses();
    if (activeTab === 'readiness') loadReadiness();
    if (activeTab === 'summary') loadSummary();
  }, [activeTab]);

  // ─── Data loaders ────────────────────────────────────────────────────────────

  const fetchTrip = async () => {
    try {
      const data = await getTrip(id);
      setTrip(data);
      setNotes(data.user_notes?.trip || '');
      // Silently pre-load bookings so pending-bookings banner shows on itinerary tab
      getTripBookings(id).then(d => {
        const flat = d.bookings || (Array.isArray(d) ? d : Object.values(d.by_type || {}).flat());
        setBookings(flat);
      }).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await getTripBookings(id);
      const flat = data.bookings || (Array.isArray(data) ? data : Object.values(data.by_type || {}).flat());
      setBookings(flat);
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
      if (data && data.readiness_score !== undefined && data.score === undefined) {
        data.score = data.readiness_score;
      }
      setReadiness(data);
    } catch { toast.error('Could not load readiness'); }
  };

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

  // ─── Handlers ────────────────────────────────────────────────────────────────

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

  const handleApproveBooking = async (bookingId) => {
    try {
      await approveBooking(bookingId);
      toast.success('Booking approved');
      loadBookings();
    } catch { toast.error('Failed to approve'); }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      loadBookings();
    } catch { toast.error('Failed to reject'); }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      loadBookings();
    } catch { toast.error('Failed to cancel'); }
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

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      loadExpenses();
    } catch { toast.error('Failed to delete expense'); }
  };

  const handleSaveNotes = async () => {
    if (savingNotes) return;
    setSavingNotes(true);
    try {
      await updateTripNotes(id, { trip: notes });
      toast.success('Notes saved');
    } catch { toast.error('Could not save notes'); }
    finally { setSavingNotes(false); }
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

  const toggleDay = (n) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const openHotelModal = async (dayNum) => {
    setHotelModal(p => ({ ...p, open: true, dayNum, options: [], loading: true, customMode: false }));
    try {
      const data = await getHotelOptions(id);
      setHotelModal(p => ({ ...p, options: data.options || data || [], loading: false }));
    } catch {
      toast.error('Could not load hotel options');
      setHotelModal(p => ({ ...p, loading: false }));
    }
  };

  const handleSwapHotel = async (hotelId) => {
    try {
      await swapHotel(id, { hotel_id: hotelId });
      toast.success('Hotel updated!');
      setHotelModal(p => ({ ...p, open: false }));
      fetchTrip();
    } catch (err) { toast.error(err.message || 'Could not change hotel'); }
  };

  const handleSwapHotelCustom = async () => {
    const { custom_hotel_name, cost_per_night, category } = hotelModal.customForm;
    if (!custom_hotel_name.trim() || !cost_per_night) { toast.error('Name and cost required'); return; }
    try {
      await swapHotel(id, { custom_hotel_name: custom_hotel_name.trim(), cost_per_night: Number(cost_per_night), category });
      toast.success('Custom hotel saved!');
      setHotelModal(p => ({ ...p, open: false }));
      fetchTrip();
    } catch (err) { toast.error(err.message || 'Could not change hotel'); }
  };

  const openAddActModal = (dayNum) => {
    setAddActModal(p => ({
      ...p, open: true, dayNum,
      form: { name: '', description: '', type: 'sightseeing', scheduled_time: '10:00', duration_minutes: 90, cost: 0 },
    }));
  };

  const handleAddActivity = async () => {
    const { dayNum, form } = addActModal;
    if (!form.name.trim()) { toast.error('Activity name required'); return; }
    setAddActModal(p => ({ ...p, saving: true }));
    try {
      await addActivity(id, dayNum, { ...form, duration_minutes: Number(form.duration_minutes), cost: Number(form.cost) });
      toast.success('Activity added!');
      setAddActModal(p => ({ ...p, open: false, saving: false }));
      fetchTrip();
    } catch (err) {
      toast.error(err.message || 'Could not add activity');
      setAddActModal(p => ({ ...p, saving: false }));
    }
  };

  const openEditActModal = (dayNum, act) => {
    setEditActModal({
      open: true, dayNum, actName: act.name, saving: false,
      form: {
        cost_override: act.cost > 0 ? String(act.cost) : '',
        user_note: act.user_note || '',
        scheduled_time: act.time || act.start_time || '',
        duration_minutes: act.avg_visit_duration_hours ? String(Math.round(act.avg_visit_duration_hours * 60)) : '',
      },
    });
  };

  const handleEditActivity = async () => {
    const { dayNum, actName, form } = editActModal;
    const body = { activity_name: actName };
    if (form.cost_override !== '') body.cost_override = Number(form.cost_override);
    if (form.user_note.trim()) body.user_note = form.user_note.trim();
    if (form.scheduled_time.trim()) body.scheduled_time = form.scheduled_time.trim();
    if (form.duration_minutes !== '') body.duration_minutes = Number(form.duration_minutes);
    setEditActModal(p => ({ ...p, saving: true }));
    try {
      await editActivity(id, dayNum, body);
      toast.success('Activity updated!');
      setEditActModal(p => ({ ...p, open: false, saving: false }));
      fetchTrip();
    } catch (err) {
      toast.error(err.message || 'Could not update activity');
      setEditActModal(p => ({ ...p, saving: false }));
    }
  };

  const handleRemoveActivity = async (dayNum, activityName) => {
    if (!window.confirm(`Remove "${activityName}" from Day ${dayNum}?`)) return;
    try {
      await removeActivity(id, dayNum, { activity_name: activityName });
      toast.success('Activity removed');
      fetchTrip();
    } catch (err) { toast.error(err.message || 'Could not remove activity'); }
  };

  const handleGetVariants = async () => {
    setVariantsModal({ open: true, loading: true, variants: [] });
    try {
      const data = await getTripVariants(id);
      setVariantsModal({ open: true, loading: false, variants: data.variants || data || [] });
    } catch (err) {
      toast.error(err.message || 'Could not generate variants');
      setVariantsModal({ open: false, loading: false, variants: [] });
    }
  };

  // ─── Loading / error states ──────────────────────────────────────────────────

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

  // ─── Derived data ────────────────────────────────────────────────────────────

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
  const localEvents = itinerary?.local_events || [];
  const preTripInfo = itinerary?.pre_trip_info || null;
  const transportGuide = Array.isArray(itinerary?.daily_transport_guide) ? itinerary.daily_transport_guide : [];
  const weatherAlerts = itinerary?.weather_alerts || {};
  const docChecklist = itinerary?.document_checklist || [];

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const TABS = [
    { key: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
    { key: 'bookings', label: 'Bookings', icon: <Package size={16} /> },
    { key: 'expenses', label: 'Expenses', icon: <DollarSign size={16} /> },
    { key: 'readiness', label: 'Readiness', icon: <TrendingUp size={16} /> },
    { key: 'notes', label: 'Notes', icon: <FileText size={16} /> },
    { key: 'summary', label: 'Summary', icon: <Star size={16} /> },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/trips" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
            <ArrowLeft size={18} /> My Trips
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleGetVariants}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '50px', background: 'white', cursor: 'pointer', color: '#475569', fontWeight: 500, fontFamily: 'inherit', fontSize: '0.9rem' }}
            >
              <Layers size={16} /> Variants
            </button>
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

        {/* Tab navigation */}
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

        {/* Tab panels */}
        {activeTab === 'itinerary' && (
          <ItineraryTab
            tripId={id}
            days={days}
            weatherAlerts={weatherAlerts}
            localEvents={localEvents}
            packingTips={packingTips}
            docChecklist={docChecklist}
            preTripInfo={preTripInfo}
            insights={insights}
            transportGuide={transportGuide}
            pendingBookings={pendingBookings}
            expandedDays={expandedDays}
            onToggleDay={toggleDay}
            onOpenBookingsTab={() => setActiveTab('bookings')}
            onOpenHotelModal={openHotelModal}
            onOpenAddActModal={openAddActModal}
            onOpenEditActModal={openEditActModal}
            onRemoveActivity={handleRemoveActivity}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            onApprove={handleApproveBooking}
            onReject={handleRejectBooking}
            onCancel={handleCancelBooking}
            onExecuteAll={handleExecuteAll}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            expenseForm={expenseForm}
            showExpenseForm={showExpenseForm}
            onChangeExpenseForm={(field, value) => setExpenseForm(p => ({ ...p, [field]: value }))}
            onSubmitExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onShowForm={() => setShowExpenseForm(true)}
            onHideForm={() => setShowExpenseForm(false)}
          />
        )}

        {activeTab === 'readiness' && (
          <ReadinessTab readiness={readiness} />
        )}

        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            savingNotes={savingNotes}
            onChangeNotes={setNotes}
            onSaveNotes={handleSaveNotes}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab
            tripSummary={tripSummary}
            existingReview={existingReview}
            reviewForm={reviewForm}
            submittingReview={submittingReview}
            onChangeRating={(n) => setReviewForm(p => ({ ...p, rating: n }))}
            onToggleTag={toggleReviewTag}
            onChangeComment={(val) => setReviewForm(p => ({ ...p, comment: val }))}
            onSubmitReview={handleSubmitReview}
          />
        )}
      </div>
    </div>

    {/* ── Trip Variants Modal ──────────────────────────────────────────── */}
    {variantsModal.open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setVariantsModal(p => ({ ...p, open: false }))}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>Trip Variants</h3>
            <button onClick={() => setVariantsModal(p => ({ ...p, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          {variantsModal.loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Generating variants with AI...</div>
          ) : variantsModal.variants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No variants generated.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {variantsModal.variants.map((v, i) => (
                <div key={i} style={{ padding: '1.25rem', border: '1.5px solid #e2e8f0', borderRadius: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                    {v.variant_title || v.title || `Variant ${i + 1}`}
                  </div>
                  {v.description && <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{v.description}</div>}
                  {v.estimated_cost && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                      Est. ₹{Number(v.estimated_cost).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* ── Hotel Swap Modal ──────────────────────────────────────────────── */}
    {hotelModal.open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setHotelModal(p => ({ ...p, open: false }))}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>Change Hotel</h3>
            <button onClick={() => setHotelModal(p => ({ ...p, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button onClick={() => setHotelModal(p => ({ ...p, customMode: false }))} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: !hotelModal.customMode ? '#1e293b' : '#f1f5f9', color: !hotelModal.customMode ? 'white' : '#475569' }}>Available Options</button>
            <button onClick={() => setHotelModal(p => ({ ...p, customMode: true }))} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: hotelModal.customMode ? '#1e293b' : '#f1f5f9', color: hotelModal.customMode ? 'white' : '#475569' }}>Custom Hotel</button>
          </div>
          {!hotelModal.customMode ? (
            hotelModal.loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading options...</div>
            ) : hotelModal.options.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No hotel options found for this destination.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {hotelModal.options.map((opt) => (
                  <div key={opt.hotel_id || opt.id} style={{ padding: '1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{opt.hotel_name || opt.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>{opt.category} · ₹{Number(opt.price_per_night || opt.cost_per_night).toLocaleString('en-IN')}/night</div>
                    </div>
                    <button onClick={() => handleSwapHotel(opt.hotel_id || opt.id)} style={{ padding: '0.45rem 1rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>Select</button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Hotel Name *</label>
                <input value={hotelModal.customForm.custom_hotel_name} onChange={e => setHotelModal(p => ({ ...p, customForm: { ...p.customForm, custom_hotel_name: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Taj Rambagh Palace" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Cost/Night (₹) *</label>
                  <input type="number" min={1} value={hotelModal.customForm.cost_per_night} onChange={e => setHotelModal(p => ({ ...p, customForm: { ...p.customForm, cost_per_night: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Category</label>
                  <select value={hotelModal.customForm.category} onChange={e => setHotelModal(p => ({ ...p, customForm: { ...p.customForm, category: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}>
                    {['budget', 'mid', 'luxury'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSwapHotelCustom} style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Save Custom Hotel</button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ── Add Activity Modal ────────────────────────────────────────────── */}
    {addActModal.open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setAddActModal(p => ({ ...p, open: false }))}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>Add Activity — Day {addActModal.dayNum}</h3>
            <button onClick={() => setAddActModal(p => ({ ...p, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Activity Name *</label>
              <input value={addActModal.form.name} onChange={e => setAddActModal(p => ({ ...p, form: { ...p.form, name: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Visit City Palace" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Description</label>
              <input value={addActModal.form.description} onChange={e => setAddActModal(p => ({ ...p, form: { ...p.form, description: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="Optional description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Type</label>
                <select value={addActModal.form.type} onChange={e => setAddActModal(p => ({ ...p, form: { ...p.form, type: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}>
                  {['sightseeing', 'heritage', 'nature', 'adventure', 'food', 'shopping', 'cultural', 'general'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Start Time</label>
                <input type="time" value={addActModal.form.scheduled_time} onChange={e => setAddActModal(p => ({ ...p, form: { ...p.form, scheduled_time: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Duration (min)</label>
                <input type="number" min={15} value={addActModal.form.duration_minutes} onChange={e => setAddActModal(p => ({ ...p, form: { ...p.form, duration_minutes: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Cost (₹)</label>
                <input type="number" min={0} value={addActModal.form.cost} onChange={e => setAddActModal(p => ({ ...p, form: { ...p.form, cost: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button onClick={handleAddActivity} disabled={addActModal.saving} style={{ flex: 1, padding: '0.75rem', background: addActModal.saving ? '#94a3b8' : '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: addActModal.saving ? 'not-allowed' : 'pointer' }}>{addActModal.saving ? 'Adding...' : 'Add Activity'}</button>
              <button onClick={() => setAddActModal(p => ({ ...p, open: false }))} style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Edit Activity Modal ───────────────────────────────────────────── */}
    {editActModal.open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setEditActModal(p => ({ ...p, open: false }))}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', marginBottom: '2px' }}>Edit Activity</h3>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{editActModal.actName}</div>
            </div>
            <button onClick={() => setEditActModal(p => ({ ...p, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Start Time</label>
                <input type="time" value={editActModal.form.scheduled_time} onChange={e => setEditActModal(p => ({ ...p, form: { ...p.form, scheduled_time: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Duration (min)</label>
                <input type="number" min={15} value={editActModal.form.duration_minutes} onChange={e => setEditActModal(p => ({ ...p, form: { ...p.form, duration_minutes: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. 90" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Cost Override (₹)</label>
              <input type="number" min={0} value={editActModal.form.cost_override} onChange={e => setEditActModal(p => ({ ...p, form: { ...p.form, cost_override: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="Leave blank to keep original" />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>Personal Note</label>
              <input value={editActModal.form.user_note} onChange={e => setEditActModal(p => ({ ...p, form: { ...p.form, user_note: e.target.value } }))} style={{ width: '100%', padding: '0.7rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Book tickets in advance" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button onClick={handleEditActivity} disabled={editActModal.saving} style={{ flex: 1, padding: '0.75rem', background: editActModal.saving ? '#94a3b8' : '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: editActModal.saving ? 'not-allowed' : 'pointer' }}>{editActModal.saving ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => setEditActModal(p => ({ ...p, open: false }))} style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default TripViewerPage;
