import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';
import logoUrl from '../assets/logo.png';
import heroBg from '../assets/hero-bg.png';
import philJaipur from '../assets/phil-jaipur.png';
import philKerala from '../assets/phil-kerala.png';
import philGoa from '../assets/phil-goa.png';
import philHimalayas from '../assets/phil-himalayas.png';
import destGoa from '../assets/dest-goa.png';
import destKashmir from '../assets/dest-kashmir.png';
import destRajasthan from '../assets/dest-rajasthan.png';
import destKerala from '../assets/dest-kerala.png';
import destHimachal from '../assets/dest-himachal.png';
import destMeghalaya from '../assets/dest-meghalaya.png';

/* ---------- Tweakable defaults ---------- */
const TWEAK_DEFAULTS = {
  "accentHue": 150,
  "headline": "The smarter way to plan your trips",
  "headlineItalic": "trips",
  "gradientIntensity": 0.3,
  "cardVariant": 1
};

/* ---------- Icons (minimal inline strokes) ---------- */
const I = {
  chev: (p) => <svg width="10" height="10" viewBox="0 0 10 10" {...p}><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  arrow: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M2.5 6h7M6 2.5L9.5 6L6 9.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  plus: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  pin: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M6 1.5c-2 0-3.5 1.5-3.5 3.4c0 2.4 3.5 5.6 3.5 5.6s3.5-3.2 3.5-5.6C9.5 3 8 1.5 6 1.5z" stroke="currentColor" strokeWidth="1.1" fill="none" /><circle cx="6" cy="5" r="1.2" fill="currentColor" /></svg>,
  clock: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1" fill="none" /><path d="M6 3.5V6l1.8 1.2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" /></svg>,
  plane: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M1.5 6.5l3 0.3l1.8 2.7l0.9-0.2l-1-3l2.8 0.3l1.1-1l-2.7-1.1l-0.9-3l-0.9 0.2l-0.4 3l-3.1 0.5z" stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round" /></svg>,
  bed: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M1.5 8.5V3.5M1.5 6h9v2.5M10.5 6V5a1 1 0 00-1-1H5.5v2" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" /><circle cx="3.5" cy="5.3" r="0.9" stroke="currentColor" strokeWidth="1" fill="none" /></svg>,
  fork: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M3.5 1.5v3.2a1.5 1.5 0 003 0V1.5M5 4.5v6M8.5 1.5c-.8 0-1.5.7-1.5 1.5v3h1.5v4.5" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" /></svg>,
  star: (p) => <svg width="10" height="10" viewBox="0 0 10 10" {...p}><path d="M5 1L6.2 3.7L9 4.1L7 6.1L7.5 9L5 7.6L2.5 9L3 6.1L1 4.1L3.8 3.7Z" fill="currentColor" /></svg>,
  spark: (p) => <svg width="14" height="14" viewBox="0 0 14 14" {...p}><path d="M7 1.5L8.2 5.3L12 6.5L8.2 7.7L7 11.5L5.8 7.7L2 6.5L5.8 5.3Z" fill="currentColor" /></svg>,
  search: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><circle cx="5.3" cy="5.3" r="3.3" stroke="currentColor" strokeWidth="1.2" fill="none" /><path d="M7.8 7.8L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  sun: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><circle cx="6" cy="6" r="2.3" stroke="currentColor" strokeWidth="1.1" fill="none" /><path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.5 2.5l1 1M8.5 8.5l1 1M2.5 9.5l1-1M8.5 3.5l1-1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>,
  moon: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M9.5 7.5A4 4 0 014.5 2.5A4 4 0 109.5 7.5z" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round" /></svg>,
  close: (p) => <svg width="12" height="12" viewBox="0 0 12 12" {...p}><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
};

/* ---------- Logo ---------- */
function Logo({ onDark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <img src={logoUrl} alt="ALTAIRGO" style={{ height: 28, width: 'auto', display: 'block', filter: onDark ? 'invert(1) brightness(1.8)' : 'none' }} />
    </div>
  );
}

/* ---------- Inline Nav (inside hero card) ---------- */
function InlineNav({ onPlan }) {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const items = [
    { label: 'Home', key: 'home' },
    { label: 'Destinations', key: 'dest', menu: ['Jaipur, Rajasthan', 'Kerala Backwaters', 'Varanasi, UP', 'Leh-Ladakh', 'Goa', 'Rishikesh & Haridwar', 'Hampi, Karnataka'] },
    { label: 'Planner', key: 'plan', menu: ['AI Itinerary Builder', 'Multi-city yatra', 'Group planning', 'Budget optimizer in ₹'] },
    { label: 'Resources', key: 'res', menu: ['Travel guides', 'IRCTC & flights', 'Packing lists', 'Community'] },
    { label: 'Pricing', key: 'price' }
  ];

  return (
    <div className={styles.inlineNav} style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', margin: '14px', borderRadius: 999, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 28px -12px rgba(60,30,15,0.18), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
      <Logo />
      <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} onMouseLeave={() => setOpen(null)}>
        {items.map((it) =>
          <div key={it.key} style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setOpen(it.menu ? it.key : null)}
              style={{
                all: 'unset', cursor: 'pointer', padding: '9px 14px', fontSize: 13.5, fontWeight: 500,
                color: it.key === 'home' ? 'var(--ink)' : 'var(--ink-soft)',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                borderBottom: it.key === 'home' ? '1.5px solid var(--ink)' : '1.5px solid transparent'
              }}>
              {it.label}{it.menu && <I.chev style={{ opacity: 0.5 }} />}
            </button>
            {it.menu && open === it.key &&
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, minWidth: 220, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 6, boxShadow: '0 20px 40px -20px rgba(40,30,20,0.18)', zIndex: 50 }}>
                {it.menu.map((m, i) =>
                  <div key={i} style={{ padding: '10px 12px', fontSize: 13, color: 'var(--ink-soft)', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--a1)'; e.currentTarget.style.color = 'var(--ink)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; }}>
                    {m}<I.arrow style={{ opacity: 0.5 }} />
                  </div>
                )}
              </div>
            }
          </div>
        )}
      </nav>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => navigate('/login')} style={{ all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, padding: '9px 14px', color: 'var(--ink-soft)' }}>Sign in</button>
        <button onClick={onPlan} style={{ all: 'unset', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, padding: '10px 18px', background: 'var(--a1)', color: 'var(--ink)', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Plan a trip <I.arrow />
        </button>
      </div>
    </div>
  );
}

/* ---------- Gradient wash ---------- */
function Wash({ intensity }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 640" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="w1" cx="0.22" cy="0.55" r="0.75">
          <stop offset="0" stopColor="var(--a3)" stopOpacity={0.55 * intensity} />
          <stop offset="0.5" stopColor="var(--a2)" stopOpacity={0.3 * intensity} />
          <stop offset="1" stopColor="var(--a1)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="w2" cx="0.08" cy="0.9" r="0.5">
          <stop offset="0" stopColor="var(--a2)" stopOpacity={0.4 * intensity} />
          <stop offset="1" stopColor="var(--a1)" stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" stroke="var(--ink)" strokeOpacity="0.04" fill="none" />
        </pattern>
      </defs>
      <rect width="1200" height="640" fill="url(#w1)" />
      <rect width="1200" height="640" fill="url(#w2)" />
      <rect width="1200" height="640" fill="url(#grid)" />
    </svg>
  );
}

/* ---------- Itinerary card variants ---------- */
const CARD_DATA = [
  {
    dest: 'Jaipur, Rajasthan',
    tag: 'Royal Heritage',
    blurb: 'Five unhurried days through palaces, stepwells, and the old bazaars of the Pink City — paced for rooftop chai mornings and havelis by night.',
    meta: [{ i: 'plane', t: 'Flight incl.' }, { i: 'bed', t: '2 havelis' }, { i: 'clock', t: '5 days' }],
    days: [
      { d: 'Mon', l: 'Amber Fort at sunrise', c: 'fort' },
      { d: 'Tue', l: 'Hawa Mahal & Jantar Mantar', c: 'heritage' },
      { d: 'Wed', l: 'Chand Baori stepwell', c: 'nature' },
      { d: 'Thu', l: 'Johari Bazaar + thali', c: 'food' },
      { d: 'Fri', l: 'Nahargarh & departure', c: 'fort' }
    ]
  },
  {
    dest: 'Kerala Backwaters',
    tag: 'Slow Coastal',
    blurb: 'A long weekend on a kettuvallam through Alleppey, with one day pulled out to the tea hills of Munnar and Ayurveda on Marari beach.',
    meta: [{ i: 'plane', t: 'Flight incl.' }, { i: 'bed', t: 'Houseboat + resort' }, { i: 'clock', t: '4 days' }],
    days: [
      { d: 'Fri', l: 'Kochi — Fort & Jew Town', c: 'walk' },
      { d: 'Sat', l: 'Alleppey houseboat', c: 'water' },
      { d: 'Sun', l: 'Munnar tea gardens', c: 'nature' },
      { d: 'Mon', l: 'Marari beach & fly out', c: 'beach' }
    ]
  },
  {
    dest: 'Leh-Ladakh',
    tag: 'High Himalaya',
    blurb: 'A week across moonscapes, monasteries, and the Nubra dunes — acclimatize in Leh, then climb to Pangong and back through Khardung La.',
    meta: [{ i: 'plane', t: 'Flight incl.' }, { i: 'bed', t: 'Homestay + camp' }, { i: 'clock', t: '7 days' }],
    days: [
      { d: 'Sat', l: 'Leh arrival + rest', c: 'city' },
      { d: 'Sun', l: 'Shanti Stupa & old town', c: 'heritage' },
      { d: 'Mon', l: 'Hemis & Thiksey monasteries', c: 'temple' },
      { d: 'Tue', l: 'Khardung La → Nubra', c: 'mountain' },
      { d: 'Wed', l: 'Hunder dunes & camels', c: 'desert' },
      { d: 'Thu', l: 'Pangong Tso night', c: 'lake' },
      { d: 'Fri', l: 'Return & departure', c: 'city' }
    ]
  }
];

function ItineraryCard({ variant, onCycle }) {
  const data = CARD_DATA[variant % CARD_DATA.length];
  const [hover, setHover] = useState(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', maxWidth: '100%' }} className={`${styles.responsiveGrid} ${styles.cardWrapper}`}>
      {/* left: itinerary */}
      <div style={{ padding: '22px 22px 20px' }} className={styles.cardLeft}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--a2), var(--a3))', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {data.dest.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{data.tag}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{data.dest}</div>
            </div>
          </div>
          <button onClick={onCycle} style={{ all: 'unset', cursor: 'pointer', fontSize: 10.5, fontFamily: 'var(--mono)', color: 'var(--ink-muted)', padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 6 }}>
            {variant + 1}/3 →
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.01em' }}>
          {data.dest.split(',')[0]} <span style={{ fontStyle: 'italic', color: 'var(--a3)' }}>itinerary</span>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-soft)', marginBottom: 16 }}>
          {data.blurb}
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed var(--line)' }}>
          {data.meta.map((m, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--ink-soft)' }}>
              {m.i === 'plane' && <I.plane />}
              {m.i === 'bed' && <I.bed />}
              {m.i === 'clock' && <I.clock />}
              {m.t}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {data.days.slice(0, 5).map((day, i) =>
            <div key={i}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: hover === i ? 'var(--a1)' : 'transparent', transition: 'background 0.15s' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', width: 28 }}>{day.d}</div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--a3)' }} />
              <div style={{ fontSize: 12, color: 'var(--ink)', flex: 1 }}>{day.l}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-muted)' }}>{day.c}</div>
            </div>
          )}
        </div>
      </div>

      {/* right: map + details */}
      <div style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', background: 'linear-gradient(160deg, var(--a1), #fff)', borderRadius: 14, height: 150, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 14 }}>
          {/* stylized map */}
          <svg viewBox="0 0 240 150" width="100%" height="100%">
            <defs>
              <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.7" fill="var(--ink)" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="240" height="150" fill="url(#dots)" />
            <path d="M0,100 Q40,80 80,95 T160,80 T240,90" stroke="var(--a3)" strokeWidth="1.2" fill="none" opacity="0.5" strokeDasharray="2 3" />
            <path d="M20,60 Q70,50 120,70 T220,50" stroke="var(--a2)" strokeWidth="1" fill="none" opacity="0.5" />
            {/* route */}
            <path d={
              variant === 0 ? "M60,100 C80,70 100,60 130,55 C160,50 180,70 195,85" :
                variant === 1 ? "M50,80 C80,60 120,65 150,70 C180,75 200,60 200,50" :
                  "M40,110 C60,90 90,70 120,60 C150,50 180,40 210,35 C195,60 180,80 160,100"
            } stroke="var(--a3)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {data.days.slice(0, 5).map((_, i) => {
              const pts = variant === 0 ? [[60, 100], [95, 75], [130, 55], [165, 60], [195, 85]] :
                variant === 1 ? [[50, 80], [90, 67], [130, 70], [170, 65], [200, 50]] :
                  [[40, 110], [85, 80], [130, 58], [180, 42], [210, 35]];
              const [x, y] = pts[i] || [0, 0];
              return <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#fff" stroke="var(--a3)" strokeWidth="1.5" />
                <text x={x} y={y + 1.5} fontSize="5" fontFamily="var(--mono)" textAnchor="middle" fill="var(--a3)" fontWeight="600">{i + 1}</text>
              </g>;
            })}
          </svg>
          <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-muted)', background: 'rgba(255,255,255,0.7)', padding: '3px 7px', borderRadius: 6 }}>
            <I.pin /> {data.dest}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          AI suggestions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {[
            { i: 'fork', t: 'Laxmi Misthan Bhandar thali', s: '+ ₹450 · Wed eve' },
            { i: 'star', t: 'Patrika Gate photo stop', s: '+ 1h · Thu am' },
            { i: 'spark', t: 'Block-printing workshop', s: '+ ₹1,200 · optional' }
          ].map((s, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--a1)', display: 'grid', placeItems: 'center', color: 'var(--a3)' }}>
                {s.i === 'fork' && <I.fork />}
                {s.i === 'star' && <I.star />}
                {s.i === 'spark' && <I.spark />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--ink)' }}>{s.t}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontFamily: 'var(--mono)' }}>{s.s}</div>
              </div>
              <I.plus style={{ color: 'var(--ink-muted)' }} />
            </div>
          )}
        </div>

        <button style={{ all: 'unset', cursor: 'pointer', marginTop: 14, padding: '10px', background: 'var(--a1)', color: 'var(--ink)', borderRadius: 'var(--radius-lg)', textAlign: 'center', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <I.spark /> Refine with AI
        </button>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero({ onPlan }) {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          filter: 'brightness(0.6)'
        }}
      />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <InlineNav onPlan={onPlan} />
      </div>

      <div className={styles.sectionContainer} style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ maxWidth: 800 }}>
          <h1 className={styles.heroHeadline} style={{ fontSize: 96, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 600, margin: 0, marginBottom: 24, color: '#ffffff', textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            Find your <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 400, color: 'var(--a1)' }}>Ecstacy</span>
          </h1>

          <p style={{ fontSize: 28, lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.9)', margin: '0 auto', marginBottom: 40, maxWidth: 700, fontWeight: 400, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            Smart trip planning made easy.
          </p>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onPlan} style={{ all: 'unset', cursor: 'pointer', padding: '18px 36px', background: 'var(--a1)', color: 'var(--ink)', borderRadius: 'var(--radius-lg)', fontSize: 20, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Plan my trip <I.spark />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- About section ---------- */
function Philosophy() {
  const features = ['India-first AI', 'Smart seasonal routing', 'Train-aware itineraries', 'Personalized trip planning'];
  const props = [
    'Built for Indian travel patterns',
    'AI-powered itineraries',
    'Real-time seasonal intelligence',
    'Early access launching soon'
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, amount: 0.2 }} 
      transition={{ duration: 0.8, ease: "easeOut" }} 
      className={styles.sectionContainer} 
      style={{ padding: '120px 72px', background: 'var(--page-bg)', overflow: 'hidden' }}
    >
      <div className={styles.responsiveGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center' }}>
        {/* Left: Content */}
        <div>
          <div className={styles.mono} style={{ marginBottom: 24 }}>{'{ about • altairgo }'}</div>
          <h2 className={styles.sectionHeadline} style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, marginBottom: 32 }}>
            Travel, re-imagined for the <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--a3)' }}>Indian</span> traveler.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0, marginBottom: 40, maxWidth: 540 }}>
            Altairgo is an AI-first travel planner designed for the way India actually travels — trains, monsoons, road trips, pilgrimages, weekend escapes, and spontaneous plans. Build smarter itineraries in minutes instead of spending days researching.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 56 }}>
            {features.map(f => (
              <div key={f} style={{ padding: '10px 20px', background: 'var(--a1)', color: 'var(--ink)', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink)' }} />
                {f}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {props.map(p => (
              <div key={p} style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--a1)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating Composition */}
        <div style={{ position: 'relative', height: 640 }} className={styles.hideMobile}>
          <ImageCard 
            img={philJaipur} loc="Jaipur, Rajasthan" sub="Cultural heritage trail" 
            style={{ top: 0, left: '15%', zIndex: 3 }} rotate={-4} 
          />
          <ImageCard 
            img={philKerala} loc="Kerala Backwaters" sub="Serene canal escape" 
            style={{ top: 120, right: 0, zIndex: 2 }} rotate={3} 
          />
          <ImageCard 
            img={philGoa} loc="Goa Coastline" sub="Golden sands & sun" 
            style={{ bottom: 120, left: 0, zIndex: 4 }} rotate={2} 
          />
          <ImageCard 
            img={philHimalayas} loc="Himalayan Peaks" sub="High altitude adventure" 
            style={{ bottom: 0, right: '15%', zIndex: 1 }} rotate={-2} 
          />
        </div>
      </div>
    </motion.section>
  );
}

function ImageCard({ img, loc, sub, style, rotate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotate: rotate + 2, zIndex: 20, transition: { duration: 0.2 } }}
      style={{
        position: 'absolute',
        width: 280,
        background: 'var(--card)',
        padding: '12px 12px 16px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--line)',
        cursor: 'pointer',
        ...style
      }}
    >
      <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: 180, marginBottom: 14 }}>
        <img src={img} alt={loc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{loc}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', letterSpacing: '0.02em' }}>{sub}</div>
      </div>
    </motion.div>
  );
}

/* ---------- Destinations: sliding cards ---------- */
const DESTINATIONS = [
  { name: 'Goa Coastline', state: 'Goa', price: 22000, img: destGoa },
  { name: 'Kashmir Valleys', state: 'Jammu & Kashmir', price: 45000, img: destKashmir },
  { name: 'Thar Desert', state: 'Rajasthan', price: 28500, img: destRajasthan },
  { name: 'Backwaters', state: 'Kerala', price: 32000, img: destKerala },
  { name: 'Pine Forests', state: 'Himachal Pradesh', price: 26800, img: destHimachal },
  { name: 'Living Roots', state: 'Meghalaya', price: 34000, img: destMeghalaya }
];

function Destinations() {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ padding: '100px 0 100px', borderTop: '1px solid var(--line)', background: 'var(--page-bg)', overflow: 'hidden' }}>
      <div className={styles.sectionContainer} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 72px', marginBottom: 40 }}>
        <div>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 02 · destinations }'}</div>
          <h2 className={styles.sectionHeadline} style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 600 }}>
            Handpicked <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--a3)' }}>corners</span> of India
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => scroll(-1)} style={{ all: 'unset', cursor: 'pointer', width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}>
            <I.arrow style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button onClick={() => scroll(1)} style={{ all: 'unset', cursor: 'pointer', width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', color: 'var(--page-bg)', display: 'grid', placeItems: 'center' }}>
            <I.arrow />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className={`${styles.destinationsScroll} ${styles.sectionContainer}`} style={{ display: 'flex', gap: 24, padding: '0 72px 20px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        {DESTINATIONS.map((d, i) =>
          <motion.div key={i}
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            whileHover={{ scale: 1.01, boxShadow: 'var(--shadow-lg)' }}
            style={{
              flex: '0 0 380px', scrollSnapAlign: 'start',
              background: 'var(--card)',
              borderRadius: 'var(--radius-xl)', border: '1px solid var(--line)', 
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex', flexDirection: 'column'
            }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{d.name}</div>
                <div style={{ fontSize: 16, color: 'var(--ink-soft)', marginTop: 4 }}>{d.state}</div>
              </div>
            </div>

            {/* Image Container */}
            <div style={{ position: 'relative', height: 320, borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 24 }}>
              <img src={d.img} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Top Right Pill - Solid Background */}
              <div style={{ position: 'absolute', top: 16, right: 16, background: '#F6F1E6', color: '#2E2E2E', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-xs)' }}>
                <I.pin /> Open Trip
              </div>
              
              {/* Bottom Left Pill - Solid Background */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, background: '#F6F1E6', color: '#2E2E2E', padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-xs)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 5.5C7.38071 5.5 8.5 4.38071 8.5 3C8.5 1.61929 7.38071 0.5 6 0.5C4.61929 0.5 3.5 1.61929 3.5 3C3.5 4.38071 4.61929 5.5 6 5.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.5 11.5C10.5 9.01472 8.48528 7 6 7C3.51472 7 1.5 9.01472 1.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Private • Request based
              </div>
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--a3)' }}>₹{d.price.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>per person</div>
              </div>
              <button style={{ all: 'unset', cursor: 'pointer', background: 'var(--ink)', color: 'var(--card)', padding: '12px 24px', borderRadius: 'var(--radius-lg)', fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-soft)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--ink)'}>
                Plan a Trip <I.arrow />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

/* ---------- Blogs ---------- */
const BLOGS = [
  { cat: 'Travel guide', title: 'When to visit Ladakh: a month-by-month guide', date: 'Apr 12, 2026', read: '8 min', hue: 220 },
  { cat: 'Culture', title: 'The 12 Jyotirlingas — a circuit worth taking slowly', date: 'Apr 04, 2026', read: '12 min', hue: 32 },
  { cat: 'Food', title: 'Eating through Old Delhi in one monsoon afternoon', date: 'Mar 27, 2026', read: '6 min', hue: 150 }
];

function Blogs() {
  const navigate = useNavigate();
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ padding: '100px 72px', borderTop: '1px solid var(--line)', background: 'var(--card)' }} className={styles.sectionContainer}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
        <div>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 04 · journal }'}</div>
          <h2 style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 640 }} className={styles.sectionHeadline}>
            Stories from the <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--a3)' }}>road</span>
          </h2>
        </div>
        <button onClick={() => navigate('/blogs')} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, color: 'var(--ink)', padding: '10px 18px', border: '1px solid var(--line)', borderRadius: 'var(--radius-pill)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          All posts <I.arrow />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className={`${styles.responsiveGrid} ${styles.responsiveGrid3}`}>
        {BLOGS.map((b, i) =>
          <motion.article key={i}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: '0 20px 30px -18px rgba(60,30,15,0.2)' }}
            style={{ cursor: 'pointer', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', background: 'var(--card)' }}>
            <div style={{ height: 220, background: `linear-gradient(150deg, oklch(92% 0.06 ${b.hue}), oklch(82% 0.11 ${b.hue}))`, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
                <defs>
                  <pattern id={`bstr-${i}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                    <rect width="2" height="5" fill="#fff" opacity="0.25" />
                  </pattern>
                </defs>
                <rect width="400" height="220" fill={`url(#bstr-${i})`} />
              </svg>
              <div style={{ position: 'absolute', top: 14, left: 14, padding: '4px 10px', background: 'rgba(255,255,255,0.85)', borderRadius: 999, fontSize: 10.5, fontFamily: 'var(--mono)', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{b.cat}</div>
            </div>
            <div style={{ padding: '22px 22px 24px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.01em', margin: 0, marginBottom: 14 }}>{b.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)' }}>
                <span>{b.date}</span><span>{b.read} read</span>
              </div>
            </div>
          </motion.article>
        )}
      </div>
    </motion.section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const cols = [
    { h: 'Product', items: ['AI Itinerary', 'Destinations', 'Group planning', 'Mobile app'] },
    { h: 'Company', items: ['About us', 'Careers', 'Press', 'Contact', 'Partners'] },
    { h: 'Resources', items: ['Travel guides', 'Visa help', 'Blog', 'Community', 'Support'] },
    { h: 'Legal', items: ['Privacy', 'Terms', 'Refund policy', 'Cookie policy', 'GST details'] }
  ];

  return (
    <footer style={{ padding: '80px 72px 40px', background: 'var(--ink)', color: 'var(--page-bg)' }} className={styles.sectionContainer}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: 40, marginBottom: 60 }} className={`${styles.responsiveGrid} ${styles.footerGrid}`}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Logo onDark={true} />
          </div>
          <p style={{ fontSize: 13.5, opacity: 0.65, lineHeight: 1.65, maxWidth: 280, margin: 0, marginBottom: 24 }}>
            An AI trip planner, made in India, for travelers who want to spend less time planning and more time being there.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.6 }}>
            <div>hello@altairgo.in</div>
            <div>Bengaluru · Mumbai · Delhi</div>
          </div>
        </div>
        {cols.map((c, i) =>
          <div key={i}>
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: 18 }}>{c.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.items.map((it, j) =>
                <a key={j} style={{ fontSize: 13, opacity: 0.85, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>{it}</a>
              )}
            </div>
          </div>
        )}
      </div>
      <div style={{ paddingTop: 30, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontFamily: 'var(--mono)', opacity: 0.55 }}>
        <div>© 2026 Altairgo Intelligence Pvt. Ltd. · All rights reserved.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span>Made in 🇮🇳 with चाय</span>
          <span>v1.0 · 2026</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- How It Works (4-step process) ---------- */
function HowItWorks() {
  const steps = [
    { n: '01', t: 'Tell us your dream trip', d: 'Destination, days, style, budget — the AI reads shorthand and ordinary sentences.' },
    { n: '02', t: 'AI builds your itinerary', d: 'A day-by-day plan with real costs in ₹, live weather, and bookable experiences.' },
    { n: '03', t: 'Customize every detail', d: 'Swap hotels, stretch days, add a side trip — the trip editor rebuilds around you.' },
    { n: '04', t: 'Track, book, and go', d: 'One-tap bookings for flights, trains, stays. Offline-ready when you land.' }
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }} id="how" className={styles.sectionContainer} style={{ padding: '110px 72px', borderTop: '1px solid var(--line)', background: 'var(--page-bg)', position: 'relative' }}>
      <div style={{ textAlign: 'center', marginBottom: 70 }}>
        <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 02 · how it works }'}</div>
        <h2 className={styles.sectionHeadline} style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 760, marginInline: 'auto' }}>
          From idea to <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--a3)' }}>boarding pass</span> in four steps
        </h2>
      </div>

      <div className={styles.responsiveGrid4} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
        {/* connecting line */}
        <div style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 1, borderTop: '1px dashed var(--line)' }} />
        {steps.map((s, i) =>
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }} style={{ padding: '0 20px', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: i === 0 ? 'var(--ink)' : 'var(--card)',
                color: i === 0 ? 'var(--a2)' : 'var(--a3)',
                border: i === 0 ? 'none' : '1px solid var(--line)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 22, fontWeight: 400,
                boxShadow: '0 4px 16px -6px rgba(60,30,15,0.15)',
                position: 'relative', zIndex: 2
              }}>{s.n}</div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', margin: 0, marginBottom: 10, textAlign: 'center' }}>{s.t}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0, textAlign: 'center', maxWidth: 240, marginInline: 'auto' }}>{s.d}</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

/* ---------- Platform Capabilities ---------- */
function Capabilities() {
  const feats = [
    { icon: 'spark', t: 'AI Itinerary', d: 'Day-by-day trips generated in seconds. Shaped around your pace, budget, and quirks.' },
    { icon: 'rupee', t: 'Real Costs in ₹', d: 'Live rates for hotels, trains, and entry fees. No hidden conversion markup.' },
    { icon: 'calendar', t: 'Smart Booking', d: 'One-tap booking for flights, trains, stays, and experiences — IRCTC synced.' },
    { icon: 'cloud', t: 'Live Weather', d: 'Monsoon-aware planning. Rearranges your day when the forecast shifts.' },
    { icon: 'tag', t: 'Local Events', d: 'Festivals, melas, and pop-ups you would have missed. Auto-added if you say yes.' },
    { icon: 'edit', t: 'Trip Editor', d: 'Drag, swap, stretch. The itinerary rebuilds around every change in real time.' }
  ];

  const renderIcon = (k) => {
    const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (k) {
      case 'spark': return <svg {...common}><path d="M12 3l2 6l6 2l-6 2l-2 6l-2-6l-6-2l6-2z" /></svg>;
      case 'rupee': return <svg {...common}><path d="M7 5h10M7 9h10M9 5c3 0 5 2 5 4s-2 4-5 4h-2l6 6" /></svg>;
      case 'calendar': return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
      case 'cloud': return <svg {...common}><path d="M7 18a4 4 0 010-8a5 5 0 019.6-1.4A4 4 0 0117 18H7z" /></svg>;
      case 'tag': return <svg {...common}><path d="M20 12l-8 8l-9-9V3h8z" /><circle cx="8" cy="8" r="1.2" fill="currentColor" /></svg>;
      case 'edit': return <svg {...common}><path d="M4 20h4L20 8l-4-4L4 16z" /><path d="M14 6l4 4" /></svg>;
      default: return null;
    }
  };
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ padding: '110px 72px', borderTop: '1px solid var(--line)', background: 'var(--card)' }} className={styles.sectionContainer}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 04 · capabilities }'}</div>
          <h2 style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 640 }} className={styles.sectionHeadline}>
            Six <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--a3)' }}>superpowers</span>, one planner.
          </h2>
        </div>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
          Every trip gets the same intelligence — whether it's a 3-day Goa break or a 21-day Himalayan circuit.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 20, overflow: 'hidden' }} className={`${styles.responsiveGrid} ${styles.responsiveGrid3}`}>
        {feats.map((f, i) =>
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.95, y: 15 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            style={{ padding: '36px 32px', background: 'var(--card)', transition: 'background 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--a1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--a1)', color: 'var(--a3)', display: 'grid', placeItems: 'center', marginBottom: 22 }}>
              {renderIcon(f.icon)}
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', margin: 0, marginBottom: 10 }}>{f.t}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>{f.d}</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

/* ---------- Final CTA Banner ---------- */
function FinalCTA({ onPlan }) {
  const navigate = useNavigate();
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ padding: '0 24px 24px', background: 'var(--page-bg)' }}>
      <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', background: 'var(--card)', color: 'var(--ink)', textAlign: 'center', border: '1px solid var(--line)' }} className={styles.finalCtaBox}>
        {/* gradient wash */}
        <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <defs>
            <radialGradient id="ctag" cx="0.2" cy="0.8" r="0.7">
              <stop offset="0" stopColor="var(--a1)" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="var(--a1)" stopOpacity="0.2" />
              <stop offset="1" stopColor="var(--card)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ctag2" cx="0.85" cy="0.2" r="0.5">
              <stop offset="0" stopColor="var(--a2)" stopOpacity="0.2" />
              <stop offset="1" stopColor="var(--card)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="500" fill="url(#ctag)" />
          <rect width="1200" height="500" fill="url(#ctag2)" />
        </svg>

        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{'{ ready when you are }'}</div>
          <h2 style={{ fontSize: 72, lineHeight: 1.02, letterSpacing: '-0.035em', fontWeight: 500, margin: 0, marginBottom: 18 }}>
            Start planning <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--a3)' }}>for free</span>.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--ink-soft)', maxWidth: 560, marginInline: 'auto', lineHeight: 1.55, marginBottom: 40 }}>
            Join thousands of travellers who plan smarter. No credit card. No commitments. Just a plan, built for you.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button onClick={onPlan} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ all: 'unset', cursor: 'pointer', padding: '16px 28px', background: 'var(--ink)', color: 'var(--card)', borderRadius: 'var(--radius-lg)', fontSize: 15, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Plan my yatra free <I.arrow />
            </motion.button>
            <motion.button onClick={() => navigate('/discover')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ all: 'unset', cursor: 'pointer', padding: '16px 26px', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 'var(--radius-lg)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Explore destinations <I.arrow />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const handlePlan = () => {
    navigate('/planner');
  };

  return (
    <div className={styles.homeWrapper}>
      <Hero onPlan={handlePlan} />
      <Philosophy />
      <HowItWorks />
      <Destinations />
      <Capabilities />
      <Blogs />
      <FinalCTA onPlan={handlePlan} />
      <Footer />
    </div>
  );
}
