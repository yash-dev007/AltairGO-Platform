import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlog } from '../../services/api';
import { DetailPageSkeleton } from '../../components/Skeleton/Skeleton';
import BlogContent from '../../components/Blogs/BlogContent';

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setFetchError(false);
    getBlog(id)
      .then(data => setBlog(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <DetailPageSkeleton />;

  if (!blog || fetchError) {
    return (
      <div style={{ padding: '10rem 2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          {fetchError ? 'Could not load blog post' : 'Blog post not found'}
        </h2>
        <Link
          to="/blogs"
          style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '4rem' }}>
      <BlogContent blog={blog} />
    </div>
  );
};

export default BlogDetails;
