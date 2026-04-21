import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, ChevronDown, ChevronUp, Utensils, Camera, Mountain, Landmark, Star,
  Package, Plus, Pencil, Trash2, RefreshCw, Coffee,
} from 'lucide-react';

const PACING_COLORS = { intense: '#ef4444', moderate: '#0BA060', relaxed: '#10b981' };

const ActivityIcon = ({ type }) => {
  const t = (type || '').toLowerCase();
  if (t.includes('restaurant') || t.includes('food') || t.includes('cafe')) return <Utensils size={16} />;
  if (t.includes('beach') || t.includes('nature') || t.includes('viewpoint')) return <Mountain size={16} />;
  if (t.includes('museum') || t.includes('temple') || t.includes('heritage')) return <Landmark size={16} />;
  if (t.includes('photo')) return <Camera size={16} />;
  return <Star size={16} />;
};

export default function ItineraryTab({
  tripId,
  days,
  weatherAlerts,
  localEvents,
  packingTips,
  docChecklist,
  preTripInfo,
  insights,
  transportGuide,
  pendingBookings,
  expandedDays,
  onToggleDay,
  onOpenBookingsTab,
  onOpenHotelModal,
  onOpenAddActModal,
  onOpenEditActModal,
  onRemoveActivity,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Pending bookings nudge banner */}
      {pendingBookings.length > 0 && (
        <div style={{ background: '#E8F8F2', border: '1px solid #9FDFC3', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <div>
              <div style={{ fontWeight: 700, color: '#088A52', fontSize: '0.9rem' }}>
                {pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} awaiting your approval
              </div>
              <div style={{ fontSize: '0.8rem', color: '#0BA060' }}>Review and approve before executing</div>
            </div>
          </div>
          <button
            onClick={onOpenBookingsTab}
            style={{ padding: '0.5rem 1.1rem', background: '#0BA060', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            Review Bookings →
          </button>
        </div>
      )}

      {/* Local Events banner */}
      {localEvents.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', border: '1px solid #f9a8d4', borderRadius: '14px', padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 700, color: '#9d174d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎉 Local Events During Your Trip
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {localEvents.map((ev, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#831843' }}>
                <span style={{ fontWeight: 600 }}>{ev.name}</span>
                {ev.start_date && <span style={{ color: '#9d174d' }}> · {ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` – ${ev.end_date}` : ''}</span>}
                {ev.description && <span style={{ color: '#a21caf' }}> — {ev.description}</span>}
                {ev.tips && <span style={{ color: '#86198f', fontStyle: 'italic' }}> 💡 {ev.tips}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {days.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          No itinerary data available.
        </div>
      ) : (
        days.map((day) => {
          const dayNum = day.day || day.day_number;
          const isExpanded = expandedDays.has(dayNum);
          const activities = day.activities || [];
          const pacing = day.pacing_level || 'moderate';
          const theme = day.theme || day.location;
          const dayAlert = day.weather_alert || weatherAlerts[`day_${dayNum}`] || weatherAlerts[dayNum];
          const dayTransport = transportGuide.find(t => t.day === dayNum);

          return (
            <div key={dayNum} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Weather alert banner for this day */}
              {dayAlert && (
                <div style={{ padding: '0.6rem 1.25rem', background: dayAlert.severity === 'extreme' ? '#fef2f2' : '#E8F8F2', borderBottom: `1px solid ${dayAlert.severity === 'extreme' ? '#fecaca' : '#9FDFC3'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{dayAlert.severity === 'extreme' ? '🌩️' : '⚠️'}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: dayAlert.severity === 'extreme' ? '#991b1b' : '#088A52' }}>
                    {dayAlert.alert_type || 'Weather alert'}: {dayAlert.description}
                    {dayAlert.probability_pct ? ` (${dayAlert.probability_pct}% chance)` : ''}
                  </span>
                </div>
              )}

              <div
                onClick={() => onToggleDay(dayNum)}
                style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', flexShrink: 0 }}>
                    {dayNum}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                      Day {dayNum}{theme ? ` — ${theme}` : ''}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
                      {day.date && <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{day.date}</span>}
                      {theme && theme !== day.location && (
                        <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{theme}</span>
                      )}
                      <span style={{ fontSize: '0.78rem', background: PACING_COLORS[pacing] + '20', color: PACING_COLORS[pacing], padding: '2px 8px', borderRadius: '999px', fontWeight: 600, textTransform: 'capitalize' }}>{pacing}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {day.day_total && (
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                      ₹{Number(day.day_total).toLocaleString('en-IN')}
                    </span>
                  )}
                  <Link
                    to={`/trip/${tripId}/briefing/${dayNum}`}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7', background: '#f0f9ff', padding: '4px 10px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Day Brief
                  </Link>
                  {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid #f1f5f9' }}>
                  {activities.map((act, ai) => {
                    const isMeal = act.is_break || act.type?.toLowerCase().includes('restaurant') || act.name?.toLowerCase().includes('lunch') || act.name?.toLowerCase().includes('breakfast') || act.name?.toLowerCase().includes('dinner');
                    return (
                      <div
                        key={ai}
                        style={{ padding: '1rem 1.5rem', borderBottom: ai < activities.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', background: isMeal ? '#E8F8F2' : 'white', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { if (!isMeal) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isMeal ? '#E8F8F2' : 'white'; }}
                      >
                        {/* Time chip */}
                        <div style={{ minWidth: '70px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', paddingTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                          {act.time || act.start_time || ''}
                        </div>

                        {/* Icon */}
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: isMeal ? '#E8F8F2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMeal ? '#0BA060' : '#64748b', flexShrink: 0 }}>
                          {isMeal ? <Coffee size={16} /> : <ActivityIcon type={act.type} />}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{act.name}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                              {act.cost > 0 && (
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                  ₹{Number(act.cost).toLocaleString('en-IN')}
                                </span>
                              )}
                              {act.is_photo_spot && (
                                <span style={{ fontSize: '0.7rem', background: '#E8F8F2', color: '#088A52', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>📸</span>
                              )}
                              {act.difficulty_level && act.difficulty_level !== 'easy' && (
                                <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '6px', fontWeight: 600, textTransform: 'capitalize' }}>{act.difficulty_level}</span>
                              )}
                              {!isMeal && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onOpenEditActModal(dayNum, act); }}
                                    title="Edit activity"
                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onRemoveActivity(dayNum, act.name); }}
                                    title="Remove activity"
                                    style={{ background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '3px 7px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {act.description && (
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>{act.description}</p>
                          )}

                          {act.why_this_fits && (
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                              {act.why_this_fits}
                            </p>
                          )}

                          {act.local_secret && (
                            <div style={{ marginTop: '6px', padding: '6px 10px', background: '#E8F8F2', borderRadius: '8px', borderLeft: '3px solid #0BA060' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#088A52' }}>💡 Local tip: </span>
                              <span style={{ fontSize: '0.78rem', color: '#0BA060' }}>{act.local_secret}</span>
                            </div>
                          )}

                          {act.how_to_reach && (
                            <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                              <span style={{ flexShrink: 0 }}>🧭</span>
                              <span>{act.how_to_reach}</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '6px', flexWrap: 'wrap' }}>
                            {act.avg_visit_duration_hours && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={11} /> {act.avg_visit_duration_hours}h
                              </span>
                            )}
                            {act.dress_code && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>👔 {act.dress_code}</span>
                            )}
                            {act.queue_wait_minutes > 0 && (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>⏱ {act.queue_wait_minutes}min queue</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Activity button */}
                  <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onOpenAddActModal(dayNum)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
                    >
                      <Plus size={14} /> Add Activity
                    </button>
                  </div>

                  {/* Accommodation */}
                  {day.accommodation && (
                    <div style={{ padding: '1rem 1.5rem', background: '#f0f9ff', borderTop: '1px solid #e0f2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, marginBottom: '2px' }}>STAY</div>
                        <div style={{ fontWeight: 700, color: '#0c4a6e' }}>{day.accommodation.hotel_name || day.accommodation}</div>
                        {day.accommodation.price_per_night && (
                          <div style={{ fontSize: '0.8rem', color: '#0369a1' }}>₹{Number(day.accommodation.price_per_night).toLocaleString('en-IN')}/night</div>
                        )}
                      </div>
                      <button
                        onClick={() => onOpenHotelModal(dayNum)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', background: 'white', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        <RefreshCw size={13} /> Change Hotel
                      </button>
                    </div>
                  )}

                  {/* Daily transport guide */}
                  {dayTransport && (
                    <div style={{ padding: '0.75rem 1.5rem', background: '#f0fdf4', borderTop: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>🚗</span>
                      <div style={{ flex: 1, fontSize: '0.82rem', color: '#166534' }}>
                        <span style={{ fontWeight: 700 }}>{dayTransport.mode}</span>
                        {dayTransport.estimated_cost_inr ? <span> · ₹{Number(dayTransport.estimated_cost_inr).toLocaleString('en-IN')}</span> : ''}
                        {dayTransport.notes ? <span style={{ color: '#4ade80' }}> — {dayTransport.notes}</span> : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Packing Tips */}
      {packingTips.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} /> Packing Tips
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {packingTips.map((tip, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>
                {typeof tip === 'string' ? tip : tip.tip || JSON.stringify(tip)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Checklist */}
      {docChecklist.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📋 Document Checklist
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {docChecklist.map((doc, i) => (
              <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, background: doc.required ? '#E8F8F2' : '#f1f5f9', color: doc.required ? '#088A52' : '#475569', border: `1px solid ${doc.required ? '#9FDFC3' : '#e2e8f0'}` }}>
                {doc.required ? '* ' : ''}{doc.item || doc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Trip Info */}
      {preTripInfo && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌍 Pre-Trip Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {preTripInfo.connectivity_guide && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>📶 CONNECTIVITY</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>{preTripInfo.connectivity_guide}</div>
              </div>
            )}
            {preTripInfo.currency_tips && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>💰 CURRENCY</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>{preTripInfo.currency_tips}</div>
              </div>
            )}
            {preTripInfo.dress_code_general && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>👗 DRESS CODE</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>{preTripInfo.dress_code_general}</div>
              </div>
            )}
            {preTripInfo.water_safety && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>💧 WATER</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>{preTripInfo.water_safety}</div>
              </div>
            )}
            {preTripInfo.emergency_contacts && typeof preTripInfo.emergency_contacts === 'object' && (
              <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>🚨 EMERGENCY</div>
                {Object.entries(preTripInfo.emergency_contacts).slice(0, 3).map(([k, v]) => (
                  <div key={k} style={{ fontSize: '0.82rem', color: '#7f1d1d' }}><span style={{ fontWeight: 600 }}>{k}:</span> {v}</div>
                ))}
              </div>
            )}
            {preTripInfo.tipping_guide && typeof preTripInfo.tipping_guide === 'object' && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>💸 TIPPING</div>
                {Object.entries(preTripInfo.tipping_guide).slice(0, 3).map(([k, v]) => (
                  <div key={k} style={{ fontSize: '0.82rem', color: '#334155' }}><span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{k}:</span> {v}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #bae6fd' }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ Smart Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {insights.map((insight, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#1e40af' }}>
                <span style={{ color: '#3b82f6', flexShrink: 0 }}>💡</span>
                <span>{typeof insight === 'string' ? insight : insight.tip || JSON.stringify(insight)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
