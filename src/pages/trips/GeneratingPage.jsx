import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import { getItineraryStatus, saveTrip } from '../../services/api.js';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL || '';

const MESSAGES = [
  'Analyzing your travel preferences...',
  'Filtering 200+ attractions across destinations...',
  'Clustering destinations with H3 geospatial...',
  'Optimizing your daily routes...',
  'Calculating real-time budget breakdowns...',
  'Checking weather and local events...',
  'Crafting AI-powered descriptions for each spot...',
  'Adding local secrets and insider tips...',
  'Generating your personalized trip title...',
  'Building smart travel insights...',
  'Packing tips tailored to your destination...',
  'Cross-checking itinerary quality...',
  'Finalizing your personalized itinerary...',
  'Almost ready! Putting on the finishing touches...',
];

const GeneratingPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(5);
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const savedRef = useRef(false);
  const pollRef = useRef(null);
  const pollErrorCount = useRef(0);

  const stateData = location.state || {};

  const handleCompleted = async (result, msgInterval) => {
    if (savedRef.current) return;
    savedRef.current = true;
    setProgress(100);
    clearInterval(msgInterval);
    try {
      const itinerary = result;
      const savePayload = {
        itinerary_json: itinerary,
        trip_title: itinerary?.trip_title || 'My Trip',
        budget: stateData.budget || itinerary?.total_cost || 0,
        duration: stateData.duration || itinerary?.itinerary?.length || 0,
      };
      const saved = await saveTrip(savePayload);
      if (saved.id) {
        setTimeout(() => navigate(`/trip/${saved.id}`), 500);
        return;
      }
    } catch {
      // not logged in — fall through
    }
    setTimeout(() => navigate(`/trip/preview`, { state: { itinerary: result } }), 500);
  };

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length);
      // Slow progress after 60% so the bar doesn't pin at 90% for 80+ seconds with local AI
      setProgress(p => {
        if (p < 60) return Math.min(p + 8, 60);
        if (p < 85) return Math.min(p + 2, 85);
        return p;
      });
    }, 3500);

    // ── Try SSE stream first ──────────────────────────────────────────────────
    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(`${BASE}/get-itinerary-status/${jobId}/stream`);
      pollRef.current = es;

      es.onmessage = async (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.heartbeat) return;
          const s = data.status;
          setStatus(s);
          if (s === 'completed') {
            es.close();
            await handleCompleted(data.result, msgInterval);
          } else if (s === 'failed') {
            es.close();
            clearInterval(msgInterval);
            setError(data.error_message || 'Generation failed. Please try again.');
          }
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        es.close();
        // Fall back to polling
        startPolling(msgInterval);
      };

      return () => {
        es.close();
        clearInterval(msgInterval);
      };
    }

    // ── Polling fallback ──────────────────────────────────────────────────────
    startPolling(msgInterval);
    return () => {
      clearInterval(msgInterval);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobId, navigate]);

  const startPolling = (msgInterval) => {
    const poll = async () => {
      try {
        const data = await getItineraryStatus(jobId);
        setStatus(data.status);
        if (data.status === 'completed') {
          clearInterval(pollRef.current);
          await handleCompleted(data.result, msgInterval);
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current);
          clearInterval(msgInterval);
          setError(data.error_message || 'Generation failed. Please try again.');
        }
      } catch {
        pollErrorCount.current += 1;
        if (pollErrorCount.current >= 5) {
          clearInterval(pollRef.current);
          clearInterval(msgInterval);
          setError('Lost connection to the server. Please check your network and try again.');
        }
      }
    };
    poll();
    pollRef.current = setInterval(poll, 2000);
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={32} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Generation Failed</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/planner')}
              style={{ padding: '0.85rem 2rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '50px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d3b2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'white',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        {/* Animated Icon */}
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2.5rem' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(74,222,128,0.2)',
            animation: 'spin 3s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#4ade80',
            animation: 'spin 1.5s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={36} color="#4ade80" />
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Building Your Perfect Trip
        </h1>

        <p style={{ color: '#4ade80', fontSize: '1.05rem', fontWeight: 500, minHeight: '1.5rem', marginBottom: '2.5rem', transition: 'opacity 0.5s' }}>
          {MESSAGES[messageIndex]}
        </p>

        {/* Progress Bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '3rem' }}>
          <div style={{
            height: '100%',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #4ade80, #22d3ee)',
            width: `${progress}%`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>

        {/* Stage Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Filtering', done: progress > 20 },
            { label: 'Routing', done: progress > 50 },
            { label: 'AI Polish', done: progress > 80 },
          ].map((stage, i) => (
            <div key={i} style={{
              padding: '1rem',
              borderRadius: '12px',
              background: stage.done ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${stage.done ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.5s',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: stage.done ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                {stage.done ? '✓ ' : ''}{stage.label}
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
          This usually takes 30–120 seconds depending on server load
        </p>
      </div>
    </div>
  );
};

export default GeneratingPage;
