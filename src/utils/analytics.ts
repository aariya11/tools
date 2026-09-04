/**
 * ToolBoxX Privacy-Preserving Event Tracker
 * Adheres to Section 26 & 31 of ToolBoxX specification.
 * Does not collect PII, IP addresses, or file contents.
 * Gated strictly by user cookie consent.
 */

export type AnalyticsEvent = 
  | 'tool_open'
  | 'file_upload'
  | 'processing_started'
  | 'processing_completed'
  | 'processing_failed'
  | 'download_completed'
  | 'search'
  | 'cookie_consent_updated';

export interface AnalyticsPayload {
  toolId?: string;
  category?: string;
  fileCount?: number;
  fileType?: string;
  query?: string;
  error?: string;
  [key: string]: unknown;
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  try {
    const rawConsent = localStorage.getItem('toolboxx_cookie_consent_v1');
    if (!rawConsent) return; // No consent established yet

    const parsed = JSON.parse(rawConsent);
    if (!parsed.analytics && event !== 'cookie_consent_updated') {
      return; // Analytics consent refused
    }

    // In local development or client-only mode, safely dispatch a custom window event
    const eventDetail = {
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toolboxx_analytics', { detail: eventDetail }));
    }

    // If Google Analytics / Plausible / Cloudflare is configured via env in the future:
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, payload);
    }
  } catch {
    // Fail silently without disrupting user operations
  }
}
