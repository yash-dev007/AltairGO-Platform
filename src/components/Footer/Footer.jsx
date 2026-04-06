import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Globe, Mail, Twitter } from 'lucide-react';
import styles from './Footer.module.css';
import logo from '../../assets/logo.png';

const noop = (e) => e.preventDefault();

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    setNewsletterMsg("You're subscribed!");
    setNewsletterEmail('');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brandLogo} onClick={() => window.scrollTo(0, 0)}>
              <img src={logo} alt="AltairGO Logo" className={styles.footerLogo} />
            </Link>
            <p className={styles.brandDesc}>
              AI-powered travel itineraries crafted for every traveler. Discover hidden gems,
              plan smart budgets, and explore the world intelligently. Your next adventure starts here.
            </p>
            <div className={styles.socials}>
              <a href="#" onClick={noop} className={styles.socialLink} aria-label="Website"><Globe size={16} /></a>
              <a href="#" onClick={noop} className={styles.socialLink} aria-label="Instagram"><Instagram size={16} /></a>
              <a href="#" onClick={noop} className={styles.socialLink} aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" onClick={noop} className={styles.socialLink} aria-label="Email"><Mail size={16} /></a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Explore</h3>
            <Link to="/discover">Destinations</Link>
            <Link to="/planner">Plan a Trip</Link>
            <Link to="/trips">My Trips</Link>
            <Link to="/blogs">Blogs</Link>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Support</h3>
            <a href="#" onClick={noop}>Help Center</a>
            <a href="#" onClick={noop}>Privacy Policy</a>
            <a href="#" onClick={noop}>Terms of Service</a>
            <a href="#" onClick={noop}>Contact Us</a>
          </div>
        </div>

        <div className={styles.newsletterSection}>
          <div className={styles.newsletterContent}>
            <h3 className={styles.newsletterTitle}>Unlock the World</h3>
            <p className={styles.newsletterDesc}>Get curated itineraries and travel secrets delivered to your inbox.</p>
          </div>
          <form className={styles.form} onSubmit={handleNewsletter}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.input}
                value={newsletterEmail}
                onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterMsg(''); }}
              />
              <button type="submit" className={styles.submitBtn}>Subscribe</button>
            </div>
            {newsletterMsg && <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: newsletterMsg.includes('valid') ? '#dc2626' : '#065f46' }}>{newsletterMsg}</p>}
          </form>
        </div>

        <div className={styles.bottomSection}>
          <p>© {new Date().getFullYear()} AltairGO. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <a href="#" onClick={noop}>Terms of Service</a>
            <a href="#" onClick={noop}>Privacy Policy</a>
            <a href="#" onClick={noop}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
