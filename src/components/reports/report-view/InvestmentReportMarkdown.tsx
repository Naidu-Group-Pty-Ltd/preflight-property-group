import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'lucide-react';

interface InvestmentReportMarkdownProps {
  content: string;
  sourcesContent?: string | null;
  includeSources?: boolean;
  processTextWithBadges?: (text: any) => ReactNode;
}

function renderText(children: any, processTextWithBadges?: (text: any) => ReactNode) {
  return processTextWithBadges ? processTextWithBadges(children) : children;
}

const createMarkdownComponents = (processTextWithBadges?: (text: any) => ReactNode) => ({
  h1: ({ children }: any) => (
    <h1 className="mb-6 mt-10 border-b border-border/80 pb-4 text-3xl font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mb-4 mt-9 flex items-center gap-3 text-2xl font-semibold tracking-tight text-primary">
      <span className="h-6 w-1 rounded-full bg-primary/70" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => <h3 className="mb-3 mt-7 text-xl font-semibold text-foreground">{children}</h3>,
  p: ({ children }: any) => <p className="mb-5 text-[15px] leading-8 text-foreground/90">{renderText(children, processTextWithBadges)}</p>,
  ul: ({ children }: any) => <ul className="mb-6 ml-5 space-y-2.5 list-disc marker:text-primary/70">{children}</ul>,
  ol: ({ children }: any) => <ol className="mb-6 ml-5 space-y-2.5 list-decimal marker:font-semibold marker:text-primary/80">{children}</ol>,
  li: ({ children }: any) => <li className="pl-2 text-[15px] leading-7 text-foreground/90">{children}</li>,
  table: ({ children }: any) => (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-muted/80 text-foreground">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-border/70">{children}</tbody>,
  tr: ({ children }: any) => <tr className="transition-colors even:bg-muted/20 hover:bg-muted/40">{children}</tr>,
  th: ({ children }: any) => <th className="border-r border-border/70 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0">{children}</th>,
  td: ({ children }: any) => <td className="border-r border-border/50 px-4 py-3 align-top leading-6 text-foreground/90 last:border-r-0">{renderText(children, processTextWithBadges)}</td>,
  strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-muted-foreground">{children}</em>,
  blockquote: ({ children }: any) => (
    <blockquote className="my-7 rounded-r-xl border-l-4 border-primary bg-primary/5 px-5 py-4 text-[15px] italic leading-7 text-foreground/80 shadow-sm">
      {children}
    </blockquote>
  ),
  code: ({ children }: any) => <code className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>,
});

export function InvestmentReportMarkdown({ content, sourcesContent, includeSources = true, processTextWithBadges }: InvestmentReportMarkdownProps) {
  const markdownComponents = createMarkdownComponents(processTextWithBadges);

  return (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>
      {includeSources && sourcesContent && (
        <section className="mt-12 rounded-2xl border border-border bg-muted/20 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-border/70 pb-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary"><Link className="h-4 w-4" /></div>
            <div>
              <h2 className="m-0 text-lg font-semibold text-foreground">Sources & references</h2>
              <p className="m-0 text-xs text-muted-foreground">Supporting source material included with this report.</p>
            </div>
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{sourcesContent}</ReactMarkdown>
        </section>
      )}
    </>
  );
}
