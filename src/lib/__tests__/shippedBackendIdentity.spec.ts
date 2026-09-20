/**
 * Every Supabase project named in a SHIPPED file is this deployment's own.
 *
 * `public/` is copied into `dist/` untouched and served verbatim from this
 * deployment's domain, so a project ref written into a file there is not a
 * default or a fallback — it is where that page's requests actually go.
 *
 * ## Why this is an allow-list and not a deny-list
 *
 * The rule used to be "not the prime's", and that is the shape this test
 * exists to replace.
 *
 * `public/lead-magnet-embed.html` hard-codes a Supabase URL and anon key
 * because a standalone embed cannot read `VITE_*`. It named the PRIME's
 * project — so every lead it captured was written into the prime's database
 * from this deployment's domain. That was wrong, and it was at least
 * detectable, because "is it the prime's?" was a question something could ask.
 *
 * On 20 Sep 2026 a cascade nearly replaced it with a SIBLING deployment's
 * project ref and key. Both values are wrong for this repository, but only one
 * of them is the prime's — so a deny-list of that single value would have gone
 * green over the new one, and the defect would have stopped being visible at
 * the exact moment it got worse.
 *
 * There is no list of "the projects we are not". There is one project we ARE,
 * and everything else is foreign whether we have heard of it or not.
 *
 * ## Why the answer comes from `supabase/config.toml`
 *
 * `project_id` is already this repository's own statement of which project it
 * belongs to — the Supabase CLI acts on it, so it cannot drift without
 * breaking deploys, which makes it the one fact here that is kept honest by
 * something other than this test.
 *
 * It also makes this file deployment-agnostic. A spec that hard-codes its own
 * ref is itself identity: cascade it from a parent to a child and it asserts
 * the child ought to be the parent. Deriving it means every deployment can run
 * the identical file and each one checks itself.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(REPO_ROOT, rel), 'utf8');

/** This deployment's own project, per the file the Supabase CLI obeys. */
const OWN_PROJECT_REF = (() => {
  const match = /^project_id\s*=\s*"([a-z0-9]+)"/m.exec(read(join('supabase', 'config.toml')));
  if (!match) throw new Error('supabase/config.toml declares no project_id');
  return match[1];
})();

/** `https://<ref>.supabase.co`, anywhere in a file. */
const URL_REF = /https:\/\/([a-z0-9]{16,})\.supabase\.(?:co|in|net)/g;

/**
 * The `ref` claim inside a Supabase JWT.
 *
 * The key is checked as well as the URL because the PAIR is what
 * authenticates: a URL from one project with a key from another authenticates
 * to nothing, and a key from one project with a URL from the same one is the
 * only combination that is actually this deployment.
 */
function jwtRefsIn(content: string): string[] {
  const refs: string[] = [];
  for (const [, payload] of content.matchAll(/\bey[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
    try {
      const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      const ref = (JSON.parse(json) as { ref?: unknown }).ref;
      if (typeof ref === 'string') refs.push(ref);
    } catch {
      // Not a JWT we can read. Not this test's business.
    }
  }
  return refs;
}

function shippedFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(REPO_ROOT, dir), { withFileTypes: true })) {
      const rel = join(dir, entry.name);
      if (entry.isDirectory()) walk(rel);
      else out.push(rel);
    }
  };
  walk('public');
  return out;
}

describe('shipped files name this deployment and nothing else', () => {
  it('declares a project_id to check against', () => {
    // If this ever fails, every assertion below is vacuous, so it is asserted
    // rather than assumed.
    expect(OWN_PROJECT_REF).toMatch(/^[a-z0-9]{16,}$/);
  });

  it('every Supabase URL under public/ is this project', () => {
    const offenders: string[] = [];
    for (const rel of shippedFiles()) {
      for (const [, ref] of read(rel).matchAll(URL_REF)) {
        if (ref !== OWN_PROJECT_REF) offenders.push(`${rel} -> ${ref}`);
      }
    }
    expect(offenders, `shipped files naming a foreign project: ${offenders.join(', ')}`).toEqual([]);
  });

  it('every Supabase key under public/ belongs to this project', () => {
    const offenders: string[] = [];
    for (const rel of shippedFiles()) {
      for (const ref of jwtRefsIn(read(rel))) {
        if (ref !== OWN_PROJECT_REF) offenders.push(`${rel} -> key for ${ref}`);
      }
    }
    expect(offenders, `shipped keys belonging elsewhere: ${offenders.join(', ')}`).toEqual([]);
  });

  it('the lead-magnet embed carries a matching URL and key', () => {
    // The file this test was written for. Named explicitly so that deleting
    // it, or renaming it out of the walk, fails here rather than silently
    // reducing this suite to nothing.
    const embed = read(join('public', 'lead-magnet-embed.html'));
    const urlRefs = [...embed.matchAll(URL_REF)].map(([, ref]) => ref);
    const keyRefs = jwtRefsIn(embed);

    expect(urlRefs, 'the embed names no Supabase URL').not.toEqual([]);
    expect(keyRefs, 'the embed carries no Supabase key').not.toEqual([]);
    expect(new Set([...urlRefs, ...keyRefs])).toEqual(new Set([OWN_PROJECT_REF]));
  });
});
