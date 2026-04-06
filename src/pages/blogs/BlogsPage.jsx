import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../components/Blogs/Blogs.module.css';
import { getBlogs } from '../../services/api';
import { BlogCardSkeleton } from '../../components/Skeleton/Skeleton';

const BlogsPage = () => {
  const navigate = useNavigate();
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getBlogs()
      .then(data => setBlogsData(Array.isArray(data) ? data : (data.blogs || [])))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.section} style={{ paddingTop: '8rem' }}>
      <div className={styles.container}>
        <div className={styles.header} style={{ marginBottom: '3rem' }}>
          <h2 className={styles.heading}>All Travel Stories</h2>
          <p className={styles.subheading}>Explore our complete collection of travel guides and tips.</p>
        </div>

        <div className={styles.grid}>
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <BlogCardSkeleton key={i} />)
          ) : blogsData.length > 0 ? blogsData.map((blog) => (
            <article key={blog.id} className={styles.card} onClick={() => navigate(`/blogs/${blog.id}`)} style={{ cursor: 'pointer' }}>
              <div className={styles.imageContainer}>
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className={styles.image}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
                {blog.category && <span className={styles.category}>{blog.category}</span>}
              </div>
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 className={styles.title}>{blog.title}</h3>
                <p className={styles.excerpt}>{blog.excerpt}</p>
                <Link to={`/blogs/${blog.id}`} className={styles.readMore} onClick={(e) => e.stopPropagation()}>
                  Read Article <span>→</span>
                </Link>
              </div>
            </article>
          )) : fetchError ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Could not load blog posts. Please try again later.
            </div>
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No blog posts found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogsPage;
