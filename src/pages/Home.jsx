import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Sparkles, BrainCircuit, CreditCard, CloudSun, CalendarDays,
  Pencil, ArrowRight, CheckCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button, Card, Badge, Skeleton } from '../components/ui/index.js';
import { fadeUp, staggerContainer, viewportOnce } from '../design-system/animations.js';
import DestinationCard from '../components/DestinationCard/DestinationCard.jsx';
import { getDestinations, getBlogs } from '../services/api.js';
import blogStyles from '../components/Blogs/Blogs.module.css';

const FEATURES = [
  { icon: <BrainCircuit size={24} />, title: 'AI Itinerary', desc: 'Gemini 2.0 Flash generates personalized day-by-day itineraries in seconds.' },
  { icon: <CreditCard size={24} />, title: 'Real Costs', desc: 'Live hotel prices, tier-based splits, and auto-demotion so you never overspend.' },
  { icon: <MapPin size={24} />, title: 'Smart Booking', desc: 'Hotels, flights, activities and transfers — all in one seamless plan.' },
  { icon: <CloudSun size={24} />, title: 'Live Weather', desc: 'Rainy-day alternatives suggested automatically. Bad weather, great plan.' },
  { icon: <CalendarDays size={24} />, title: 'Local Events', desc: 'Festivals and local happenings woven into your schedule automatically.' },
  { icon: <Pencil size={24} />, title: 'Trip Editor', desc: 'Swap hotels, reorder days, add activities — full control over every detail.' },
];

const STEPS = [
  { num: '01', title: 'Tell Us Your Dream Trip', desc: 'Pick a destination, dates, budget, and travel style. Takes under 2 minutes.' },
  { num: '02', title: 'AI Builds Your Itinerary', desc: 'Our engine generates a complete day-by-day plan with activities, hotels, and real costs.' },
  { num: '03', title: 'Customise Every Detail', desc: 'Swap hotels, reorder days, add or remove activities with our live trip editor.' },
  { num: '04', title: 'Track, Book, and Go', desc: 'Approve bookings with one click and get day-of weather and crowd briefings.' },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
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
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  useEffect(() => {
    getDestinations({ limit: 8 })
      .then((d) => setDestinations(Array.isArray(d) ? d : (d.destinations || [])))
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));

    getBlogs({ limit: 3 })
      .then((d) => setBlogs(Array.isArray(d) ? d : (d.blogs || [])))
      .catch(() => setBlogs([]))
      .finally(() => setBlogsLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ paddingTop: 'var(--navbar-height, 64px)', overflowX: 'hidden' }}>

      {/* ── Hero ────────���────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #7C3AED 60%, #1E1B4B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--space-16) var(--space-6)',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(124,58,237,0.3)', pointerEvents: 'none' }} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 1 }}
        >
          <motion.div variants={fadeUp}>
            <Badge variant="info" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', marginBottom: 'var(--space-6)' }}>
              <Sparkles size={12} style={{ marginRight: '6px' }} /> AI-Powered Travel Planning
            </Badge>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 'var(--space-6)',
            letterSpacing: '-0.02em',
          }}>
            Plan Your Perfect<br />
            <span style={{ color: 'var(--color-accent-light)' }}>India Trip</span> with AI
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: 'var(--font-size-lg)',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '560px',
            margin: '0 auto var(--space-10)',
            lineHeight: 1.7,
          }}>
            AI-powered itineraries with real costs, real routes, and real India — generated in under 30 seconds.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/planner">
              <Button variant="secondary" size="lg" style={{ fontWeight: 700, minWidth: '200px' }}>
                Start Planning <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/discover">
              <Button variant="ghost" size="lg" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.35)', minWidth: '180px' }}>
                Explore Destinations
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 'var(--space-6)', justifyContent: 'center', marginTop: 'var(--space-10)', flexWrap: 'wrap' }}>
            {['No credit card', 'AI-powered', '200+ destinations', 'Free forever'].map((t) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: 'var(--font-size-sm)' }}>
                <CheckCircle size={14} /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ──────────────���──────────────────────────────────────── */}
      <section ref={statsRef} style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)', textAlign: 'center' }}>
          {[
            { value: tripsCount.toLocaleString() + '+', label: 'Trips Generated' },
            { value: destsCount + '+', label: 'Destinations' },
            { value: satisfactionCount + '%', label: 'Satisfaction Rate' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────��───────────────────── */}
      <section style={{ background: 'var(--color-bg)', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <motion.div variants={fadeUp}>
              <Badge variant="primary" size="sm" style={{ marginBottom: 'var(--space-4)' }}>Simple Process</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>
              From idea to full itinerary in four simple steps
            </motion.p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}
          >
            {STEPS.map((step) => (
              <motion.div key={step.num} variants={fadeUp}>
                <Card variant="default" padding="lg" style={{ height: '100%' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)',
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Popular Destinations (Carousel) ───────────────────────────── */}
      <section style={{ background: 'var(--color-bg-elevated)', padding: 'var(--space-20) 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <Badge variant="primary" size="sm" style={{ marginBottom: 'var(--space-3)' }}>Handpicked for You</Badge>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>Popular Destinations</h2>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Discover India's most loved travel spots</p>
            </div>
            <Link to="/discover" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => scrollCarousel(-1)} aria-label="Previous" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
            <ChevronLeft size={20} />
          </button>

          <div ref={carouselRef} style={{ display: 'flex', gap: 'var(--space-5)', overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '0 var(--space-6) var(--space-4)', scrollbarWidth: 'none' }}>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} style={{ minWidth: '300px', scrollSnapAlign: 'start', flexShrink: 0 }}>
                    <Skeleton height="220px" borderRadius="var(--radius-xl)" />
                    <div style={{ marginTop: 'var(--space-3)' }}><Skeleton height="1rem" width="60%" /><div style={{ marginTop: '6px' }}><Skeleton height="0.75rem" width="40%" /></div></div>
                  </div>
                ))
              : destinations.map((dest) => (
                  <div key={dest.id} style={{ minWidth: '300px', scrollSnapAlign: 'start', flexShrink: 0 }}>
                    <DestinationCard dest={dest} variant="default" />
                  </div>
                ))
            }
          </div>

          <button onClick={() => scrollCarousel(1)} aria-label="Next" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ── Features ──────────────────────────���───────────────────────── */}
      <section style={{ background: 'var(--color-bg)', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <motion.div variants={fadeUp}>
              <Badge variant="primary" size="sm" style={{ marginBottom: 'var(--space-4)' }}>Platform Capabilities</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-lg)' }}>
              Powered by cutting-edge AI and real-world data
            </motion.p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}
          >
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card variant="default" padding="lg" hover style={{ height: '100%' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>{f.title}</h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Latest Travel Stories ─────────────────��────────────────────── */}
      <section style={{ background: 'var(--color-bg-elevated)', padding: 'var(--space-20) var(--space-6)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
            <div>
              <Badge variant="primary" size="sm" style={{ marginBottom: 'var(--space-3)' }}>Travel Inspiration</Badge>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 var(--space-1)' }}>Latest Travel Stories</h2>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Insider guides and travel inspiration</p>
            </div>
            <Link to="/blogs" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
              View All Blogs <ArrowRight size={16} />
            </Link>
          </div>

          <div className={blogStyles.grid}>
            {blogsLoading
              ? Array(3).fill(0).map((_, i) => (
                  <Card key={i} variant="default" padding="none">
                    <Skeleton height="200px" borderRadius="var(--radius-xl) var(--radius-xl) 0 0" />
                    <div style={{ padding: 'var(--space-5)' }}>
                      <Skeleton height="0.75rem" width="40%" style={{ marginBottom: 'var(--space-3)' }} />
                      <Skeleton height="1.1rem" style={{ marginBottom: '6px' }} />
                      <Skeleton height="1.1rem" width="70%" />
                    </div>
                  </Card>
                ))
              : blogs.length > 0
                ? blogs.slice(0, 3).map((blog) => (
                    <Link key={blog.id} to={`/blogs/${blog.id}`} className={blogStyles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className={blogStyles.imageContainer}>
                        {blog.image && <img src={blog.image} alt={blog.title} className={blogStyles.image} onError={(e) => { e.target.style.display = 'none'; }} />}
                        {blog.category && <span className={blogStyles.category}>{blog.category}</span>}
                      </div>
                      <div className={blogStyles.content}>
                        <div className={blogStyles.meta}>
                          <span>{blog.date}</span><span>•</span><span>{blog.readTime}</span>
                        </div>
                        <h3 className={blogStyles.title}>{blog.title}</h3>
                        <p className={blogStyles.excerpt}>{blog.excerpt}</p>
                        <span className={blogStyles.readMore}>Read Article <span>→</span></span>
                      </div>
                    </Link>
                  ))
                : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
                      No travel stories yet. Check back soon!
                    </div>
                  )
            }
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────��────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #7C3AED 100%)',
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-40px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }} />

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: 'var(--space-4)' }}>
            Start Planning for Free
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-8)' }}>
            Join 10,000+ travellers who plan smarter with AltairGO. No credit card required.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/planner">
              <Button variant="secondary" size="lg" style={{ fontWeight: 700 }}>
                <Sparkles size={18} /> Generate My Itinerary
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="ghost" size="lg" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}>
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
