import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';
import { getItineraryStatus, saveTrip } from '../../services/api.js';
import toast from 'react-hot-toast';

const MESSAGES = [
  'Analyzing your travel preferences...',
  'Filtering 200+ attractions across destinations...',
  'Clustering destinations with H3 geospatial...',
  'Optimizing your daily routes...',
  'Calculating real-time budget breakdowns...',
  'Checking weather and local events...',
  'Adding Gemini AI polish to descriptions...',
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

  const stateData = location.state || {};

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length);
      setProgress(p => Math.min(p + 10, 90));
    }, 2500);

    const poll = async () => {
      try {
        const data = await getItineraryStatus(jobId);
        setStatus(data.status);

        if (data.status === 'completed' && !savedRef.current) {
          savedRef.current = true;
          setProgress(100);
          clearInterval(msgInterval);

          // Auto-save if user is logged in
          try {
            const itinerary = data.result;
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
            // If save fails (not logged in), still navigate but pass result
          }

          // No save, navigate to shared/raw view
          setTimeout(() => navigate(`/trip/preview`, { state: { itinerary: data.result } }), 500);

        } else if (data.status === 'failed') {
          clearInterval(msgInterval);
          setError(data.error_message || 'Generation failed. Please try again.');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);

    return () => {
      clearInterval(msgInterval);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobId, navigate]);

  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [status]);

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
          This usually takes 15-30 seconds
        </p>
      </div>
    </div>
  );
};

export default GeneratingPage;
