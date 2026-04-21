import React from 'react';
import { TrendingUp } from 'lucide-react';

const REVIEW_TAGS = ['great-value', 'well-paced', 'hidden-gems', 'family-friendly', 'romantic', 'adventure', 'foodie', 'budget-friendly'];
const RATING_LABELS = ['', 'Disappointing', 'Below average', 'Average', 'Good', 'Excellent'];

export default function SummaryTab({
  tripSummary,
  existingReview,
  reviewForm,
  submittingReview,
  onChangeRating,
  onToggleTag,
  onChangeComment,
  onSubmitReview,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Post-trip summary */}
      {tripSummary ? (
        <>
          {/* Spend overview */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem', fontSize: '1rem' }}>Trip Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Days', value: tripSummary.num_days },
                { label: 'Activities', value: tripSummary.total_activities },
                { label: 'Planned Budget', value: tripSummary.planned_budget ? `₹${Number(tripSummary.planned_budget).toLocaleString('en-IN')}` : '—' },
                { label: 'Actual Spend', value: tripSummary.actual_spend ? `₹${Number(tripSummary.actual_spend).toLocaleString('en-IN')}` : '—' },
              ].map((m, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{m.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{m.value ?? '—'}</div>
                </div>
              ))}
            </div>

            {tripSummary.highlights?.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Highlights</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tripSummary.highlights.map((h, i) => (
                    <span key={i} style={{ background: '#E8F8F2', color: '#088A52', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {typeof h === 'string' ? h : h.name || JSON.stringify(h)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tripSummary.top_activity_types?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', marginBottom: '0.5rem' }}>What you loved doing</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tripSummary.top_activity_types.map((t, i) => (
                    <span key={i} style={{ background: '#f0f9ff', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Smart insights from summary */}
          {tripSummary.smart_insights?.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', fontSize: '1rem' }}>Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tripSummary.smart_insights.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>•</span>
                    {typeof s === 'string' ? s : s.text || JSON.stringify(s)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <TrendingUp size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p style={{ fontSize: '0.9rem' }}>Summary will be available after your trip ends.</p>
        </div>
      )}

      {/* Review form */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>
          {existingReview ? 'Your Review' : 'Rate This Trip'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          {existingReview ? 'Update your review below.' : 'Share your experience to help improve future recommendations.'}
        </p>

        <form onSubmit={onSubmitReview}>
          {/* Star rating */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChangeRating(n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '1.8rem', lineHeight: 1, color: n <= reviewForm.rating ? '#0BA060' : '#e2e8f0', transition: 'color 0.15s' }}
                >
                  ★
                </button>
              ))}
            </div>
            {reviewForm.rating > 0 && (
              <div style={{ fontSize: '0.82rem', color: '#0BA060', fontWeight: 600 }}>{RATING_LABELS[reviewForm.rating]}</div>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Tags (up to 5)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: reviewForm.tags.includes(tag) ? '#1e293b' : '#f1f5f9', color: reviewForm.tags.includes(tag) ? 'white' : '#64748b', border: 'none' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.25rem' }}>
            <textarea
              value={reviewForm.comment}
              onChange={e => onChangeComment(e.target.value)}
              placeholder="Share what made this trip special (optional)..."
              maxLength={2000}
              rows={4}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', resize: 'vertical', lineHeight: 1.6, color: '#1e293b', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview || !reviewForm.rating}
            style={{ padding: '0.75rem 2rem', background: submittingReview || !reviewForm.rating ? '#94a3b8' : '#1e293b', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 600, cursor: submittingReview || !reviewForm.rating ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
          >
            {submittingReview ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
