import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, AlertTriangle } from 'lucide-react';
import { getProfile, updateProfile, deleteAccount } from '../../services/api.js';
import toast from 'react-hot-toast';

const TRAVEL_STYLES = ['budget', 'mid', 'luxury'];
const TRAVELER_TYPES = ['solo', 'couple', 'family', 'group'];
const DIETARY_OPTIONS = ['none', 'vegetarian', 'vegan', 'halal', 'jain', 'gluten-free'];
const INTEREST_OPTIONS = ['adventure', 'beach', 'history', 'food', 'wildlife', 'spiritual', 'photography', 'shopping', 'nightlife', 'wellness'];

const ProfilePage = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [prefs, setPrefs] = useState({ preferred_style: '', traveler_type: '', dietary_restrictions: 'none', interests: [] });
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) setForm({ name: user.name || '', email: user.email || '' });
    getProfile().then(data => {
      setProfile(data);
      const p = data?.preferences || {};
      setPrefs({
        preferred_style: p.preferred_style || '',
        traveler_type: p.traveler_type || '',
        dietary_restrictions: p.dietary_restrictions || 'none',
        interests: Array.isArray(p.interests) ? p.interests : [],
      });
    }).catch(() => {});
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

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await updateProfile({ preferences: prefs });
      toast.success('Preferences saved!');
    } catch {
      toast.error('Could not save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleInterest = (interest) => {
    setPrefs(p => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter(i => i !== interest)
        : [...p.interests, interest],
    }));
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
    <div style={{ paddingTop: 'var(--navbar-offset, 88px)', minHeight: '100vh', background: '#f8fafc' }}>
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

        {/* Travel Preferences */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Travel Preferences</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Travel Style */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Travel Style</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {TRAVEL_STYLES.map(s => (
                  <button key={s} onClick={() => setPrefs(p => ({ ...p, preferred_style: p.preferred_style === s ? '' : s }))}
                    style={{ padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid', borderColor: prefs.preferred_style === s ? '#1e293b' : '#e2e8f0', background: prefs.preferred_style === s ? '#1e293b' : 'white', color: prefs.preferred_style === s ? 'white' : '#64748b', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Traveler Type */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.6rem', fontSize: '0.9rem' }}>I Usually Travel</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {TRAVELER_TYPES.map(t => (
                  <button key={t} onClick={() => setPrefs(p => ({ ...p, traveler_type: p.traveler_type === t ? '' : t }))}
                    style={{ padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid', borderColor: prefs.traveler_type === t ? '#1e293b' : '#e2e8f0', background: prefs.traveler_type === t ? '#1e293b' : 'white', color: prefs.traveler_type === t ? 'white' : '#64748b', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Dietary Preference</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {DIETARY_OPTIONS.map(d => (
                  <button key={d} onClick={() => setPrefs(p => ({ ...p, dietary_restrictions: d }))}
                    style={{ padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid', borderColor: prefs.dietary_restrictions === d ? '#1e293b' : '#e2e8f0', background: prefs.dietary_restrictions === d ? '#1e293b' : 'white', color: prefs.dietary_restrictions === d ? 'white' : '#64748b', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Interests</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {INTEREST_OPTIONS.map(i => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    style={{ padding: '0.45rem 1rem', borderRadius: '999px', border: '1.5px solid', borderColor: prefs.interests.includes(i) ? '#4f46e5' : '#e2e8f0', background: prefs.interests.includes(i) ? '#4f46e5' : 'white', color: prefs.interests.includes(i) ? 'white' : '#64748b', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSavePrefs} disabled={savingPrefs}
              style={{ padding: '0.9rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', alignSelf: 'flex-start', minWidth: '160px' }}>
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
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
