import { Sparkles } from 'lucide-react';
import type { CashFlowContainerProps } from './types';

interface CashFlowAiPanelProps extends CashFlowContainerProps {
  active?: boolean;
}

export function CashFlowAiPanel({ children, active = true }: CashFlowAiPanelProps) {
  if (!active) return null;

  return (
    <section className="min-w-0 space-y-4 rounded-[1.75rem] border border-brand-300/30 bg-gradient-to-br from-card dark:from-background via-card dark:via-background to-card dark:to-background p-3 shadow-2xl shadow-sm dark:shadow-black/20 ring-1 ring-brand-400/15 md:p-4">
      <div className="flex min-w-0 items-center gap-3 px-1">
        <span className="shrink-0 rounded-2xl bg-brand-400/10 p-2 text-brand-300 shadow-sm ring-1 ring-brand-300/20">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-100 md:text-base">AI Decision Support</p>
          <p className="text-xs leading-5 text-muted-foreground dark:text-foreground [overflow-wrap:anywhere]">Generate, save, and export comparison analysis without changing report payloads.</p>
        </div>
      </div>
      {children}
    </section>
  );
}
