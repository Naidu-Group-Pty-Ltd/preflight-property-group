/**
 * The one place that decides which Supabase project this build talks to.
 *
 * Both the URL and the publishable ("anon") key used to be written into 31
 * source files by hand. That is why this repository could not be pointed at
 * its own backend: changing `VITE_SUPABASE_URL` moved nothing, because almost
 * every caller ignored it and dialled the prime's project directly.
 *
 * ── The pairing rule ─────────────────────────────────────────────────────────
 *
 * The anon key is a JWT whose `ref` claim names the project it belongs to, so
 * a URL from one project and a key from another authenticate to nothing. They
 * are therefore resolved as a PAIR: either the environment supplies both, or
 * neither is taken from it. A half-configured environment falls back to the
 * built-in pair and says so loudly, because silently mixing them produces
 * 401s that look like an auth bug rather than a configuration one.
 *
 * ── Why the fallback is THIS deployment, and not the prime ───────────────────
 *
 * It used to be the prime's pair, under a heading reading "Why the prime's
 * values are still the fallback" and the reason "so that this change is a
 * no-op upstream". That reasoning is sound in the repository it was written
 * in — the prime's own — where the prime's project IS this deployment's. It
 * came here verbatim with the mirror, and the sentence stayed true-looking
 * while becoming false.
 *
 * What it meant here is that a build which does not set VITE_SUPABASE_URL
 * does not fail, or warn, or degrade: it silently serves ANOTHER TENANT'S
 * PRODUCTION DATABASE from this deployment's domain. A missing variable is
 * the ordinary state of a new deployment, so that is the failure mode rather
 * than the safety net — `npc-client-dashboard` reached production that way.
 *
 * A fallback that reaches somewhere is only safe when the somewhere is us.
 *
 * Both halves move together, because the PAIR is what authenticates: the anon
 * key's `ref` claim names the project it belongs to, and a URL from one
 * project with a key from another authenticates to nothing.
 * `shippedBackendIdentity.spec.ts` asserts the pair names this project.
 */

/** This deployment's own project. Never another's — see above. */
const FALLBACK_URL = 'https://egrmsulhtmqnmhvuccxr.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncm1zdWxodG1xbm1odnVjY3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTM1MDQsImV4cCI6MjEwMzcyOTUwNH0.QwnqVuvV1lwVMHicP3P7u_D0ydkz-HE_5bv_emqlMWo';

function readEnv(key: string): string | undefined {
  try {
    const value = (import.meta as { env?: Record<string, string | undefined> })?.env?.[key];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}

/** The `ref` sub-domain of a Supabase project URL, or null if it is not one. */
export function projectRefFromUrl(url: string): string | null {
  const match = /^https?:\/\/([a-z0-9]+)\.supabase\.(co|in|net)/i.exec(url.trim());
  return match ? match[1] : null;
}

/** The `ref` claim of a Supabase anon JWT, or null if it cannot be read. */
export function projectRefFromAnonKey(key: string): string | null {
  try {
    const payload = key.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const ref = (JSON.parse(json) as { ref?: unknown }).ref;
    return typeof ref === 'string' ? ref : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the pair. Exported and pure so the precedence is unit-testable
 * without stubbing `import.meta`.
 */
export function resolveSupabaseTarget(input: {
  url?: string;
  anonKey?: string;
  fallbackUrl?: string;
  fallbackAnonKey?: string;
}): { url: string; anonKey: string; source: 'env' | 'fallback'; warning: string | null } {
  const fallbackUrl = input.fallbackUrl ?? FALLBACK_URL;
  const fallbackAnonKey = input.fallbackAnonKey ?? FALLBACK_ANON_KEY;
  const { url, anonKey } = input;

  if (url && anonKey) {
    const urlRef = projectRefFromUrl(url);
    const keyRef = projectRefFromAnonKey(anonKey);
    // A mismatch is always a configuration error, never a runtime one — say so
    // here rather than letting every request fail with an opaque 401.
    const warning =
      urlRef && keyRef && urlRef !== keyRef
        ? `Supabase misconfiguration: VITE_SUPABASE_URL names project "${urlRef}" but the publishable key belongs to "${keyRef}". Requests will be rejected until they match.`
        : null;
    return { url, anonKey, source: 'env', warning };
  }

  if (url || anonKey) {
    return {
      url: fallbackUrl,
      anonKey: fallbackAnonKey,
      source: 'fallback',
      warning: `Supabase is half-configured: ${url ? 'VITE_SUPABASE_URL is set but no publishable key is' : 'a publishable key is set but VITE_SUPABASE_URL is not'}. The URL and key are a matched pair, so BOTH built-in defaults are being used instead of mixing them.`,
    };
  }

  return { url: fallbackUrl, anonKey: fallbackAnonKey, source: 'fallback', warning: null };
}

const resolved = resolveSupabaseTarget({
  url: readEnv('VITE_SUPABASE_URL'),
  anonKey: readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ?? readEnv('VITE_SUPABASE_ANON_KEY'),
});

if (resolved.warning) {
  console.error(`[supabase/env] ${resolved.warning}`);
}

/**
 * Base URL of the Supabase project this build talks to, with any trailing
 * slash removed. Callers build `${SUPABASE_URL}/functions/v1/...`, so a
 * trailing slash would produce a double slash on every one of them.
 */
export const SUPABASE_URL = resolved.url.replace(/\/+$/, '');

/** Publishable (anon) key for that same project. Always paired with the URL. */
export const SUPABASE_ANON_KEY = resolved.anonKey;

/** Project ref of that same project, derived rather than typed a second time. */
export const SUPABASE_PROJECT_REF = projectRefFromUrl(resolved.url);

/** Whether the target came from the environment or from the built-in default. */
export const SUPABASE_TARGET_SOURCE = resolved.source;
