import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, ArrowLeft, Clock, Users, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDestination, getBestTime, estimateBudget } from '../../services/api.js';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bestTime, setBestTime] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ duration: 3, travelers: 2, budget_category: 'mid' });
  const [budgetEstimate, setBudgetEstimate] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getDestination(id)
      .then(setDest)
      .catch(() => toast.error('Destination not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadBestTime = async () => {
    if (bestTime) return;
    try {
      const data = await getBestTime(id);
      setBestTime(data);
    } catch {
      toast.error('Could not load best time data');
    }
  };

  const handleBudgetEstimate = async (e) => {
    e.preventDefault();
    setBudgetLoading(true);
    try {
      const data = await estimateBudget({ destination_ids: [id], ...budgetForm });
      setBudgetEstimate(data);
    } catch {
      toast.error('Could not estimate budget');
    } finally {
      setBudgetLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="global-spinner" />
    </div>
  );

  if (!dest) return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <h2>Destination not found</h2>
      <Link to="/discover" style={{ color: '#141413', fontWeight: 600, textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
        Back to Destinations
      </Link>
    </div>
  );

  const imgSrc = dest.image_url || dest.image;
  const chartData = MONTHS.map((m, i) => ({
    month: m,
    score: dest.seasonal_score?.[i + 1] ?? 70,
  }));

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'besttime', label: 'Best Time' },
    { key: 'attractions', label: 'Attractions' },
    { key: 'budget', label: 'Budget Estimate' },
  ];

  return (
    <div style={{ paddingTop: 'var(--navbar-offset, 88px)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        height: '50vh',
        minHeight: '350px',
        background: imgSrc
          ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${imgSrc}) center/cover`
          : 'linear-gradient(135deg, #1e3a5f, #065f46)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '2.5rem 3rem',
        color: 'white',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', opacity: 0.85, fontSize: '0.9rem' }}>
            <MapPin size={16} /> {dest.state_name || dest.country_name || ''}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, marginBottom: '0.75rem' }}>{dest.name}</h1>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
            {dest.rating && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} fill="#fbbf24" stroke="none" /> {Number(dest.rating).toFixed(1)}</span>}
            {dest.budget_category && <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)' }}>{dest.budget_category}</span>}
            {dest.estimated_cost_per_day && <span>₹{Number(dest.estimated_cost_per_day).toLocaleString('en-IN')}/day avg</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0eee6', position: 'sticky', top: '70px', zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '0' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); if (t.key === 'besttime') loadBestTime(); }}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: 'none',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: activeTab === t.key ? '#141413' : '#87867f',
                borderBottom: activeTab === t.key ? '2px solid #141413' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#141413', marginBottom: '1rem' }}>About {dest.name}</h2>
              <p style={{ color: '#5e5d59', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '2rem' }}>{dest.description || 'A beautiful destination waiting to be explored.'}</p>
              {dest.best_time_to_visit && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#065f46', marginBottom: '0.4rem' }}>
                    <Calendar size={16} /> Best Time to Visit
                  </div>
                  <p style={{ color: '#047857', margin: 0 }}>{dest.best_time_to_visit}</p>
                </div>
              )}
              <Link
                to={`/planner?destination=${encodeURIComponent(dest.name)}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#141413', color: 'white', padding: '1rem 2rem', borderRadius: '50px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
              >
                <Sparkles size={18} /> Plan a Trip Here
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: <DollarSign size={18} />, label: 'Budget Category', value: dest.budget_category || 'Mid' },
                { icon: <Star size={18} />, label: 'Rating', value: dest.rating ? `${Number(dest.rating).toFixed(1)} / 5` : 'Not rated' },
                { icon: <Users size={18} />, label: 'Best For', value: dest.compatible_traveler_types || 'All travelers' },
                { icon: <TrendingUp size={18} />, label: 'Popularity', value: dest.popularity_score ? `${dest.popularity_score}/100` : 'N/A' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f5f4ed', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: '#5e5d59' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#87867f', fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontWeight: 600, color: '#141413', fontSize: '0.95rem' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Time */}
        {activeTab === 'besttime' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#141413', marginBottom: '0.5rem' }}>Best Time to Visit {dest.name}</h2>
            <p style={{ color: '#5e5d59', marginBottom: '2rem' }}>Monthly suitability scores (higher = better)</p>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5e5d59' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#5e5d59' }} />
                  <Tooltip
                    formatter={(v) => [`${v}/100`, 'Score']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f0eee6' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 70 ? '#5ac576' : entry.score >= 50 ? '#fbbf24' : '#f87171'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {bestTime?.top_months && (
              <div>
                <h3 style={{ fontWeight: 700, color: '#141413', marginBottom: '1rem' }}>Top 3 Months</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {bestTime.top_months.map((m, i) => (
                    <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem' }}>{m.month_name || MONTHS[m.month - 1]}</div>
                      <div style={{ color: '#047857', fontSize: '0.85rem', marginTop: '4px' }}>Score: {m.score}/100</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attractions */}
        {activeTab === 'attractions' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#141413', marginBottom: '1.5rem' }}>Top Attractions</h2>
            {dest.attractions && dest.attractions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {dest.attractions.map((a) => (
                  <div key={a.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #faf9f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontWeight: 700, color: '#141413', fontSize: '1rem', flex: 1 }}>{a.name}</h3>
                      {a.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#E8F8F2', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#088A52', flexShrink: 0, marginLeft: '0.5rem' }}>
                          <Star size={12} fill="#0BA060" stroke="none" /> {Number(a.rating).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#5e5d59', marginBottom: '0.5rem' }}>{a.type}</div>
                    {a.entry_cost_max > 0 && (
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#141413' }}>
                        ₹{Number(a.entry_cost_max).toLocaleString('en-IN')} entry
                      </div>
                    )}
                    {a.avg_visit_duration_hours && (
                      <div style={{ fontSize: '0.8rem', color: '#87867f', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {a.avg_visit_duration_hours}h avg visit
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', background: '#f5f4ed', borderRadius: '16px', color: '#5e5d59' }}>
                No attraction data available yet.
              </div>
            )}
          </div>
        )}

        {/* Budget Estimate */}
        {activeTab === 'budget' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#141413', marginBottom: '0.5rem' }}>Budget Estimator</h2>
            <p style={{ color: '#5e5d59', marginBottom: '2rem' }}>Get a cost breakdown before you commit to planning</p>

            <form onSubmit={handleBudgetEstimate} style={{ background: '#f5f4ed', borderRadius: '16px', padding: '2rem', border: '1px solid #f0eee6', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#141413', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={budgetForm.duration}
                    onChange={(e) => setBudgetForm(p => ({ ...p, duration: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #f0eee6', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#141413', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Travelers</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={budgetForm.travelers}
                    onChange={(e) => setBudgetForm(p => ({ ...p, travelers: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #f0eee6', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#141413', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Style</label>
                <select
                  value={budgetForm.budget_category}
                  onChange={(e) => setBudgetForm(p => ({ ...p, budget_category: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #f0eee6', borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                >
                  <option value="budget">Budget</option>
                  <option value="mid">Mid-Range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <button type="submit" disabled={budgetLoading} style={{ width: '100%', padding: '1rem', background: '#141413', color: 'white', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                {budgetLoading ? 'Calculating...' : 'Estimate Budget'}
              </button>
            </form>

            {budgetEstimate && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontWeight: 700, color: '#141413', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                  Estimated Total: ₹{Number(budgetEstimate.total || budgetEstimate.total_estimated || 0).toLocaleString('en-IN')}
                </h3>
                {(budgetEstimate.breakdown || budgetEstimate.category_breakdown) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(budgetEstimate.breakdown || budgetEstimate.category_breakdown || {}).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #faf9f5' }}>
                        <span style={{ color: '#5e5d59', textTransform: 'capitalize' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: '#141413' }}>₹{Number(v).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  to={`/planner?destination=${encodeURIComponent(dest.name)}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem', background: '#5ac576', color: '#141413', padding: '1rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}
                >
                  <Sparkles size={16} /> Plan This Trip
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationDetails;
