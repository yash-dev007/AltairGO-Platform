const BASE = import.meta.env.VITE_API_URL || '';

function getToken() { return localStorage.getItem('ag_token'); }
function getAdminToken() { return localStorage.getItem('ag_admin_token'); }

async function req(path, opts = {}) {
  const { admin = false, body, method, auth = true, signal } = opts;
  const resolvedMethod = method || (body != null ? 'POST' : 'GET');
  const token = admin ? getAdminToken() : (auth ? getToken() : null);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: resolvedMethod,
    headers,
    signal,
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    if (admin) {
      // Admin token expired — only clear admin token, never touch user session
      localStorage.removeItem('ag_admin_token');
    } else if (auth) {
      // Authenticated user request got 401 — session expired, log out
      localStorage.removeItem('ag_token');
      window.dispatchEvent(new Event('ag:unauthorized'));
    }
    // auth:false calls (public endpoints, login attempts, admin verify-key) return
    // 401 as normal business logic — never touch any stored token
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || data.message || 'Request failed'), { status: res.status, data });
  // Unwrap the {success, data:[...]} envelope the backend normalizer adds to list responses
  if (data !== null && typeof data === 'object' && !Array.isArray(data)
      && 'success' in data && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }
  return data;
}

// Auth
export const authLogin = (email, password) => req('/auth/login', { body: { email, password }, auth: false });
export const authRegister = (name, email, password) => req('/auth/register', { body: { name, email, password }, auth: false });
export const authRefresh = () => req('/auth/refresh', { method: 'POST' });
export const authMe = () => req('/auth/me');

// Profile
export const getProfile = () => req('/api/user/profile');
export const updateProfile = (data) => req('/api/user/profile', { method: 'PUT', body: data });
export const deleteAccount = () => req('/api/user/account', { method: 'DELETE' });

// Search
export const search = (q, type = '', limit = 10) =>
  req(`/api/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`);

// Destinations
export const getCountries = () => req('/countries', { auth: false });
export const getDestinations = (params = {}) => {
  const { signal, ...rest } = params;
  const qs = new URLSearchParams(rest).toString();
  return req(`/destinations${qs ? '?' + qs : ''}`, { auth: false, signal });
};
export const getDestination = (id) => req(`/destinations/${id}`, { auth: false });

// Blogs
export const getBlogs = (params = {}) => {
  const { signal, ...rest } = params;
  const qs = new URLSearchParams(rest).toString();
  return req(`/blogs${qs ? '?' + qs : ''}`, { auth: false, signal });
};
export const getBlog = (id) => req(`/blogs/${id}`, { auth: false });
export const createDestinationRequest = (data) => req('/api/destination-requests', { body: data });
// Discovery
export const recommend = (params = {}) => {
  const { signal, ...rest } = params;
  const qs = new URLSearchParams(rest).toString();
  return req(`/api/discover/recommend${qs ? '?' + qs : ''}`, { auth: false, signal });
};
export const getBestTime = (id) => req(`/api/discover/best-time/${id}`, { auth: false });
export const estimateBudget = (data) => req('/api/discover/estimate-budget', { body: data, auth: false });
export const compareDestinations = (data) => req('/api/discover/compare', { body: data, auth: false });

// Trip Generation
export const generateItinerary = (data) => req('/generate-itinerary', { body: data, auth: false });
export const getItineraryStatus = (jobId) => req(`/get-itinerary-status/${jobId}`, { auth: false });
export const saveTrip = (data) => req('/api/save-trip', { body: data });
export const getTrip = (id) => req(`/get-trip/${id}`);
export const getUserTrips = (page = 1) => req(`/api/user/trips?page=${page}`);
export const getTripVariants = (id) => req(`/api/trip/${id}/variants`, { method: 'POST' });

// Sharing
export const shareTrip = (id) => req(`/api/trip/${id}/share`, { method: 'POST' });
export const unshareTrip = (id) => req(`/api/trip/${id}/share`, { method: 'DELETE' });
export const getSharedTrip = (token) => req(`/api/shared/${token}`, { auth: false });

// Bookings
export const getTripBookingPlan = (id) => req(`/api/trip/${id}/booking-plan`);
export const approveBooking = (id) => req(`/api/booking/${id}/approve`, { method: 'POST' });
export const rejectBooking = (id) => req(`/api/booking/${id}/reject`, { method: 'POST' });
export const executeAllBookings = (tripId) => req(`/api/trip/${tripId}/booking-plan/execute-all`, { method: 'POST' });
export const cancelBooking = (id) => req(`/api/booking/${id}/cancel`, { method: 'POST' });
export const getTripBookings = (tripId) => req(`/api/trip/${tripId}/bookings`);
export const customizeBooking = (id, data) => req(`/api/booking/${id}/customize`, { method: 'PUT', body: data });
export const addCustomBooking = (tripId, data) => req(`/api/trip/${tripId}/booking-plan/add-custom`, { body: data });

// Expenses
export const addExpense = (tripId, data) => req(`/api/trip/${tripId}/expense`, { body: data });
export const getExpenses = (tripId) => req(`/api/trip/${tripId}/expenses`);
export const deleteExpense = (id) => req(`/api/expense/${id}`, { method: 'DELETE' });

// Trip Tools
export const getTripReadiness = (id) => req(`/api/trip/${id}/readiness`);
export const getDailyBriefing = (id, day) => req(`/api/trip/${id}/daily-briefing/${day}`);
export const swapActivity = (id, data) => req(`/api/trip/${id}/activity/swap`, { method: 'POST', body: data });
export const getNextTripIdeas = (id) => req(`/api/trip/${id}/next-trip-ideas`);

// Trip Editor
export const getHotelOptions = (id, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req(`/api/trip/${id}/hotel-options${qs ? '?' + qs : ''}`);
};
export const swapHotel = (id, data) => req(`/api/trip/${id}/hotel`, { method: 'PUT', body: data });
export const addActivity = (id, day, data) => req(`/api/trip/${id}/day/${day}/activity/add`, { body: data });
export const removeActivity = (id, day, data) => req(`/api/trip/${id}/day/${day}/activity/remove`, { method: 'DELETE', body: data });
export const editActivity = (id, day, data) => req(`/api/trip/${id}/day/${day}/activity/edit`, { method: 'PUT', body: data });
export const reorderActivities = (id, day, data) => req(`/api/trip/${id}/day/${day}/reorder`, { method: 'PUT', body: data });
export const updateTripNotes = (id, data) => req(`/api/trip/${id}/notes`, { method: 'PUT', body: data });

// Signals
export const recordSignal = (data) => req('/api/signal', { body: data });

// Admin
export const adminVerifyKey = (key) => req('/api/admin/verify-key', { body: { key }, auth: false });
export const adminGetStats = () => req('/api/admin/stats', { admin: true });
export const adminGetDestinations = () => req('/api/admin/destinations', { admin: true });
export const adminCreateDestination = (data) => req('/api/admin/destinations', { body: data, admin: true });
export const adminUpdateDestination = (id, data) => req(`/api/admin/destinations/${id}`, { method: 'PUT', body: data, admin: true });
export const adminDeleteDestination = (id) => req(`/api/admin/destinations/${id}`, { method: 'DELETE', admin: true });
export const adminGetUsers = () => req('/api/admin/users', { admin: true });
export const adminGetTrips = () => req('/api/admin/trips', { admin: true });
export const adminDeleteTrip = (id) => req(`/api/admin/trips/${id}`, { method: 'DELETE', admin: true });
export const adminGetRequests = () => req('/api/admin/requests', { admin: true });
export const adminApproveRequest = (id) => req(`/api/admin/requests/${id}/approve`, { method: 'POST', admin: true });
export const adminRejectRequest = (id) => req(`/api/admin/requests/${id}/reject`, { method: 'POST', admin: true });
export const adminTriggerJob = (job_name) => req('/api/ops/trigger-job', { body: { job_name }, admin: true });
export const adminTriggerAgent = (agent_key) => req('/api/ops/trigger-agent', { body: { agent_key }, admin: true });
export const adminGetEngineConfig = () => req('/api/ops/engine-config', { admin: true });
export const adminUpdateEngineConfig = (data) => req('/api/ops/engine-config', { method: 'POST', body: data, admin: true });
export const adminGetOpsSummary = () => req('/api/ops/summary', { admin: true });

// Trip Reviews
export const getTripReview = (id) => req(`/api/trip/${id}/review`);
export const submitTripReview = (id, data) => req(`/api/trip/${id}/review`, { body: data });
export const submitAttractionReview = (id, data) => req(`/api/attraction/${id}/review`, { body: data });

// Post-Trip Summary
export const getTripSummary = (id) => req(`/api/trip/${id}/summary`);

// Admin — Feature Flags
export const adminGetFeatureFlags = () => req('/api/admin/feature-flags', { admin: true });
export const adminCreateFeatureFlag = (data) => req('/api/admin/feature-flags', { body: data, admin: true });
export const adminUpdateFeatureFlag = (key, data) => req(`/api/admin/feature-flags/${key}`, { method: 'PATCH', body: data, admin: true });
export const adminDeleteFeatureFlag = (key) => req(`/api/admin/feature-flags/${key}`, { method: 'DELETE', admin: true });

// Admin — Blog CMS
export const adminGetBlogs = () => req('/api/admin/blogs', { admin: true });
export const adminCreateBlog = (data) => req('/api/admin/blogs', { body: data, admin: true });
export const adminUpdateBlog = (id, data) => req(`/api/admin/blogs/${id}`, { method: 'PUT', body: data, admin: true });
export const adminDeleteBlog = (id) => req(`/api/admin/blogs/${id}`, { method: 'DELETE', admin: true });
