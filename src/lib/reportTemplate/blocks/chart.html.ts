import type { Block } from '../templateSchema';
import { resolveBindable, resolveBindableColor } from '../bindingResolver';
import { esc, absBoxStyle, type HtmlBlockContext } from './_shared.html';

export function renderChartHtml(block: Block, ctx: HtmlBlockContext): string {
  const p = block.props as Record<string, unknown>;
  const url = resolveBindable(p.chartUrl, ctx);
  const caption = resolveBindable(p.caption, ctx);
  const capColor = resolveBindableColor(p.captionColor ?? 'token:muted', ctx, '#666');
  const style = absBoxStyle(p, { x: 24, y: 24, w: ctx.page.width - 48, h: 240 });
  const imgH = caption ? 'calc(100% - 18pt)' : '100%';
  const inner = url
    ? `<img src="${esc(url)}" style="width:100%;height:${imgH};object-fit:contain;"/>`
    : `<div style="width:100%;height:${imgH};border:1pt solid #ccc;display:flex;align-items:center;justify-content:center;color:#999;font-size:10pt;">Chart unavailable</div>`;
  return `<div style="${style}">
    ${inner}
    ${caption ? `<div style="text-align:center;font-style:italic;font-size:8pt;color:${capColor};margin-top:4pt;">${esc(caption)}</div>` : ''}
  </div>`;
}
