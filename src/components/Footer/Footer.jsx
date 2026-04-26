import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../../assets/logo.png';

const Footer = () => {
  const cols = [
    { h: 'Product', items: ['AI Itinerary', 'Destinations', 'Group planning', 'Mobile app'] },
    { h: 'Company', items: ['About us', 'Careers', 'Press', 'Contact', 'Partners'] },
    { h: 'Resources', items: ['Travel guides', 'Visa help', 'Blog', 'Community', 'Support'] },
    { h: 'Legal', items: ['Privacy', 'Terms', 'Refund policy', 'Cookie policy', 'GST details'] }
  ];

  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <img src={logo} alt="ALTAIRGO" className={styles.footerLogo} />
            </div>
            <p className={styles.brandDesc}>
              An AI trip planner, made in India, for travelers who want to spend less time planning and more time being there.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.email}>hello@altairgo.in</div>
              <div className={styles.locations}>Bengaluru · Mumbai · Delhi</div>
            </div>
          </div>

          {cols.map((c, i) => (
            <div key={i} className={styles.linksCol}>
              <div className={styles.colTitle}>{c.h}</div>
              <div className={styles.linksList}>
                {c.items.map((it, j) => (
                  <a key={j} className={styles.footerLink}>{it}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>© 2026 Altairgo Intelligence Pvt. Ltd. · All rights reserved.</div>
          <div className={styles.vCredit}>
            <span>Made in 🇮🇳 with चाय</span>
            <span>v1.0 · 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
