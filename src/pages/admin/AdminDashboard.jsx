import React, { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Activity, Users, MapPin, Zap, RefreshCw, BarChart2, Clock, CheckCircle, AlertCircle,
  Shield, LogOut, Play, TrendingUp, Database, BookOpen, Plus, Pencil, Trash2, Eye, EyeOff, X, Save, ArrowLeft
} from 'lucide-react';
import { adminGetOpsSummary, adminTriggerJob, adminGetStats, adminGetEngineConfig, adminUpdateEngineConfig, adminGetBlogs, adminCreateBlog, adminUpdateBlog, adminDeleteBlog } from '../../services/api.js';
import toast from 'react-hot-toast';

const StatCard = ({ icon, title, value, sub, color = '#1e293b' }) => (
  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ color: '#64748b' }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const JOB_NAMES = [
  'run_osm_ingestion', 'run_enrichment', 'run_scoring', 'run_price_sync',
  'run_score_update', 'run_destination_validation', 'run_cache_warm',
  'run_affiliate_health', 'run_quality_scoring', 'heartbeat',
];

const AdminDashboard = () => {
  const { isAdmin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [liveEvents, setLiveEvents] = useState([]);
  const [engineConfig, setEngineConfig] = useState({});
  const [configSaving, setConfigSaving] = useState(false);
  const eventSourceRef = useRef(null);

  // Blog CMS state
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogView, setBlogView] = useState('list'); // 'list' | 'edit' | 'preview'
  const [editingBlog, setEditingBlog] = useState(null); // null = new post
  const [blogSaving, setBlogSaving] = useState(false);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const EMPTY_BLOG = { title: '', category: '', date: '', readTime: '', image: '', excerpt: '', content: '', author: '', published: true };

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    loadData();
    setupSSE();
    return () => { if (eventSourceRef.current) eventSourceRef.current.close(); };
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, st] = await Promise.all([adminGetOpsSummary(), adminGetStats()]);
      setSummary(sum);
      setStats(st);
    } catch (err) {
      if (err.status === 401 || err.status === 403) { navigate('/admin/login'); return; }
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupSSE = () => {
    const token = localStorage.getItem('ag_admin_token');
    if (!token) return;
    // NOTE: EventSource does not support custom headers; the token must be passed
    // as a query param. Ensure the backend treats this endpoint as short-lived and
    // rate-limits it. Use HTTPS in production to prevent token exposure in plaintext.
    const es = new EventSource(`/api/ops/live-metrics?token=${encodeURIComponent(token)}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setLiveEvents(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 50));
      } catch {}
    };
    es.onerror = () => es.close();
    eventSourceRef.current = es;
  };

  const handleTriggerJob = async (jobName) => {
    try {
      await adminTriggerJob(jobName);
      toast.success(`Job "${jobName}" triggered`);
    } catch (err) {
      toast.error(err.message || 'Failed to trigger job');
    }
  };

  const loadEngineConfig = async () => {
    try {
      const data = await adminGetEngineConfig();
      setEngineConfig(data.settings || data || {});
    } catch { toast.error('Could not load engine config'); }
  };

  const handleSaveConfig = async () => {
    setConfigSaving(true);
    try {
      await adminUpdateEngineConfig(engineConfig);
      toast.success('Config saved!');
    } catch { toast.error('Could not save config'); }
    finally { setConfigSaving(false); }
  };

  useEffect(() => {
    setPendingDeleteId(null);
    if (activeTab === 'config') loadEngineConfig();
    if (activeTab === 'blogs') loadBlogs();
  }, [activeTab]);

  const loadBlogs = async () => {
    setBlogsLoading(true);
    try {
      const data = await adminGetBlogs();
      setBlogs(Array.isArray(data) ? data : (data.blogs || []));
    } catch { toast.error('Failed to load blog posts'); }
    finally { setBlogsLoading(false); }
  };

  const openNewBlog = () => { setEditingBlog({ ...EMPTY_BLOG }); setBlogView('edit'); };
  const openEditBlog = (b) => { setEditingBlog({ ...b, readTime: b.readTime || b.read_time || '' }); setBlogView('edit'); };
  const openPreview = (b) => { setPreviewBlog(b); setBlogView('preview'); };

  const handleSaveBlog = async () => {
    if (!editingBlog?.title?.trim()) { toast.error('Title is required'); return; }
    setBlogSaving(true);
    try {
      const payload = { ...editingBlog };
      if (editingBlog.id) {
        const res = await adminUpdateBlog(editingBlog.id, payload);
        setBlogs(prev => prev.map(b => b.id === editingBlog.id ? res.post : b));
        toast.success('Blog updated!');
      } else {
        const res = await adminCreateBlog(payload);
        setBlogs(prev => [res.post, ...prev]);
        toast.success('Blog post created!');
      }
      setBlogView('list');
      setEditingBlog(null);
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setBlogSaving(false); }
  };

  const handleDeleteBlog = async (id) => {
    if (pendingDeleteId !== id) { setPendingDeleteId(id); return; }
    setPendingDeleteId(null);
    try {
      await adminDeleteBlog(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
      toast.success('Blog post deleted');
    } catch (err) { toast.error(err.message || 'Delete failed'); }
  };

  const handleTogglePublished = async (blog) => {
    try {
      const payload = { ...blog, published: !blog.published };
      const res = await adminUpdateBlog(blog.id, payload);
      setBlogs(prev => prev.map(b => b.id === blog.id ? res.post : b));
      toast.success(payload.published ? 'Published' : 'Unpublished');
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  if (!isAdmin) return null;

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', padding: '0.65rem 0.9rem', borderRadius: '8px', fontFamily: 'Poppins, sans-serif',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem',
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem',
  };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { key: 'jobs', label: 'Jobs', icon: <Zap size={16} /> },
    { key: 'live', label: 'Live Feed', icon: <Activity size={16} /> },
    { key: 'config', label: 'Engine Config', icon: <Database size={16} /> },
    { key: 'blogs', label: 'Blog CMS', icon: <BookOpen size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
      {/* Admin Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={22} color="#4ade80" />
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>AltairGO Admin</span>
          <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Mission Control</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={loadData}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => { adminLogout(); navigate('/admin/login'); }}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', fontSize: '0.85rem' }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', border: 'none', background: activeTab === t.key ? 'rgba(74,222,128,0.15)' : 'transparent', color: activeTab === t.key ? '#4ade80' : 'rgba(255,255,255,0.5)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading && !summary ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                {stats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <StatCard icon={<Users size={20} />} title="Total Users" value={stats.users_total} sub="registered accounts" />
                    <StatCard icon={<MapPin size={20} />} title="Destinations" value={stats.destinations_total} sub="in database" />
                    <StatCard icon={<TrendingUp size={20} />} title="Trips Today" value={stats.trips_today || stats.trips_generated_today} sub="generated" color="#4ade80" />
                    <StatCard icon={<Activity size={20} />} title="Total Trips" value={stats.trips_total} sub="all time" />
                  </div>
                )}

                {summary && (
                  <>
                    {/* Gemini Metrics */}
                    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="#4ade80" /> Gemini AI
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {[
                          { label: 'Calls Today', value: summary.gemini?.calls_today },
                          { label: 'Tokens Today', value: summary.gemini?.tokens_today?.toLocaleString() },
                          { label: 'Errors Today', value: summary.gemini?.errors_today },
                          { label: 'Error Rate', value: summary.gemini?.error_rate_pct ? `${summary.gemini.error_rate_pct}%` : '0%' },
                        ].map((m, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{m.label}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{m.value ?? '—'}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cache */}
                    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem' }}>Cache Performance</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {[
                          { label: 'Hits Today', value: summary.cache?.hits_today },
                          { label: 'Misses Today', value: summary.cache?.misses_today },
                          { label: 'Hit Rate', value: summary.cache?.hit_rate_pct ? `${summary.cache.hit_rate_pct}%` : '—', color: '#4ade80' },
                        ].map((m, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.4rem' }}>{m.label}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color || 'white' }}>{m.value ?? '—'}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Celery Tasks */}
                    {summary.celery_tasks && Object.keys(summary.celery_tasks).length > 0 && (
                      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem' }}>Celery Task Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {Object.entries(summary.celery_tasks).map(([task, info]) => (
                            <div key={task} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{task}</span>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{info?.last_run || 'Never'}</span>
                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: info?.status === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', color: info?.status === 'success' ? '#4ade80' : '#fca5a5', fontWeight: 600 }}>
                                  {info?.status || 'unknown'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div>
                <h2 style={{ color: 'white', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Manual Job Triggers</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {JOB_NAMES.map(job => (
                    <div key={job} style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace', marginBottom: '4px' }}>{job}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                          {summary?.celery_tasks?.[job]?.last_run || 'Never run'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleTriggerJob(job)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0, marginLeft: '1rem' }}
                      >
                        <Play size={12} /> Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LIVE FEED TAB */}
            {activeTab === 'live' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>Live Metrics Stream</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4ade80' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
                    Live
                  </div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '600px', overflowY: 'auto' }}>
                  {liveEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '3rem' }}>
                      <Activity size={32} style={{ margin: '0 auto 1rem' }} />
                      <p>Waiting for live events...</p>
                    </div>
                  ) : (
                    liveEvents.map((evt) => (
                      <div key={evt.id} style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{ color: '#64748b', marginRight: '1rem' }}>{new Date(evt.timestamp || Date.now()).toLocaleTimeString()}</span>
                        <span style={{ color: '#4ade80', marginRight: '1rem' }}>{evt.event_type || 'metric'}</span>
                        <span>{JSON.stringify(evt)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* BLOG CMS TAB */}
            {activeTab === 'blogs' && (
              <div>
                {/* ── List view ── */}
                {blogView === 'list' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>Blog Posts ({blogs.length})</h2>
                      <button
                        onClick={openNewBlog}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem' }}
                      >
                        <Plus size={16} /> New Post
                      </button>
                    </div>
                    {blogsLoading ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
                    ) : blogs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>No blog posts yet. Click "New Post" to create one.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {blogs.map(blog => (
                          <div key={blog.id} style={{ background: '#1e293b', borderRadius: '14px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Thumbnail */}
                            <div style={{ width: '64px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                              {blog.image ? <img src={blog.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : null}
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</div>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {blog.category && <span style={{ fontSize: '0.72rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>{blog.category}</span>}
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{blog.date}</span>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{blog.readTime}</span>
                              </div>
                            </div>
                            {/* Published badge */}
                            <button
                              onClick={() => handleTogglePublished(blog)}
                              title={blog.published ? 'Click to unpublish' : 'Click to publish'}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: blog.published ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', color: blog.published ? '#4ade80' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}
                            >
                              {blog.published ? <Eye size={12} /> : <EyeOff size={12} />}
                              {blog.published ? 'Live' : 'Draft'}
                            </button>
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                              <button onClick={() => openPreview(blog)} title="Preview" style={{ padding: '0.45rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Eye size={15} /></button>
                              <button onClick={() => openEditBlog(blog)} title="Edit" style={{ padding: '0.45rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.5)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Pencil size={15} /></button>
                              <button
                                onClick={() => handleDeleteBlog(blog.id)}
                                title={pendingDeleteId === blog.id ? 'Click again to confirm delete' : 'Delete'}
                                style={{ padding: '0.45rem 0.6rem', background: pendingDeleteId === blog.id ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.08)', border: pendingDeleteId === blog.id ? '1px solid rgba(239,68,68,0.4)' : 'none', color: '#fca5a5', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontFamily: 'inherit' }}
                              >
                                <Trash2 size={15} />{pendingDeleteId === blog.id ? 'Confirm?' : ''}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── Edit / New view ── */}
                {blogView === 'edit' && editingBlog && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <button onClick={() => { setBlogView('list'); setEditingBlog(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', padding: 0 }}>
                        <ArrowLeft size={16} /> Back to list
                      </button>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => openPreview(editingBlog)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.1rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button
                          onClick={handleSaveBlog}
                          disabled={blogSaving}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', background: blogSaving ? 'rgba(74,222,128,0.4)' : '#4ade80', color: '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem' }}
                        >
                          <Save size={14} /> {blogSaving ? 'Saving...' : editingBlog.id ? 'Save Changes' : 'Publish Post'}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Title */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Title *</label>
                        <input value={editingBlog.title} onChange={e => setEditingBlog(p => ({ ...p, title: e.target.value }))} placeholder="Blog post title" style={inputStyle} />
                      </div>
                      {/* Category */}
                      <div>
                        <label style={labelStyle}>Category</label>
                        <input value={editingBlog.category} onChange={e => setEditingBlog(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Travel Guide" style={inputStyle} />
                      </div>
                      {/* Author */}
                      <div>
                        <label style={labelStyle}>Author</label>
                        <input value={editingBlog.author} onChange={e => setEditingBlog(p => ({ ...p, author: e.target.value }))} placeholder="Author name" style={inputStyle} />
                      </div>
                      {/* Date */}
                      <div>
                        <label style={labelStyle}>Date</label>
                        <input value={editingBlog.date} onChange={e => setEditingBlog(p => ({ ...p, date: e.target.value }))} placeholder="e.g. Dec 20, 2025" style={inputStyle} />
                      </div>
                      {/* Read time */}
                      <div>
                        <label style={labelStyle}>Read Time</label>
                        <input value={editingBlog.readTime} onChange={e => setEditingBlog(p => ({ ...p, readTime: e.target.value }))} placeholder="e.g. 5 min read" style={inputStyle} />
                      </div>
                      {/* Image URL */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Cover Image URL</label>
                        <input value={editingBlog.image} onChange={e => setEditingBlog(p => ({ ...p, image: e.target.value }))} placeholder="/assets/blog_photo.png or https://..." style={inputStyle} />
                        {editingBlog.image && (
                          <div style={{ marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                            <img src={editingBlog.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                          </div>
                        )}
                      </div>
                      {/* Excerpt */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Excerpt / Summary</label>
                        <textarea value={editingBlog.excerpt} onChange={e => setEditingBlog(p => ({ ...p, excerpt: e.target.value }))} rows={3} placeholder="Short description shown on the blog listing page..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                      </div>
                      {/* Content */}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Content (HTML)</label>
                        <textarea value={editingBlog.content} onChange={e => setEditingBlog(p => ({ ...p, content: e.target.value }))} rows={18} placeholder="<p>Your blog content here...</p><h3>Section heading</h3><p>More content...</p>" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }} />
                      </div>
                      {/* Published toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Published</label>
                        <button
                          onClick={() => setEditingBlog(p => ({ ...p, published: !p.published }))}
                          style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: editingBlog.published ? '#4ade80' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                        >
                          <span style={{ position: 'absolute', top: '3px', left: editingBlog.published ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                        </button>
                        <span style={{ fontSize: '0.8rem', color: editingBlog.published ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>{editingBlog.published ? 'Visible to readers' : 'Draft — hidden'}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Preview view ── */}
                {blogView === 'preview' && previewBlog && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <button
                        onClick={() => setBlogView(editingBlog ? 'edit' : 'list')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', padding: 0 }}
                      >
                        <ArrowLeft size={16} /> {editingBlog ? 'Back to editor' : 'Back to list'}
                      </button>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Preview — as readers will see it</span>
                    </div>
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', maxHeight: '75vh', overflowY: 'auto' }}>
                      {previewBlog.image && (
                        <div style={{ position: 'relative', height: '320px', background: '#1e293b' }}>
                          <img src={previewBlog.image} alt={previewBlog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem' }}>
                            {previewBlog.category && <span style={{ background: '#65a30d', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{previewBlog.category}</span>}
                            <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, marginTop: '0.75rem', lineHeight: 1.25, fontFamily: 'Poppins, sans-serif' }}>{previewBlog.title}</h1>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif' }}>
                              {previewBlog.author && <span>By {previewBlog.author}</span>}
                              {previewBlog.date && <span>{previewBlog.date}</span>}
                              {previewBlog.readTime && <span>{previewBlog.readTime}</span>}
                            </div>
                          </div>
                        </div>
                      )}
                      <div style={{ padding: '2.5rem', maxWidth: '720px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
                        {!previewBlog.image && (
                          <>
                            {previewBlog.category && <span style={{ background: '#ecfccb', color: '#4d7c0f', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{previewBlog.category}</span>}
                            <h1 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: 700, margin: '0.75rem 0', lineHeight: 1.25 }}>{previewBlog.title}</h1>
                            <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                              {previewBlog.author && <span>By {previewBlog.author}</span>}
                              {previewBlog.date && <span>{previewBlog.date}</span>}
                              {previewBlog.readTime && <span>{previewBlog.readTime}</span>}
                            </div>
                          </>
                        )}
                        {previewBlog.excerpt && (
                          <p style={{ fontSize: '1.1rem', color: '#475569', borderLeft: '4px solid #65a30d', paddingLeft: '1.25rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>{previewBlog.excerpt}</p>
                        )}
                        {previewBlog.content && (
                          <div
                            style={{ fontSize: '1rem', color: '#1e293b', lineHeight: 1.8 }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewBlog.content) }}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ENGINE CONFIG TAB */}
            {activeTab === 'config' && (
              <div>
                <h2 style={{ color: 'white', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Engine Configuration</h2>
                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {Object.keys(engineConfig).length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading config...</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        {Object.entries(engineConfig).map(([key, val]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.9rem', flex: 1 }}>{key}</label>
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => setEngineConfig(p => ({ ...p, [key]: e.target.value }))}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', width: '300px' }}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleSaveConfig}
                        disabled={configSaving}
                        style={{ padding: '0.85rem 2rem', background: '#4ade80', color: '#0f172a', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
                      >
                        {configSaving ? 'Saving...' : 'Save Configuration'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
