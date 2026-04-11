import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ChevronRight, ChevronLeft, MapPin, Search, X, Plus, Minus, Sparkles, Check, Calendar, Users, DollarSign, Heart } from 'lucide-react';
import { getCountries, getDestinations, search as searchDestinations, recommend, generateItinerary, estimateBudget } from '../../services/api.js';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/index.js';

const STYLES = ['adventure', 'cultural', 'relaxation', 'photography', 'food', 'spiritual', 'family'];
const TRAVELER_TYPES = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '👫' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'group', label: 'Group', emoji: '👥' },
  { value: 'senior', label: 'Senior', emoji: '🧓' },
];
const DIETARY = ['none', 'vegetarian', 'vegan', 'jain', 'halal', 'gluten-free'];
const FITNESS = ['low', 'moderate', 'high'];
const INTERESTS = [
  { value: 'food', label: 'Food & Dining', emoji: '🍜' },
  { value: 'adventure', label: 'Adventure', emoji: '🧗' },
  { value: 'culture', label: 'Culture & History', emoji: '🏛️' },
  { value: 'photography', label: 'Photography', emoji: '📸' },
  { value: 'wellness', label: 'Wellness & Spa', emoji: '🧘' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'nature', label: 'Nature & Wildlife', emoji: '🌿' },
];

const getBudgetLabel = (budget, days, travelers) => {
  if (!days || !travelers) return '';
  const daily = budget / (days * travelers);
  if (daily < 1500) return 'Budget';
  if (daily < 4000) return 'Standard';
  return 'Luxury';
};

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  // Step 1: Where
  const [searchQuery, setSearchQuery] = useState(searchParams.get('destination') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDests, setSelectedDests] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const recommendInFlight = useRef(false);

  // Step 2: When
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(5);

  // Step 3: Budget
  const [budget, setBudget] = useState(25000);
  const [selectedStyles, setSelectedStyles] = useState(['cultural']);
  const [travelers, setTravelers] = useState(2);

  // Step 4: About You
  const [travelerType, setTravelerType] = useState('couple');
  const [childrenCount, setChildrenCount] = useState(0);
  const [seniorCount, setSeniorCount] = useState(0);
  const [dietary, setDietary] = useState('none');
  const [fitnessLevel, setFitnessLevel] = useState('moderate');
  const [specialOccasion, setSpecialOccasion] = useState('');
  const [accessibility, setAccessibility] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Budget hint
  const [budgetHint, setBudgetHint] = useState(null);

  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getCountries().then(setCountries).catch(() => {});
    if (searchParams.get('destination')) {
      setSelectedDests([{ name: searchParams.get('destination'), id: 'custom' }]);
    }
    // Mark mounted after first paint so autoFocus doesn't immediately trigger recommend
    const t = setTimeout(() => setHasMounted(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchDestinations(searchQuery, 'destination', 8);
        const items = Array.isArray(data) ? data : (data.results || data.destinations || []);
        setSearchResults(items.slice(0, 6));
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleRecommend = async () => {
    if (recommendInFlight.current) return;
    recommendInFlight.current = true;
    setRecommendLoading(true);
    try {
      const data = await recommend({ limit: 4, budget_category: budget < 10000 ? 'budget' : budget < 40000 ? 'mid' : 'luxury' });
      const items = Array.isArray(data) ? data : (data.destinations || []);
      setSearchResults(items.slice(0, 6));
      toast.success('Showing AI recommendations!');
    } catch {
      toast.error('Could not get recommendations');
    } finally {
      recommendInFlight.current = false;
      setRecommendLoading(false);
    }
  };

  const addDest = (dest) => {
    if (selectedDests.find(d => d.id === dest.id || d.name === dest.name)) return;
    setSelectedDests(prev => [...prev, dest]);
    // Auto-set country from first destination added
    if (dest.country_name) setSelectedCountry(dest.country_name);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeDest = (id) => setSelectedDests(prev => prev.filter(d => d.id !== id && d.name !== id));

  const toggleStyle = (s) => {
    setSelectedStyles(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  // Debounced live budget hint
  useEffect(() => {
    if (step !== 3 || !budget || !duration || !travelers) return;
    const daily = Math.round(budget / (duration * travelers));
    const tier = daily < 1500 ? 'budget' : daily < 4000 ? 'mid' : 'luxury';
    const tierLabel = tier === 'budget' ? 'Budget' : tier === 'mid' ? 'Standard' : 'Luxury';
    setBudgetHint({ daily, tier, tierLabel });
  }, [budget, duration, travelers, step]);

  const toggleInterest = (val) => {
    setSelectedInterests(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const travelMonth = startDate ? new Date(startDate).toLocaleString('en', { month: 'long' }) : 'January';

  const handleGenerate = async () => {
    if (selectedDests.length === 0) { toast.dismiss(); toast.error('Please select at least one destination'); setStep(1); return; }
    if (!selectedCountry) { toast.error('Please select a country'); return; }

    setGenerating(true);
    try {
      const payload = {
        destination_country: selectedCountry,
        start_city: selectedCountry,
        selected_destinations: selectedDests.map(d => ({ name: d.name })),
        budget: Number(budget),
        duration: Number(duration),
        travelers: Number(travelers),
        style: selectedStyles[0] || 'cultural',
        traveler_type: travelerType,
        travel_month: travelMonth,
        use_engine: true,
        dietary_restrictions: dietary !== 'none' ? [dietary] : [],
        accessibility: accessibility ? 1 : 0,
        children_count: childrenCount,
        senior_count: seniorCount,
        special_occasion: specialOccasion || null,
        fitness_level: fitnessLevel,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      };
      if (startDate) payload.start_date = startDate;

      const res = await generateItinerary(payload);
      if (res.job_id) {
        navigate(`/planner/generating/${res.job_id}`, {
          state: { budget, duration, selectedDests, travelers, token }
        });
      } else {
        toast.error('Failed to start generation');
      }
    } catch (err) {
      toast.error(err.message || 'Generation failed');
      setGenerating(false);
    }
  };

  const STEPS = [
    { num: 1, label: 'Where' },
    { num: 2, label: 'When' },
    { num: 3, label: 'Budget' },
    { num: 4, label: 'About You' },
    { num: 5, label: 'Review' },
  ];

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0', marginBottom: '3rem' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: s.num < step ? 'pointer' : 'default' }}
                onClick={() => s.num < step && setStep(s.num)}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: step >= s.num ? 'var(--color-primary)' : 'var(--color-border)',
                  color: step >= s.num ? 'white' : 'var(--color-text-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s',
                }}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: step >= s.num ? 'var(--color-primary)' : 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: step > s.num ? 'var(--color-primary)' : 'var(--color-border)', margin: '0 8px', marginBottom: '22px', transition: 'background 0.3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>

          {/* STEP 1: Where */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Where do you want to go?</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Type a destination or let AI suggest the perfect place for you</p>

              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search — Goa, Manali, Rajasthan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && searchResults.length > 0) addDest(searchResults[0]); }}
                  style={{ width: '100%', padding: '0.95rem 1rem 0.95rem 2.75rem', border: '1.5px solid var(--color-border)', borderRadius: '14px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                  onFocus={() => { if (hasMounted && searchQuery.length < 2 && searchResults.length === 0) handleRecommend(); }}
                  autoFocus
                />
              </div>

              {searchResults.length > 0 && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                  {searchResults.map(dest => (
                    <div
                      key={dest.id}
                      onClick={() => addDest(dest)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={16} color="#64748b" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>{dest.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>{dest.state_name || dest.country_name || ''}</div>
                      </div>
                      <Plus size={16} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                loading={recommendLoading}
                onClick={handleRecommend}
                style={{ marginBottom: '1.5rem', border: '1px solid var(--color-primary-subtle)', background: 'var(--color-primary-subtle)' }}
              >
                <Sparkles size={16} /> {recommendLoading ? 'Loading...' : 'Recommend me destinations!'}
              </Button>

              {selectedDests.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Selected destinations:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedDests.map(d => (
                      <div key={d.id || d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary)', color: 'white', padding: '0.4rem 0.75rem 0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 500 }}>
                        <MapPin size={12} /> {d.name}
                        <button onClick={() => removeDest(d.id || d.name)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: When */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>When are you going?</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Pick your travel dates and how long you'll be away</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Start Date (optional)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Duration <span style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>{duration} days</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={21}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '0.5rem' }}>
                  <span>1 day</span><span>21 days</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[3, 5, 7, 10].map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    style={{ padding: '0.75rem', border: `1.5px solid ${duration === d ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', background: duration === d ? 'var(--color-primary)' : 'var(--color-bg-elevated)', color: duration === d ? 'white' : 'var(--color-text-muted)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Budget */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Budget & Style</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Set your total budget and travel style preferences</p>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <span>Total Budget</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
                    ₹{Number(budget).toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: 'var(--color-primary)', background: 'var(--color-success-subtle)', padding: '2px 8px', borderRadius: '999px' }}>
                      {getBudgetLabel(budget, duration, travelers)}
                    </span>
                  </span>
                </label>
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-text-muted)' }}>₹</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Math.max(500, Number(e.target.value)))}
                    min={500}
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2rem', border: '1.5px solid var(--color-border)', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
                <input
                  type="range"
                  min={500}
                  max={500000}
                  step={1000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />

                {/* Live budget hint */}
                {budgetHint && (
                  <div style={{
                    marginTop: '1rem', padding: '1rem 1.25rem', borderRadius: '12px',
                    background: budgetHint.tier === 'budget' ? 'var(--color-info-subtle)' : budgetHint.tier === 'mid' ? 'var(--color-success-subtle)' : '#E8F8F2',
                    border: `1px solid ${budgetHint.tier === 'budget' ? 'var(--color-info)' : budgetHint.tier === 'mid' ? 'var(--color-success)' : '#9FDFC3'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                        ₹{budgetHint.daily.toLocaleString('en-IN')}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}> per person, per day</span>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: '0.85rem', padding: '4px 12px', borderRadius: '999px',
                      background: budgetHint.tier === 'budget' ? '#dbeafe' : budgetHint.tier === 'mid' ? '#dcfce7' : '#fef9c3',
                      color: budgetHint.tier === 'budget' ? '#1d4ed8' : budgetHint.tier === 'mid' ? '#15803d' : '#a16207',
                    }}>
                      {budgetHint.tierLabel} travel
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Trip Style (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      style={{ padding: '0.5rem 1.1rem', border: `1.5px solid ${selectedStyles.includes(s) ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-full)', background: selectedStyles.includes(s) ? 'var(--color-primary)' : 'var(--color-bg-elevated)', color: selectedStyles.includes(s) ? 'white' : 'var(--color-text-muted)', fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', textTransform: 'capitalize' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Number of Travelers</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => setTravelers(t => Math.max(1, t - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', minWidth: '40px', textAlign: 'center' }}>{travelers}</span>
                  <button onClick={() => setTravelers(t => Math.min(20, t + 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                    <Plus size={16} />
                  </button>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    {travelers === 1 ? 'person' : 'people'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: About You */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Who's going?</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Just the essentials — we'll handle the rest</p>

              {/* Traveler type */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>I'm traveling as...</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {TRAVELER_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTravelerType(t.value)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0.75rem 1.25rem', border: `2px solid ${travelerType === t.value ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '14px', background: travelerType === t.value ? 'var(--color-primary)' : 'var(--color-bg-elevated)', color: travelerType === t.value ? 'white' : '#475569', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s', minWidth: '80px' }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Children/senior counts — only show if relevant */}
              {travelerType === 'family' && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-success-subtle)', borderRadius: '12px', border: '1px solid var(--color-success)' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>How many children?</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setChildrenCount(c => Math.max(0, c - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--color-success)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{childrenCount}</span>
                    <button onClick={() => setChildrenCount(c => c + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--color-success)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>We'll pick family-friendly spots</span>
                  </div>
                </div>
              )}

              {travelerType === 'senior' && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-info-subtle)', borderRadius: '12px', border: '1px solid var(--color-info)' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>How many seniors?</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setSeniorCount(s => Math.max(0, s - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--color-info)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{seniorCount}</span>
                    <button onClick={() => setSeniorCount(s => s + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--color-info)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-info)' }}>Gentle pacing, accessible venues</span>
                  </div>
                </div>
              )}

              {/* Interests */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>What excites you most? <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {INTERESTS.map(i => (
                    <button
                      key={i.value}
                      onClick={() => toggleInterest(i.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0.5rem 1rem',
                        border: `1.5px solid ${selectedInterests.includes(i.value) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: '999px',
                        background: selectedInterests.includes(i.value) ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                        color: selectedInterests.includes(i.value) ? 'white' : '#475569',
                        fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', fontSize: '0.88rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{i.emoji}</span> {i.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced options — collapsed by default */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem', padding: '0', marginBottom: showAdvanced ? '1.25rem' : '0' }}
                >
                  <ChevronRight size={16} style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  Advanced options (dietary, fitness, accessibility, special occasion)
                </button>

                {showAdvanced && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.25rem', background: 'var(--color-bg)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                    {/* Dietary */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.6rem', fontSize: '0.88rem' }}>Dietary preference</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {DIETARY.map(d => (
                          <button key={d} onClick={() => setDietary(d)} style={{ padding: '0.35rem 0.9rem', border: `1.5px solid ${dietary === d ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-full)', background: dietary === d ? 'var(--color-primary)' : 'var(--color-bg-elevated)', color: dietary === d ? 'white' : 'var(--color-text-muted)', fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.83rem' }}>
                            {d === 'none' ? 'No restriction' : d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fitness */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.6rem', fontSize: '0.88rem' }}>Activity intensity</label>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {[{ v: 'low', l: 'Easy going' }, { v: 'moderate', l: 'Moderate' }, { v: 'high', l: 'Very active' }].map(f => (
                          <button key={f.v} onClick={() => setFitnessLevel(f.v)} style={{ flex: 1, padding: '0.65rem', border: `1.5px solid ${fitnessLevel === f.v ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', background: fitnessLevel === f.v ? 'var(--color-primary)' : 'var(--color-bg-elevated)', color: fitnessLevel === f.v ? 'white' : 'var(--color-text-muted)', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                            {f.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accessibility */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.88rem' }}>Wheelchair / mobility access needed</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', marginTop: '2px' }}>We'll filter out venues with poor accessibility</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAccessibility(v => !v)}
                        style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: accessibility ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                      >
                        <span style={{ position: 'absolute', top: '4px', left: accessibility ? '26px' : '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                      </button>
                    </div>

                    {/* Special occasion */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem', fontSize: '0.88rem' }}>Special occasion? <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>(optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. honeymoon, birthday, anniversary..."
                        value={specialOccasion}
                        onChange={(e) => setSpecialOccasion(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Review & Generate</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Confirm your trip details before generating</p>

              <div style={{ background: 'var(--color-bg)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: <MapPin size={18} />, label: 'Destinations', value: selectedDests.map(d => d.name).join(', ') || 'None selected' },
                  { icon: <Calendar size={18} />, label: 'Duration', value: `${duration} days${startDate ? ` from ${new Date(startDate).toLocaleDateString('en-IN')}` : ''}` },
                  { icon: <DollarSign size={18} />, label: 'Budget', value: `₹${Number(budget).toLocaleString('en-IN')} total (${getBudgetLabel(budget, duration, travelers)})` },
                  { icon: <Users size={18} />, label: 'Travelers', value: `${travelers} ${travelers === 1 ? 'person' : 'people'} • ${travelerType}` },
                  { icon: <Heart size={18} />, label: 'Style', value: selectedStyles.join(', ') || 'Cultural' },
                  ...(selectedInterests.length > 0 ? [{ icon: <Sparkles size={18} />, label: 'Interests', value: selectedInterests.map(v => INTERESTS.find(i => i.value === v)?.label || v).join(', ') }] : []),
                  { icon: <Sparkles size={18} />, label: 'Dietary', value: dietary === 'none' ? 'No restrictions' : dietary },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: 500, marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={generating}
                disabled={generating || selectedDests.length === 0}
                onClick={handleGenerate}
                style={{ width: '100%', boxShadow: '0 8px 24px rgba(79,70,229,0.3)', fontWeight: 700, fontSize: '1.05rem' }}
              >
                <Sparkles size={20} />
                {generating ? 'Starting generation...' : 'Generate My AI Trip Plan'}
              </Button>

              {selectedDests.length === 0 && (
                <p style={{ color: 'var(--color-error)', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.9rem' }}>Please go back and select at least one destination</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft size={18} /> Back
            </Button>

            {step < 5 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (step === 1 && selectedDests.length === 0) {
                    toast.dismiss();
                    toast.error('Please select at least one destination');
                    return;
                  }
                  setStep(s => s + 1);
                }}
              >
                Continue <ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;
