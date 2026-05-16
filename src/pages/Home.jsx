import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';
import logoUrl from '../assets/logo.png';
import heroBg from '../assets/hero-bg.jpg';
import philJaipur from '../assets/phil-jaipur.png';
import philKerala from '../assets/phil-kerala.png';
import philGoa from '../assets/phil-goa.png';
import philHimalayas from '../assets/phil-himalayas.png';
import destGoa from '../assets/dest-goa.png';
import destKashmir from '../assets/dest-kashmir.png';
import destKashmir2 from '../assets/dest-kashmir-2.png';
import destRajasthan from '../assets/dest-rajasthan.png';
import destKerala from '../assets/dest-kerala.png';
import destHimachal from '../assets/dest-himachal.png';
import destMeghalaya from '../assets/dest-meghalaya.png';
import journalJaipur from '../assets/journal_jaipur.png';
import journalKerala from '../assets/journal_kerala.png';
import journalHimachal from '../assets/journal_himachal.png';
import journalMumbai from '../assets/journal_mumbai.png';
import journalVaranasi from '../assets/journal_varanasi.png';
import journalMeghalaya from '../assets/journal_meghalaya.png';
import footerBg from '../assets/footer-bg.png';

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

        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.01em' }}>
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
    <div style={{ position: 'relative', minHeight: 700, overflow: 'hidden' }}>
      <Wash intensity={intensity} />

      <div className={`${styles.responsiveGrid} ${styles.heroContainer} ${styles.sectionContainer}`} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        {/* Left: headline — staggered children */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0 }} style={{ marginBottom: 18 }}>
            <span className={styles.mono} style={{ letterSpacing: '0.05em' }}>{'{ ai · trip · planner }'}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className={styles.heroHeadline}
            style={{ fontFamily: 'var(--serif)', fontSize: 64, lineHeight: 1.08, letterSpacing: 0, fontWeight: 500, margin: 0, marginBottom: 22, color: 'var(--ink)' }}
          >
            {parts[0]}
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--a3)' }}>{headlineItalic}</span>
            {parts[1] || ''}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
            style={{ fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-soft)', maxWidth: 460, margin: 0, marginBottom: 32 }}
          >
            An AI trip planner for travelers who don't want cookie-cutter tours — tell it the shape of your trip and it builds the rest, from flights to dinner reservations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.36 }}
            className={styles.heroActions} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <button onClick={onPlan} style={{ all: 'unset', cursor: 'pointer', padding: '14px 24px', background: 'var(--a3)', color: 'var(--card)', borderRadius: 12, fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 0 1px var(--a3)', transition: 'transform 0.18s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
              Plan my trip free <I.arrow />
            </button>
            <button onClick={() => navigate('/discover')} style={{ all: 'unset', cursor: 'pointer', padding: '14px 22px', border: '1px solid var(--line-warm)', borderRadius: 12, fontSize: 14, fontWeight: 500, background: 'var(--card)', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink)', transition: 'transform 0.18s ease' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
              Explore destinations <I.arrow />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 40, fontSize: 12, color: 'var(--ink-muted)' }}
          >
            <div style={{ display: 'flex', gap: 1, color: 'var(--a3)' }}>
              {[0, 1, 2, 3, 4].map((i) => <I.star key={i} />)}
            </div>
            <span style={{ fontFamily: 'var(--mono)' }}>4.9 · 10,000+ trips planned</span>
          </motion.div>
        </div>

        {/* Right: product card */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 2, delay: 0.18, ease: [0.16, 1, 0.3, 1] }} style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <ItineraryCard variant={cardVariant} onCycle={() => setCardVariant((cardVariant + 1) % 3)} />
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
    <section className={styles.sectionContainer} style={{ paddingBlock: '100px', borderTop: '1px solid var(--line)', background: 'var(--page-bg)' }}>
      <div className={styles.responsiveGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ about · altairgo }'}</div>
          <h2 className={styles.sectionHeadline} style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0 }}>
            Travel, re-imagined for the <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a3)' }}>Indian</span> traveler.
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)', margin: 0, marginBottom: 40 }}>
            Altairgo Intelligence is an AI-first trip planner built from the ground up for India — its seasons, its trains, its monsoons, its festivals, and the way we actually travel. Whether it's a long weekend in Goa, a pilgrimage to Badrinath, or a 14-day Rajasthan circuit, we plan it in minutes instead of weeks.
          </p>
          <div className={styles.responsiveGrid4} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, paddingTop: 32, borderTop: '1px dashed var(--line)' }}>
            {stats.map((s, i) =>
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 44, fontStyle: 'italic', color: 'var(--a3)', lineHeight: 1 }}>{s.k}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 6 }}>{s.v}</div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
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
    <section style={{ paddingBlock: '100px', borderTop: '1px solid var(--line)', background: 'var(--card)', overflow: 'hidden' }} className={styles.sectionContainer}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 0', marginBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 02 · destinations }'}</div>
          <h2 className={styles.sectionHeadline} style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 600 }}>
            Handpicked <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a3)' }}>corners</span> of India
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => scroll(-1)} style={{ all: 'unset', cursor: 'pointer', width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}>
            <I.arrow style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button onClick={() => scroll(1)} style={{ all: 'unset', cursor: 'pointer', width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', color: 'var(--page-bg)', display: 'grid', placeItems: 'center' }}>
            <I.arrow />
          </button>
        </motion.div>
      </div>
      <div ref={scrollRef} className={styles.destinationsScroll} style={{ display: 'flex', gap: 20, padding: '0 0 4px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
    </section>
  );
}

/* ---------- Explore Journeys ---------- */
const JOURNEYS = [
  { 
    loc: 'Jaipur, Rajasthan', 
    title: '48 Hours in Jaipur with AI Planning', 
    img: journalJaipur 
  },
  { 
    loc: 'Kerala', 
    title: 'How to Plan a Monsoon Roadtrip in Kerala', 
    img: journalKerala 
  },
  { 
    loc: 'Himachal Pradesh', 
    title: 'Smart Budget Travel Across Himachal', 
    img: journalHimachal 
  },
  { 
    loc: 'Mumbai, Maharashtra', 
    title: 'Weekend Escapes from Mumbai', 
    img: journalMumbai 
  },
  { 
    loc: 'Varanasi, UP', 
    title: 'AI-Curated Spiritual Trails in Varanasi', 
    img: journalVaranasi 
  },
  { 
    loc: 'Meghalaya', 
    title: 'Chasing Waterfalls in Meghalaya', 
    img: journalMeghalaya 
  }
];

function ExploreJourneys() {
  return (
    <section style={{ paddingBlock: '100px', borderTop: '1px solid var(--line)', background: 'var(--card)' }} className={styles.sectionContainer}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 04 · journal }'}</div>
          <h2 style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 640 }} className={styles.sectionHeadline}>
            Stories from the <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a3)' }}>road</span>
          </h2>
        </motion.div>
        <motion.button initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} onClick={() => navigate('/blogs')} style={{ all: 'unset', cursor: 'pointer', fontSize: 13, color: 'var(--ink)', padding: '10px 18px', border: '1px solid var(--line)', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          All posts <I.arrow />
        </motion.button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className={`${styles.responsiveGrid} ${styles.responsiveGrid3}`}>
        {JOURNEYS.map((j, i) =>
          <motion.article key={i}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
            style={{ 
              cursor: 'pointer', 
              background: 'var(--card)', 
              borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden', 
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
            <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
              <motion.img 
                src={j.img} 
                alt={j.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>{j.loc}</div>
              <h3 style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.01em', margin: 0, color: 'var(--ink)' }}>{j.title}</h3>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--page-bg)', display: 'grid', placeItems: 'center', color: 'var(--ink)', border: '1px solid var(--line)', transition: 'background 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--a1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--page-bg)'; }}>
                  <I.arrow />
                </div>
              </div>
            </div>
          </motion.article>
        )}
      </div>
    </section>);
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
    <section id="how" className={styles.sectionContainer} style={{ paddingBlock: '110px', borderTop: '1px solid var(--line)', background: 'var(--page-bg)', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: 70 }}
      >
        <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 02 · how it works }'}</div>
        <h2 className={styles.sectionHeadline} style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 760, marginInline: 'auto' }}>
          From idea to <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a3)' }}>boarding pass</span> in four steps
        </h2>
      </motion.div>

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
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, fontWeight: 400,
                boxShadow: '0 4px 16px -6px rgba(60,30,15,0.15)',
                position: 'relative', zIndex: 2
              }}>{s.n}</div>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', margin: 0, marginBottom: 10, textAlign: 'center' }}>{s.t}</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0, textAlign: 'center', maxWidth: 240, marginInline: 'auto' }}>{s.d}</p>
          </motion.div>
        )}
      </div>
    </section>);
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
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ paddingBlock: '110px', borderTop: '1px solid var(--line)', background: 'var(--card)' }} className={styles.sectionContainer}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 04 · capabilities }'}</div>
          <h2 style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 640 }} className={styles.sectionHeadline}>
            Six <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a3)' }}>superpowers</span>, one planner.
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

/* ---------- Packages ---------- */
const PACKAGES = [
  {
    name: 'Wanderer',
    price: 0,
    period: 'forever',
    tag: 'Free',
    desc: 'Everything you need to plan your first trip — no credit card, no catch.',
    feats: ['3 AI itineraries / month', 'Day-by-day planner', 'Budget estimator', 'PDF export'],
    primary: false,
    cta: 'Start free'
  },
  {
    name: 'Explorer',
    price: 499,
    period: 'per month',
    tag: 'Most loved',
    desc: 'Unlimited trips, real-time bookings, and the full AltairGO intelligence stack.',
    feats: ['Unlimited itineraries', 'One-tap bookings', 'Live weather rerouting', 'Smart budget tracking', 'Priority AI queue', 'Trip sharing'],
    primary: true,
    cta: 'Choose Explorer'
  }
];

function Packages() {
  const navigate = useNavigate();
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ paddingBlock: '110px', borderTop: '1px solid var(--line)', background: 'var(--page-bg)' }}
      className={styles.sectionContainer}
    >
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className={styles.mono} style={{ marginBottom: 16 }}>{'{ 05 · pricing }'}</div>
        <h2 className={styles.sectionHeadline} style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, margin: 0, maxWidth: 640, marginInline: 'auto' }}>
          Simple plans, <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a3)' }}>no surprises.</span>
        </h2>
      </div>

      <div className={styles.pkgGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 820, marginInline: 'auto' }}>
        {PACKAGES.map((pkg) => (
          <motion.div
            key={pkg.name}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.22 }}
            style={{
              borderRadius: 20,
              padding: '40px 36px',
              background: pkg.primary ? 'var(--ink)' : 'var(--card)',
              color: pkg.primary ? 'var(--card)' : 'var(--ink)',
              border: pkg.primary ? 'none' : '1px solid var(--line-warm)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* background glow for primary */}
            {pkg.primary && (
              <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <defs>
                  <radialGradient id="pkgg" cx="0.5" cy="1" r="0.8">
                    <stop offset="0" stopColor="var(--a3)" stopOpacity="0.22" />
                    <stop offset="1" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="400" height="300" fill="url(#pkgg)" />
              </svg>
            )}

            <div style={{ position: 'relative' }}>
              {/* tag */}
              <span style={{
                display: 'inline-block', marginBottom: 24,
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                background: pkg.primary ? 'var(--a3)' : 'var(--a1)',
                color: pkg.primary ? 'var(--card)' : 'var(--a3)',
                fontFamily: 'var(--mono)'
              }}>{pkg.tag}</span>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 4 }}>{pkg.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {pkg.price === 0 ? 'Free' : `₹${pkg.price}`}
                  </span>
                  {pkg.price > 0 && (
                    <span style={{ fontSize: 13, opacity: 0.55 }}>/ {pkg.period}</span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.6, opacity: 0.7, marginBottom: 28, margin: '0 0 28px' }}>{pkg.desc}</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pkg.feats.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6.5" stroke={pkg.primary ? 'var(--a2)' : 'var(--a3)'} strokeOpacity="0.5" />
                      <path d="M4 7l2 2 4-4" stroke={pkg.primary ? 'var(--a2)' : 'var(--a3)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ opacity: 0.85 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/planner')}
                style={{
                  all: 'unset', cursor: 'pointer', width: '100%', textAlign: 'center',
                  padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                  background: pkg.primary ? 'var(--a2)' : 'var(--ink)',
                  color: 'var(--card)',
                  boxSizing: 'border-box',
                  transition: 'opacity 0.18s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {pkg.cta}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------- Final CTA Banner ---------- */
function FinalCTA({ onPlan }) {
  const navigate = useNavigate();
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ padding: '0 24px 24px', background: 'var(--page-bg)' }}>
      <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', background: 'var(--ink)', color: 'var(--card)', textAlign: 'center' }} className={styles.finalCtaBox}>
        {/* terracotta radial glow + grid */}
        <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <defs>
            <radialGradient id="ctag1" cx="0.5" cy="1.1" r="0.7">
              <stop offset="0" stopColor="#5ac576" stopOpacity="0.28" />
              <stop offset="0.55" stopColor="#8dd9a0" stopOpacity="0.1" />
              <stop offset="1" stopColor="#141413" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ctag2" cx="0.18" cy="0.85" r="0.45">
              <stop offset="0" stopColor="#5ac576" stopOpacity="0.15" />
              <stop offset="1" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ctag3" cx="0.82" cy="0.85" r="0.4">
              <stop offset="0" stopColor="#5ac576" stopOpacity="0.12" />
              <stop offset="1" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <pattern id="ctaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" stroke="white" strokeOpacity="0.04" fill="none" />
            </pattern>
          </defs>
          <rect width="1200" height="500" fill="url(#ctag1)" />
          <rect width="1200" height="500" fill="url(#ctag2)" />
          <rect width="1200" height="500" fill="url(#ctag3)" />
          <rect width="1200" height="500" fill="url(#ctaGrid)" />
        </svg>

        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'rgba(250,249,245,0.45)', marginBottom: 20, letterSpacing: '0.06em' }}>{'{ ready when you are }'}</div>
          <h2 className={styles.ctaHeadline} style={{ lineHeight: 1.02, letterSpacing: '-0.035em', fontWeight: 500, margin: 0, marginBottom: 18, color: 'var(--card)' }}>
            Start planning <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--a2)' }}>for free</span>.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(250,249,245,0.6)', maxWidth: 520, marginInline: 'auto', lineHeight: 1.6, marginBottom: 40 }}>
            Join thousands of travellers who plan smarter. No credit card. No commitments. Just a plan, built for you.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <motion.button onClick={onPlan} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ all: 'unset', cursor: 'pointer', padding: '16px 28px', background: 'var(--a2)', color: 'var(--ink)', borderRadius: 999, fontSize: 15, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 0 0 1px var(--a2)' }}>
              Plan my trip <I.arrow />
            </motion.button>
            <motion.button onClick={() => navigate('/discover')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ all: 'unset', cursor: 'pointer', padding: '16px 26px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.04)', borderRadius: 999, fontSize: 15, fontWeight: 500, color: 'rgba(250,249,245,0.85)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Explore destinations <I.arrow />
            </motion.button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(250,249,245,0.35)', letterSpacing: '0.04em' }}>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>4.9 ★</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>28 states</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>made in India</span>
          </div>
        </div>
      </div>
    </footer>
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
      <Packages />
      <Blogs />
      <FinalCTA onPlan={handlePlan} />
    </div>
  );
}
