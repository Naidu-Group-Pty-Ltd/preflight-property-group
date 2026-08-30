/**
 * Strengths & Watch-Points (Compass §6) — two-column structured list.
 *
 * Props:
 *   x,y,width: layout
 *   strengthsTitle?: string (default 'Strengths')
 *   watchTitle?: string (default 'Watch Points')
 *   strengths: string[]
 *   watch: string[]
 */
import type { Block } from '../templateSchema';
import type { BlockRenderContext } from './index';
import { resolveBindable } from '../bindingResolver';
import { hex } from './_shared';

export function drawStrengthsWatchBlock(block: Block, ctx: BlockRenderContext): void {
  const { doc, page } = ctx;
  const p = block.props as Record<string, unknown>;
  const x = Number(p.x ?? 24);
  const y = Number(p.y ?? 80);
  const w = Number(p.width ?? page.width - 48);
  const gap = 14;
  const colW = (w - gap) / 2;

  const strengthsTitle = resolveBindable(p.strengthsTitle ?? 'Strengths', ctx);
  const watchTitle = resolveBindable(p.watchTitle ?? 'Watch Points', ctx);
  const strengths = Array.isArray(p.strengths) ? (p.strengths as string[]) : [];
  const watch = Array.isArray(p.watch) ? (p.watch as string[]) : [];

  const drawColumn = (
    cx: number,
    title: string,
    items: string[],
    accent: { r: number; g: number; b: number },
    glyph: '+' | '!',
  ) => {
    // Title bar
    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.rect(cx, y, colW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(String(title).toUpperCase(), cx + 12, y + 15);

    let iy = y + 22 + 12;
    items.forEach((it, idx) => {
      const text = resolveBindable(it, ctx);
      const lines = doc.splitTextToSize(text, colW - 30);
      // Glyph badge
      doc.setFillColor(accent.r, accent.g, accent.b);
      doc.circle(cx + 12, iy - 3, 4.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(glyph, cx + 12, iy - 1, { align: 'center', baseline: 'middle' });
      // Body
      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(lines, cx + 24, iy, { lineHeightFactor: 1.35 });
      iy += lines.length * 12 + 8;
      void idx;
    });
  };

  drawColumn(x, String(strengthsTitle), strengths, hex('#16A34A'), '+');
  drawColumn(x + colW + gap, String(watchTitle), watch, hex('#D97706'), '!');
}
