import React, { useEffect, useState, useCallback } from 'react';
import { Search, SearchX, Sparkles } from 'lucide-react';
import styles from './DestinationsPage.module.css';
import DestinationCard from '../../components/DestinationCard/DestinationCard.jsx';
import { getDestinations, recommend } from '../../services/api.js';
import toast from 'react-hot-toast';

const getCardVariant = (index) => {
  const i = index % 10;
  if (i === 0) return 'large';
  if (i === 3 || i === 7) return 'tall';
  if (i === 4 || i === 8) return 'wide';
  return 'default';
};

const BUDGET_FILTERS = ['All', 'budget', 'mid', 'luxury'];
const TRAVELER_FILTERS = ['All', 'solo', 'couple', 'family', 'group'];

const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [travelerFilter, setTravelerFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  const fetchDestinations = useCallback(async (reset = false, signal = null) => {
    setLoading(true);
    try {
      const params = { limit: 20, page: reset ? 1 : page, signal };
      if (budgetFilter !== 'All') params.budget_category = budgetFilter;
      if (travelerFilter !== 'All') params.traveler_type = travelerFilter;
      const data = await getDestinations(params);
      const items = Array.isArray(data) ? data : (data.items || data.destinations || []);
      if (reset) {
        setDestinations(items);
        setPage(1);
      } else {
        setDestinations(prev => [...prev, ...items]);
      }
      setHasMore(items.length === 20);
    } catch (err) {
      if (err.name === 'AbortError') return;
      toast.error('Failed to load destinations', { id: 'fetch-destinations-error' });
    } finally {
      setLoading(false);
    }
  }, [page, budgetFilter, travelerFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    fetchDestinations(true, controller.signal);
    return () => controller.abort();
  }, [budgetFilter, travelerFilter, fetchDestinations]);

  const handleRecommend = async () => {
    setRecommendLoading(true);
    try {
      const params = {};
      if (budgetFilter !== 'All') params.budget_category = budgetFilter;
      if (travelerFilter !== 'All') params.traveler_type = travelerFilter;
      params.limit = 6;
      const data = await recommend(params);
      const items = Array.isArray(data) ? data : (data.destinations || []);
      if (items.length > 0) {
        setDestinations(items);
        toast.success(`Found ${items.length} recommended destinations!`);
      } else {
        toast.error('No recommendations found. Try different filters.');
      }
    } catch {
      toast.error('Could not load recommendations');
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiSearchLoading(true);
    try {
      const params = { q: aiQuery.trim(), limit: 8 };
      if (budgetFilter !== 'All') params.budget_category = budgetFilter;
      if (travelerFilter !== 'All') params.traveler_type = travelerFilter;
      const data = await recommend(params);
      const items = Array.isArray(data) ? data : (data.destinations || []);
      if (items.length > 0) {
        setDestinations(items);
        toast.success(`AI found ${items.length} matches for "${aiQuery}"`);
      } else {
        toast.error('No matches found. Try a different query.');
      }
    } catch {
      toast.error('AI search failed. Try again.');
    } finally {
      setAiSearchLoading(false);
    }
  };

  const filtered = destinations.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.state_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh', backgroundColor: '#fff' }}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Explore the World</h1>
          <p className={styles.pageSubtitle}>
            Discover breathtaking locations handcrafted for your perfect getaway.
          </p>

          <div className={styles.searchWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search destinations, states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterRow}>
            {BUDGET_FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterChip} ${budgetFilter === f ? styles.active : ''}`}
                onClick={() => setBudgetFilter(f)}
              >
                {f === 'All' ? 'All Budgets' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.filterRow}>
            {TRAVELER_FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterChip} ${travelerFilter === f ? styles.active : ''}`}
                onClick={() => setTravelerFilter(f)}
              >
                {f === 'All' ? 'All Travelers' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <button className={styles.recommendBtn} onClick={handleRecommend} disabled={recommendLoading}>
            <Sparkles size={16} />
            {recommendLoading ? 'Loading...' : 'Not sure? Get AI Recommendations'}
          </button>

          {/* Semantic AI search */}
          <form onSubmit={handleAiSearch} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', maxWidth: '560px', margin: '0.75rem auto 0' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Sparkles size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a855f7', pointerEvents: 'none' }} />
              <input
                type="text"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder='AI search: "beaches for families" or "mountain treks"'
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '12px', paddingTop: '0.7rem', paddingBottom: '0.7rem', border: '1.5px solid #e0d7f7', borderRadius: '50px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', background: '#faf5ff', color: '#1e293b', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={aiSearchLoading || !aiQuery.trim()}
              style={{ padding: '0.7rem 1.25rem', background: aiSearchLoading || !aiQuery.trim() ? '#c4b5fd' : '#7c3aed', color: 'white', border: 'none', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem', cursor: aiSearchLoading || !aiQuery.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {aiSearchLoading ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {loading && destinations.length === 0 ? (
          <div className={styles.grid}>
            {Array(8).fill(0).map((_, i) => {
              const v = getCardVariant(i);
              return (
                <div key={i} className={`${styles.skeleton} ${styles[`card_${v}`] || ''}`} />
              );
            })}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {filtered.length > 0 ? (
                filtered.map((dest, i) => (
                  <DestinationCard key={dest.id} dest={dest} variant={getCardVariant(i)} />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6rem 2rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '1.5rem',
                  border: '1px dashed #cbd5e1',
                  textAlign: 'center',
                }}>
                  <SearchX size={48} style={{ color: '#94a3b8', marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>No destinations found</h3>
                  <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '400px' }}>
                    {searchTerm
                      ? `No results for "${searchTerm}". Try a different search.`
                      : 'Try adjusting your filters.'}
                  </p>
                </div>
              )}
            </div>

            {hasMore && !searchTerm && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  onClick={() => { setPage(p => p + 1); fetchDestinations(); }}
                  disabled={loading}
                  style={{
                    background: '#1e293b',
                    color: 'white',
                    padding: '0.85rem 2.5rem',
                    borderRadius: '50px',
                    border: 'none',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default DestinationsPage;
