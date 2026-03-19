import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, AlertTriangle } from 'lucide-react';
import { getProfile, updateProfile, deleteAccount } from '../../services/api.js';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) setForm({ name: user.name || '', email: user.email || '' });
    getProfile().then(setProfile).catch(() => {});
  }, [user, authLoading]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch {
      toast.error('Could not delete account');
    }
  };

  if (authLoading || !user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="global-spinner" /></div>;

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '2.5rem' }}>My Profile</h1>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Account Details</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '0.9rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Stats */}
        {profile?.stats && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
            <h2 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Travel Stats</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
              {[
                { value: profile.stats.trips_count || 0, label: 'Trips' },
                { value: profile.stats.destinations_visited || 0, label: 'Destinations' },
                { value: `₹${((profile.stats.total_budget || 0) / 1000).toFixed(0)}k`, label: 'Budget Planned' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #fecaca' }}>
          <h2 style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> Danger Zone
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {showDelete ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleDelete} style={{ padding: '0.75rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
                Yes, Delete Account
              </button>
              <button onClick={() => setShowDelete(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDelete(true)} style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
