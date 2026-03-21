import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';
import styles from './BlogContent.module.css';

const BlogContent = ({ blog }) => {
  return (
    <article className={styles.wrapper}>
      {/* Back nav */}
      <div className={styles.backRow}>
        <Link to="/blogs" className={styles.backBtn}>
          <ArrowLeft size={16} />
          All Stories
        </Link>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className={styles.heroImage}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className={styles.heroFallback} />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          {blog.category && (
            <span className={styles.categoryBadge}>{blog.category}</span>
          )}
          <h1 className={styles.heroTitle}>{blog.title}</h1>
          <div className={styles.heroMeta}>
            {blog.author && (
              <span className={styles.metaItem}>
                <User size={14} />
                {blog.author}
              </span>
            )}
            {blog.date && (
              <span className={styles.metaItem}>
                <Calendar size={14} />
                {blog.date}
              </span>
            )}
            {blog.readTime && (
              <span className={styles.metaItem}>
                <Clock size={14} />
                {blog.readTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.contentWrapper}>
          {blog.excerpt && (
            <p className={styles.lead}>{blog.excerpt}</p>
          )}

          {blog.content ? (
            typeof blog.content === 'string' ? (
              <div
                className={styles.prose}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
              />
            ) : (
              <div className={styles.prose}>
                {Array.isArray(blog.content) ? (
                  blog.content.map((section, i) => (
                    <div key={i} className={styles.section}>
                      {section.heading && <h2 className={styles.sectionHeading}>{section.heading}</h2>}
                      {section.text && <p>{section.text}</p>}
                      {section.image && (
                        <img
                          src={section.image}
                          alt={section.heading || ''}
                          className={styles.sectionImage}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  ))
                ) : null}
              </div>
            )
          ) : null}

          {blog.tags && blog.tags.length > 0 && (
            <div className={styles.tags}>
              <Tag size={14} className={styles.tagIcon} />
              {blog.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogContent;
