import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, BrainCircuit, CreditCard, CloudSun, CalendarDays, Pencil, ArrowRight, Star, CheckCircle } from 'lucide-react';
import DestinationCard from '../components/DestinationCard/DestinationCard.jsx';
import { getDestinations, getBlogs } from '../services/api.js';
import styles from './Home.module.css';

const getCardVariant = (index) => {
  const i = index % 10;
  if (i === 0) return 'large';
  if (i === 3 || i === 7) return 'tall';
  if (i === 4 || i === 8) return 'wide';
  return 'default';
};

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

  const tripsCount = useCountUp(10000, 2000, statsVisible);
  const destsCount = useCountUp(200, 2000, statsVisible);
  const satisfactionCount = useCountUp(98, 1500, statsVisible);

  useEffect(() => {
    getDestinations({ limit: 6 })
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
      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Explore Exotic<br />
            <span>Destinations</span> with AI
          </h1>

          <p className={styles.heroSubtitle}>
            Tell us where, when, and how much — our AI builds a complete day-by-day itinerary with hotel costs, activity schedules, and budget breakdowns in under 30 seconds.
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

      {/* Stats */}
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

      {/* How It Works */}
      <section className={`${styles.sectionPadding} ${styles.lightBg}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
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

      {/* Features */}
      <section className={`${styles.sectionPadding} ${styles.whiteBg}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Everything You Need</h2>
            <p>Powered by cutting-edge AI and real-world data</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {f.icon}
                </div>
                <h3 className={styles.stepTitle}>{f.title}</h3>
                <p className={styles.stepDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className={`${styles.sectionPadding} ${styles.lightBg}`}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className={styles.destinationsHeader}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Popular Destinations
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Handpicked spots loved by travelers</p>
            </div>
            <Link to="/discover" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid #e2e8f0', padding: '0.6rem 1.25rem', borderRadius: '50px', background: 'white' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className={styles.destinationsGrid}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} style={{
                  background: '#e2e8f0',
                  borderRadius: '24px',
                  minHeight: '280px',
                  position: 'relative',
                  overflow: 'hidden',
                  gridColumn: window.innerWidth > 768 && i === 0 ? 'span 2' : 'span 1',
                  gridRow: window.innerWidth > 768 && i === 0 ? 'span 2' : 'span 1',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 1.5s infinite', transform: 'translateX(-100%)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.destinationsGrid}>
              {destinations.map((dest, i) => (
                <DestinationCard key={dest.id} dest={dest} variant={getCardVariant(i)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Blogs */}
      <section className={styles.blogsSection}>
        <div className={styles.container}>
          <div className={styles.destinationsHeader}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Latest Travel Stories
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Insider guides and travel inspiration</p>
            </div>
            <Link to="/blogs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid #e2e8f0', padding: '0.6rem 1.25rem', borderRadius: '50px', background: 'white' }}>
              View All Blogs <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.blogsGrid}>
            {blogsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={styles.blogCard} style={{ height: '400px', background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 1.5s infinite', transform: 'translateX(-100%)' }} />
                </div>
              ))
            ) : blogs.length > 0 ? (
              blogs.map((blog) => (
                <article key={blog.id} className={styles.blogCard}>
                  <div className={styles.blogImageContainer}>
                    {blog.image && <img src={blog.image} alt={blog.title} className={styles.blogImage} />}
                    {blog.category && <span className={styles.blogCategory}>{blog.category}</span>}
                  </div>
                  <div className={styles.blogBody}>
                    <div className={styles.blogMeta}>
                      <span>{blog.date}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <h3 className={styles.blogTitle}>{blog.title}</h3>
                    <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                    <Link to={`/blogs/${blog.id}`} className={styles.blogLink}>
                      Read Full Story <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                No travel stories found.
              </div>
            )}
          </div>
        </div>
      </section>


      {/* CTA Banner */}
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
            <Link to="/planner" className={`${styles.primaryBtn} ${styles.ctaPrimary}`} style={{ background: '#4ade80' }}>
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
