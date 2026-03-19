import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(key);
      toast.success('Admin access granted');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shield size={30} color="#4ade80" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Admin Access</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Enter your admin access key</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="password"
              placeholder="Admin access key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 14px 14px 44px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#4ade80', color: '#0f172a', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
