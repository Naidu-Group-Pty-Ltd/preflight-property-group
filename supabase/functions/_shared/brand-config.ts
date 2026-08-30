/**
 * Shared brand configuration helper for edge functions.
 *
 * Reads dynamic brand identity from `global_report_settings` and provides
 * safe fallbacks so outbound emails and AI prompts continue working even if
 * settings are missing.
 *
 * IMPORTANT — Sender address safety:
 *   The fallback `noreply@npcservices.com.au` / `admin@npcservices.com.au`
 *   addresses are the ONLY currently Resend-verified sender addresses.
 *   If an admin sets `contact_details.email` to an address on a DIFFERENT
 *   domain that is NOT verified in Resend, all outbound emails from that
 *   function will fail with `403 from address not authorized`.
 *
 *   To switch sender domains, the new domain must first be verified in
 *   the Resend dashboard. The fallback below ensures delivery never breaks
 *   for misconfigured/empty values.
 */

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface BrandConfig {
  /** Display brand name (e.g., "Acme Property Consulting") */
  companyName: string;
  /** UPPERCASE display variant for headings */
  companyNameUpper: string;
  /** Contact email (used as sender + in body copy) */
  contactEmail: string;
  /** Sender display+address: "Brand Name <email>" */
  fromHeader: string;
  /** Admin sender variant: "Brand Name Admin <email>" */
  fromHeaderAdmin: string;
  /** Notifications sender variant for portal emails */
  fromHeaderNotifications: string;
  /** Contact phone */
  contactPhone: string;
  /** Public website */
  contactWebsite: string;
  /** Mailing address */
  contactAddress: string;
  /** ABN/registration */
  abn: string;
}

// Hard fallbacks — only used when DB row is missing/empty.
// These intentionally point at the legacy verified Resend sender so
// existing flows never break before a new sender domain is verified.
const FALLBACK_COMPANY = 'Property Consulting';
const FALLBACK_EMAIL_NOREPLY = 'noreply@npcservices.com.au';
const FALLBACK_EMAIL_ADMIN = 'admin@npcservices.com.au';
const FALLBACK_EMAIL_NOTIFICATIONS = 'notifications@npcservices.com.au';
const FALLBACK_PHONE = '';
const FALLBACK_WEBSITE = '';
const FALLBACK_ADDRESS = '';
const FALLBACK_ABN = '';

let _cached: BrandConfig | null = null;
let _cachedAt = 0;
const CACHE_TTL_MS = 60_000; // 1 minute — long enough to cover a single AI report run, short enough to pick up admin edits quickly

function buildFallback(): BrandConfig {
  return {
    companyName: FALLBACK_COMPANY,
    companyNameUpper: FALLBACK_COMPANY.toUpperCase(),
    contactEmail: FALLBACK_EMAIL_ADMIN,
    fromHeader: `${FALLBACK_COMPANY} <${FALLBACK_EMAIL_NOREPLY}>`,
    fromHeaderAdmin: `${FALLBACK_COMPANY} Admin <${FALLBACK_EMAIL_ADMIN}>`,
    fromHeaderNotifications: `${FALLBACK_COMPANY} <${FALLBACK_EMAIL_NOTIFICATIONS}>`,
    contactPhone: FALLBACK_PHONE,
    contactWebsite: FALLBACK_WEBSITE,
    contactAddress: FALLBACK_ADDRESS,
    abn: FALLBACK_ABN,
  };
}

/**
 * Fetch brand config from `global_report_settings`. Cached in-memory for 60s
 * to amortise across AI multi-call workflows.
 */
export async function getBrandConfig(supabase?: SupabaseClient): Promise<BrandConfig> {
  // Serve from cache if fresh
  const now = Date.now();
  if (_cached && now - _cachedAt < CACHE_TTL_MS) {
    return _cached;
  }

  try {
    const client = supabase ?? createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await client
      .from('global_report_settings')
      .select('setting_key, setting_value')
      .eq('setting_key', 'contact_details')
      .maybeSingle();

    if (error || !data?.setting_value) {
      const fb = buildFallback();
      _cached = fb;
      _cachedAt = now;
      return fb;
    }

    const cd = data.setting_value as Record<string, string>;
    const company = (cd.company_name || '').trim() || FALLBACK_COMPANY;
    const email = (cd.email || '').trim();

    // Sender address selection — use configured email if present, otherwise fallback
    const noreplyAddr = email || FALLBACK_EMAIL_NOREPLY;
    const adminAddr = email || FALLBACK_EMAIL_ADMIN;
    const notifAddr = email || FALLBACK_EMAIL_NOTIFICATIONS;

    const cfg: BrandConfig = {
      companyName: company,
      companyNameUpper: company.toUpperCase(),
      contactEmail: email || FALLBACK_EMAIL_ADMIN,
      fromHeader: `${company} <${noreplyAddr}>`,
      fromHeaderAdmin: `${company} Admin <${adminAddr}>`,
      fromHeaderNotifications: `${company} <${notifAddr}>`,
      contactPhone: (cd.phone || '').trim() || FALLBACK_PHONE,
      contactWebsite: (cd.website || '').trim() || FALLBACK_WEBSITE,
      contactAddress: (cd.address || '').trim() || FALLBACK_ADDRESS,
      abn: (cd.abn || '').trim() || FALLBACK_ABN,
    };

    _cached = cfg;
    _cachedAt = now;
    return cfg;
  } catch (e) {
    console.error('[brand-config] Failed to load brand config, using fallback:', e);
    return buildFallback();
  }
}

/** Force-clear the cache. Call after admin updates contact details. */
export function clearBrandConfigCache(): void {
  _cached = null;
  _cachedAt = 0;
}
