import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import styles from './DestinationCard.module.css';

const DestinationCard = ({ dest, variant = 'default' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClass = styles[`card_${variant}`] || '';
  const imgSrc = dest.image_url || dest.image || null;

  return (
    <Link to={`/destination/${dest.id}`} className={`${styles.card} ${sizeClass}`}>
      {!imageLoaded && !imageError && (
        <div className={styles.skeleton} style={{ position: 'absolute', inset: 0, zIndex: 2, borderRadius: '24px' }} />
      )}

      {imgSrc && !imageError ? (
        <img
          src={imgSrc}
          alt={dest.name}
          className={styles.image}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
      ) : (
        <div className={styles.gradientBg} />
      )}

      <div className={styles.overlay}>
        <div className={styles.headerInfo}>
          {dest.crowd_level && <div className={styles.tag}>{dest.crowd_level}</div>}
          {dest.budget_category && <div className={styles.tag}>{dest.budget_category}</div>}
          {dest.estimated_cost_per_day && (
            <div className={`${styles.tag} ${styles.priceTag}`}>
              ₹{Number(dest.estimated_cost_per_day).toLocaleString('en-IN')}/day
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.location}>
            <MapPin size={14} />
            <span>{dest.state_name || dest.location || dest.country_name || ''}</span>
          </div>
          <h3 className={styles.name}>{dest.name}</h3>
          <p className={styles.description}>{dest.description || dest.desc || ''}</p>
          <div className={styles.cardFooter}>
            <div className={styles.rating}>
              <Star size={14} fill="#fbbf24" stroke="none" />
              <span>{dest.rating ? Number(dest.rating).toFixed(1) : 'New'}</span>
            </div>
            <div className={styles.arrow}>
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
