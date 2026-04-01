import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Sparkles, BrainCircuit, CreditCard, CloudSun, CalendarDays,
  Pencil, ArrowRight, CheckCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import DestinationCard from '../components/DestinationCard/DestinationCard.jsx';
import { getDestinations, getBlogs } from '../services/api.js';
import styles from './Home.module.css';
import blogStyles from '../components/Blogs/Blogs.module.css';

const FEATURES = [
  { icon: <BrainCircuit size={28} />, title: 'AI-Powered Engine', desc: 'Gemini 2.0 Flash generates personalized day-by-day itineraries in seconds with smart activity scheduling.' },
  { icon: <CreditCard size={28} />, title: 'Budget Intelligence', desc: 'Real-time cost estimates, tier-based budget splits, and automatic demotion logic ensure you never overspend.' },
  { icon: <MapPin size={28} />, title: 'Smart Booking', desc: 'Hotels, flights, activity tickets, restaurant reservations and airport transfers — all in one plan.' },
  { icon: <CloudSun size={28} />, title: 'Weather Alerts', desc: 'Rainy day alternatives automatically suggested. Never let bad weather ruin your plans.' },
  { icon: <CalendarDays size={28} />, title: 'Local Events', desc: 'Festivals, fairs, and local happenings integrated into your schedule. Experience culture, not just sights.' },
  { icon: <Pencil size={28} />, title: 'Trip Editor', desc: 'Add/remove activities, swap hotels, reorder days, and customize every detail of your itinerary.' },
];

const STEPS = [
  { num: '01', title: 'Pick a Destination', desc: 'Browse 200+ curated destinations or let AI recommend the perfect spot based on your style and budget.' },
  { num: '02', title: 'Set Your Preferences', desc: 'Choose dates, budget, number of travelers, dietary needs, and interests — takes under 2 minutes.' },
  { num: '03', title: 'AI Builds Your Plan', desc: 'Our engine generates a complete day-by-day itinerary with activities, hotels, real costs and schedules.' },
  { num: '04', title: 'Book Everything', desc: 'Approve hotel, flights, and activity bookings with one click. Track expenses and get day-of briefings.' },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progression = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progression * target));
      if (progression < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return count;
}

const Home = () => {
  const [destinations, setDestinations] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const carouselRef = useRef(null);

  const tripsCount = useCountUp(10000, 2000, statsVisible);
  const destsCount = useCountUp(200, 2000, statsVisible);
  const satisfactionCount = useCountUp(98, 1500, statsVisible);

  const scrollCarousel = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    const slide = el.querySelector(`.${styles.carouselSlide}`);
    const cardWidth = slide ? slide.offsetWidth + 20 : 336;
    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    getDestinations({ limit: 8 })
      .then((data) => setDestinations(Array.isArray(data) ? data : (data.destinations || [])))
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));

    getBlogs({ limit: 3 })
      .then((data) => setBlogs(Array.isArray(data) ? data : (data.blogs || [])))
      .catch(() => setBlogs([]))
      .finally(() => setBlogsLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ paddingTop: '70px' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={13} />
            AI-Powered Travel Planning
          </div>
          <h1 className={styles.heroTitle}>
            Explore Exotic<br />
            <span>Destinations</span> with AI
          </h1>
          <p className={styles.heroSubtitle}>
            Tell us where, when, and how much — our AI builds a complete day-by-day
            itinerary with hotel costs, activity schedules, and budget breakdowns in under 30 seconds.
          </p>
          <div className={styles.heroActions}>
            <Link to="/planner" className={styles.primaryBtn}>
              Plan My Trip Free <ArrowRight size={18} />
            </Link>
            <Link to="/discover" className={styles.secondaryBtn}>
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section ref={statsRef} className={styles.statsSection}>
        <div className={styles.statsContainer}>
          {[
            { value: tripsCount.toLocaleString() + '+', label: 'Trips Generated' },
            { value: destsCount + '+', label: 'Destinations' },
            { value: satisfactionCount + '%', label: 'Satisfaction Rate' },
          ].map((s, i) => (
            <div key={i} className={styles.statItem}>
              <h2>{s.value}</h2>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className={`${styles.sectionPadding} ${styles.lightBg}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Simple Process</span>
            <h2>How It Works</h2>
            <p>From idea to itinerary in four simple steps</p>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations (Swipe Carousel) ────────────────── */}
      <section className={`${styles.sectionPadding} ${styles.whiteBg}`}>
        <div className={styles.container}>
          <div className={styles.destinationsHeader}>
            <div>
              <span className={styles.sectionBadge}>Handpicked for You</span>
              <h2 className={styles.sectionTitle}>Popular Destinations</h2>
              <p className={styles.sectionSubtitle}>Discover India's most loved travel spots</p>
            </div>
            <Link to="/discover" className={styles.viewAllBtn}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Carousel bleeds to edges */}
        <div className={styles.carouselOuter}>
          <button
            className={`${styles.carouselBtn} ${styles.carouselPrev}`}
            onClick={() => scrollCarousel(-1)}
            aria-label="Previous destinations"
          >
            <ChevronLeft size={20} />
          </button>

          <div className={styles.carouselTrack} ref={carouselRef}>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className={`${styles.carouselSlide} ${styles.carouselSkeleton}`} />
                ))
              : destinations.map((dest) => (
                  <div key={dest.id} className={styles.carouselSlide}>
                    <DestinationCard dest={dest} variant="default" />
                  </div>
                ))
            }
          </div>

          <button
            className={`${styles.carouselBtn} ${styles.carouselNext}`}
            onClick={() => scrollCarousel(1)}
            aria-label="Next destinations"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className={`${styles.sectionPadding} ${styles.lightBg}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Platform Capabilities</span>
            <h2>Everything You Need</h2>
            <p>Powered by cutting-edge AI and real-world data</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.stepTitle}>{f.title}</h3>
                <p className={styles.stepDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Travel Stories ─────────────────────────────────── */}
      <section className={styles.blogsSection}>
        <div className={styles.container}>
          <div className={styles.destinationsHeader}>
            <div>
              <span className={styles.sectionBadge}>Travel Inspiration</span>
              <h2 className={styles.sectionTitle}>Latest Travel Stories</h2>
              <p className={styles.sectionSubtitle}>Insider guides and travel inspiration</p>
            </div>
            <Link to="/blogs" className={styles.viewAllBtn}>
              View All Blogs <ArrowRight size={16} />
            </Link>
          </div>

          {/* Use the same grid + card styles as the /blogs page */}
          <div className={blogStyles.grid} style={{ marginTop: '2.5rem' }}>
            {blogsLoading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className={blogStyles.card} style={{ minHeight: '340px' }}>
                    <div className={styles.skeletonPulse} style={{ height: '200px' }} />
                    <div style={{ padding: '1.5rem' }}>
                      <div className={styles.skeletonPulse} style={{ height: '12px', width: '40%', marginBottom: '1rem', borderRadius: '6px' }} />
                      <div className={styles.skeletonPulse} style={{ height: '18px', marginBottom: '0.5rem', borderRadius: '6px' }} />
                      <div className={styles.skeletonPulse} style={{ height: '18px', width: '70%', borderRadius: '6px' }} />
                    </div>
                  </div>
                ))
              : blogs.length > 0
                ? blogs.slice(0, 3).map((blog) => (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.id}`}
                      className={blogStyles.card}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className={blogStyles.imageContainer}>
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className={blogStyles.image}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        {blog.category && <span className={blogStyles.category}>{blog.category}</span>}
                      </div>
                      <div className={blogStyles.content}>
                        <div className={blogStyles.meta}>
                          <span>{blog.date}</span>
                          <span>•</span>
                          <span>{blog.readTime}</span>
                        </div>
                        <h3 className={blogStyles.title}>{blog.title}</h3>
                        <p className={blogStyles.excerpt}>{blog.excerpt}</p>
                        <span className={blogStyles.readMore}>
                          Read Article <span>→</span>
                        </span>
                      </div>
                    </Link>
                  ))
                : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                      No travel stories yet. Check back soon!
                    </div>
                  )
            }
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(101,163,13,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(74,222,128,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Start Planning for Free
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Join 10,000+ travelers who plan smarter with AltairGO. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/planner" className={styles.primaryBtn} style={{ background: '#4ade80', color: '#0f172a' }}>
              <Sparkles size={18} /> Generate My Itinerary
            </Link>
            <Link to="/register" className={styles.secondaryBtn}>
              Create Free Account
            </Link>
          </div>
          <div className={styles.ctaBadge}>
            {['No credit card', 'AI-powered', '200+ destinations', 'Free forever'].map((t) => (
              <div key={t} className={styles.ctaBadgeItem}>
                <CheckCircle size={14} color="#4ade80" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
