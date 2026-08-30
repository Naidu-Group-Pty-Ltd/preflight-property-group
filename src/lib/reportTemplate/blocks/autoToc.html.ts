/**
 * Phase 8 — auto-toc block
 *
 * Walks all visible pages and lists every block with a `bookmark`, producing
 * a printable table-of-contents with page numbers and clickable anchors.
 */
import type { Block } from '../templateSchema';
import { resolveBindable, resolveBindableColor } from '../bindingResolver';
import { esc, type HtmlBlockContext } from './_shared.html';

type R = Record<string, unknown>;

export function renderAutoTocHtml(block: Block, ctx: HtmlBlockContext): string {
  const p = block.props as R;
  const x = Number(p.x ?? 24);
  const y = Number(p.y ?? 80);
  const w = Number(p.width ?? ctx.page.width - 48);
  const title = String(p.title ?? 'Contents');
  const titleSize = Number(p.titleSize ?? 22);
  const size = Number(p.size ?? 11);
  const lineHeight = Number(p.lineHeight ?? 20);
  const indent = Number(p.indent ?? 12);
  const color = resolveBindableColor(p.color ?? 'token:text', ctx, '#0F172A');
  const accent = resolveBindableColor(p.accent ?? 'token:primary', ctx, '#BF9B50');
  const dotted = p.dotLeader !== false;

  // ctx provides `pages` (id+name). We need the full block list, exposed via ctx.slots? No.
  // Walk via globally exposed `__tocEntries` on data set by the renderer.
  const entries: Array<{ label: string; level: number; pageIndex: number; anchor: string }> =
    Array.isArray((ctx.data as any).__tocEntries) ? (ctx.data as any).__tocEntries : [];

  const filtered = entries.filter((e) => p.maxLevel ? e.level <= Number(p.maxLevel) : true);

  const rows = filtered
    .map((e) => {
      const pad = (e.level - 1) * indent;
      const leader = dotted
        ? `<span style="flex:1;border-bottom:1pt dotted ${color}40;margin:0 6pt 4pt;"></span>`
        : `<span style="flex:1;"></span>`;
      return `<a href="#${esc(e.anchor)}" style="display:flex;align-items:flex-end;color:${color};text-decoration:none;font:${e.level === 1 ? '600' : '400'} ${size}pt Helvetica;line-height:${lineHeight}pt;padding-left:${pad}pt;">
        <span>${esc(e.label)}</span>${leader}<span style="color:${accent};font-variant-numeric:tabular-nums;">${e.pageIndex + 1}</span>
      </a>`;
    })
    .join('');

  return `<div style="position:absolute;left:${x}pt;top:${y}pt;width:${w}pt;">
    ${title ? `<div style="font:700 ${titleSize}pt Helvetica;color:${color};margin-bottom:14pt;letter-spacing:0.4pt;">${esc(title)}</div>` : ''}
    ${rows || `<div style="font-style:italic;color:${color}80;font-size:${size}pt;">No bookmarks yet — set <code>bookmark.name</code> on a block to populate.</div>`}
  </div>`;
}
