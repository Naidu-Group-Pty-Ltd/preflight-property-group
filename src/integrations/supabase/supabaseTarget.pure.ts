/**
 * Which Supabase project a build talks to — the decision, with no environment
 * in it.
 *
 * Split out of `env.ts` so the two halves can answer to different rules.
 * `env.ts` keeps the reads, and those must be STATIC (see its header): a read
 * the bundler cannot see through is `undefined` in every production build.
 * This module keeps the judgement — the pairing rule — and the one value that
 * differs from deployment to deployment, so nothing here reads `import.meta`
 * and nothing here has to be written twice.
 *
 * ── Why the per-deployment value lives in its own file ───────────────────────
 *
 * Every deployment of this codebase carries this file, and every copy of it
 * names a different project. The cascade that carries shared code from this
 * repository to its clones must therefore never write it: it is a protected
 * path on a mirror, and on any other clone the copy here names a project that
 * is not the clone's own, which is what `backendIdentityHold` holds back.
 * Mission Control's provisioning is the one writer — it rewrites the pair
 * below for a new clone, in whichever of this file or `env.ts` declares it.
 *
 * Keeping it here is what lets `env.ts` carry no per-deployment value at all,
 * so the prime's copy and a clone's can be the same file. While the pair lived
 * in `env.ts`, the file holding the reads was also a file no cascade could
 * deliver — protected on a mirror, held everywhere else — so the prime's
 * broken reads and a clone's corrected ones could only ever be reconciled by
 * hand, one repository at a time.
 */

/**
 * THIS deployment's own project.
 *
 * It is the path a build takes when nobody configured it — the ordinary state
 * of a repository build, a CI run, or a new deployment — so it has to be the
 * deployment's own. `src/lib/__tests__/shippedBackendIdentity.spec.ts` is what
 * keeps it so, on this repository and on every clone.
 *
 * The project is named here as a URL and a key and nowhere in prose. Those two
 * are exactly what provisioning rewrites for a new clone, so a sentence naming
 * the project would survive the rewrite and be false on every clone it
 * reached.
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
 *
 * (This history moved here from `env.ts` on 23 Sep 2026, with the pair it
 * is about: `env.ts` is the same file on every deployment now and names no
 * project.)
 */
export const FALLBACK_URL = 'https://egrmsulhtmqnmhvuccxr.supabase.co';
export const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncm1zdWxodG1xbm1odnVjY3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTM1MDQsImV4cCI6MjEwMzcyOTUwNH0.QwnqVuvV1lwVMHicP3P7u_D0ydkz-HE_5bv_emqlMWo';

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

/** What a build resolved, and whether it came from the environment. */
export type SupabaseTarget = {
  url: string;
  anonKey: string;
  source: 'env' | 'fallback';
  warning: string | null;
};

/**
 * Resolve the pair. Exported and pure so the precedence is unit-testable
 * without stubbing `import.meta`.
 */
export function resolveSupabaseTarget(input: {
  url?: string;
  anonKey?: string;
  fallbackUrl?: string;
  fallbackAnonKey?: string;
}): SupabaseTarget {
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
