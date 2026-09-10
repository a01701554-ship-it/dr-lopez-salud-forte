export type AnalyticsEventName =
  | 'hero_schedule_click'
  | 'hero_podcast_click'
  | 'booking_started'
  | 'booking_slot_selected'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'booking_rescheduled'
  | 'podcast_show_clicked'
  | 'podcast_episode_clicked'
  | 'spotify_outbound_click'
  | 'article_view'
  | 'newsletter_signup'
  | 'masterclass_view'
  | 'masterclass_waitlist'
  | 'product_view'
  | 'checkout_started'
  | 'purchase_completed';

export type SafeAnalyticsPayload = Record<
  string,
  string | number | boolean | null
>;

/**
 * Adapter boundary for a future analytics provider. Never include symptoms,
 * diagnoses, medication, consultation reason, full patient name or birth date.
 */
export function trackEvent(
  _event: AnalyticsEventName,
  _payload: SafeAnalyticsPayload = {},
) {
  // Intentionally inert until a privacy-reviewed provider is configured.
}
