/** Shared chip palettes for Compass visual blocks (HTML side). */
import { esc } from './_shared.html';

export const RATING_PALETTE: Record<string, { bg: string; fg: string }> = {
  Strong:   { bg: '#DCFCE7', fg: '#065F46' },
  Moderate: { bg: '#FEF3C7', fg: '#92400E' },
  Watch:    { bg: '#FEE2E2', fg: '#991B1B' },
  High:     { bg: '#FEE2E2', fg: '#991B1B' },
  Medium:   { bg: '#FEF3C7', fg: '#92400E' },
  Low:      { bg: '#DCFCE7', fg: '#065F46' },
};

export const CONFIDENCE_PALETTE: Record<string, { bg: string; fg: string; label: string }> = {
  Verified:          { bg: '#DCFCE7', fg: '#065F46', label: 'Verified' },
  Indicative:        { bg: '#FEF3C7', fg: '#92400E', label: 'Indicative' },
  Planned:           { bg: '#DBEAFE', fg: '#1E3A8A', label: 'Planned' },
  UnderConstruction: { bg: '#E0E7FF', fg: '#3730A3', label: 'Under construction' },
  Unverified:        { bg: '#F3F4F6', fg: '#374151', label: 'Unverified' },
  NotAvailable:      { bg: '#F3F4F6', fg: '#6B7280', label: 'N/A' },
};

export function chip(text: string, bg: string, fg: string, size = 8): string {
  return `<span style="background:${bg};color:${fg};font-weight:700;font-size:${size}pt;padding:2pt 6pt;border-radius:${size}pt;display:inline-block;white-space:nowrap;">${esc(text)}</span>`;
}

export function ratingChipHtml(rating: string, size = 8): string {
  const p = RATING_PALETTE[rating] ?? { bg: '#F3F4F6', fg: '#374151' };
  return chip(rating, p.bg, p.fg, size);
}

export function confidenceChipHtml(conf: string, size = 7.5): string {
  const p = CONFIDENCE_PALETTE[conf] ?? { bg: '#F3F4F6', fg: '#374151', label: conf };
  return chip(p.label, p.bg, p.fg, size);
}
