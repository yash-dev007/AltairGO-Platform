/**
 * trip.js — API-level trip creation helpers for Playwright tests.
 *
 * Use these in beforeAll to create test state without running through
 * the full generation UI flow every time.
 */

import { API_BASE } from './auth.js';

/**
 * Minimal itinerary JSON that satisfies the TripViewer and booking builder.
 */
export const MOCK_ITINERARY = {
  trip_title: 'E2E Test Trip — Jaipur 3 Days',
  total_cost: 9000,
  cost_breakdown: {
    accommodation: 3150,
    food: 2250,
    transport: 1800,
    activities: 1350,
    misc: 450,
  },
  from_city_iata: 'BOM',
  destination_iata: 'JAI',
  outbound_flight_price_inr: 3500,
  itinerary: [
    {
      day: 1,
      date: '2026-10-15',
      location: 'Jaipur',
      theme: 'Heritage & Forts',
      pacing_level: 'moderate',
      day_total: 3200,
      travel_hours: 0,
      intensity_score: 6,
      image_keyword: 'Amber Fort Jaipur',
      accommodation: {
        hotel_name: 'Hotel Pink City',
        name: 'Hotel Pink City',
        type: 'mid-range',
        category: 'mid',
        cost_per_night: 1800,
        location: 'MI Road, Jaipur',
        why_this: 'Central location',
        booking_tip: 'Book 2 weeks in advance',
        star_rating: 3,
      },
      activities: [
        {
          time: '09:00',
          time_range: '09:00-11:30',
          activity: 'Amber Fort',
          name: 'Amber Fort',
          description: 'Magnificent hilltop fort.',
          cost: 550,
          how_to_reach: 'Auto-rickshaw',
          crowd_level: 'moderate',
          requires_advance_booking: true,
        },
        {
          time: '12:00',
          time_range: '12:00-13:00',
          activity: 'Lunch',
          name: 'Lunch break',
          is_break: true,
          meal_type: 'lunch',
          description: 'Local thali',
          cost: 0,
        },
        {
          time: '14:00',
          time_range: '14:00-15:30',
          activity: 'Hawa Mahal',
          name: 'Hawa Mahal',
          description: 'Palace of winds.',
          cost: 200,
          requires_advance_booking: false,
        },
      ],
    },
    {
      day: 2,
      date: '2026-10-16',
      location: 'Jaipur',
      theme: 'Culture & Markets',
      pacing_level: 'relaxed',
      day_total: 2800,
      travel_hours: 0,
      intensity_score: 4,
      image_keyword: 'Jaipur markets',
      accommodation: {
        hotel_name: 'Hotel Pink City',
        name: 'Hotel Pink City',
        type: 'mid-range',
        category: 'mid',
        cost_per_night: 1800,
        location: 'MI Road, Jaipur',
        star_rating: 3,
      },
      activities: [
        {
          time: '10:00',
          time_range: '10:00-12:00',
          activity: 'Jantar Mantar',
          name: 'Jantar Mantar',
          description: 'UNESCO observatory.',
          cost: 200,
          requires_advance_booking: false,
        },
        {
          time: '15:00',
          time_range: '15:00-18:00',
          activity: 'Johari Bazaar',
          name: 'Johari Bazaar',
          description: 'Famous jewellery market.',
          cost: 0,
          requires_advance_booking: false,
        },
      ],
    },
    {
      day: 3,
      date: '2026-10-17',
      location: 'Jaipur',
      theme: 'Departure Day',
      pacing_level: 'light',
      day_total: 1500,
      travel_hours: 3,
      intensity_score: 2,
      image_keyword: 'Jaipur cityscape',
      accommodation: null,
      activities: [],
    },
  ],
  travel_between_cities: [],
  smart_insights: ['Best visited in winter'],
  packing_tips: ['Comfortable shoes'],
  document_checklist: [],
  daily_transport_guide: {},
  traveler_profile: { special_occasion: null },
};

/**
 * Save a trip via API and return the trip_id.
 * Faster than running the generation UI flow.
 */
export async function createSavedTrip(request, token) {
  const res = await request.post(`${API_BASE}/api/save-trip`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      destination_country: 'India',
      start_city: 'Mumbai',
      selected_destinations: [{ id: 1, name: 'Jaipur', estimated_cost_per_day: 3000 }],
      budget: 9000,
      duration: 3,
      travelers: 2,
      style: 'standard',
      date_type: 'fixed',
      start_date: '2026-10-15',
      traveler_type: 'couple',
      itinerary_json: MOCK_ITINERARY,
      total_cost: 9000,
      trip_title: MOCK_ITINERARY.trip_title,
    },
  });
  if (!res.ok()) {
    throw new Error(`createSavedTrip failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.trip_id || body.id;
}

/**
 * Create a booking plan for a trip and return the permission_request_id + items.
 */
export async function createBookingPlan(request, token, tripId) {
  const res = await request.post(`${API_BASE}/api/trip/${tripId}/booking-plan`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`createBookingPlan failed: ${res.status()} ${await res.text()}`);
  }
  return await res.json();
}

/**
 * Approve all bookings in a plan via API.
 * Returns updated plan response.
 */
export async function approveAllBookings(request, token, tripId, items) {
  const decisions = {};
  for (const item of items) {
    decisions[item.id] = true;
  }
  const res = await request.post(`${API_BASE}/api/trip/${tripId}/booking-plan/respond`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { decisions },
  });
  if (!res.ok()) {
    throw new Error(`approveAllBookings failed: ${res.status()} ${await res.text()}`);
  }
  return await res.json();
}
