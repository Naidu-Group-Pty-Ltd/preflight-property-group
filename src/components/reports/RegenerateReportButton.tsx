import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useChunkedRegeneration, type GenerationEngine } from '@/hooks/useChunkedRegeneration';
import { invokeSecureFunction } from '@/lib/secureInvoke';

interface RegenerateReportButtonProps {
  reportId: string;
  propertyAddress: string;
  onRegenerated?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function RegenerateReportButton({
  reportId,
  propertyAddress,
  onRegenerated,
  variant = 'outline',
  size = 'sm',
  className = ''
}: RegenerateReportButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [engine, setEngine] = useState<GenerationEngine>('legacy');
  const [currentEngine, setCurrentEngine] = useState<GenerationEngine | null>(null);
  const { logActivity } = useActivityLogger();
  const { addNotification } = useNotifications();

  const {
    isRegenerating,
    currentSection,
    totalSections,
    regenerate
  } = useChunkedRegeneration();

  // Load the report's current engine when opening the dialog
  useEffect(() => {
    if (!showConfirm) return;
    let cancelled = false;
    (async () => {
      const { data } = await invokeSecureFunction('get-investment-reports', {
        reportId,
        listOptions: { select: 'generation_engine' },
      });
      if (cancelled) return;
      const stored = data?.report?.generation_engine === 'compass-40' ? 'compass-40' : 'legacy';
      setCurrentEngine(stored);
      setEngine(stored);
    })();
    return () => { cancelled = true; };
  }, [showConfirm, reportId]);

  const handleRegenerate = async () => {
    setShowConfirm(false);

    addNotification({
      type: 'report_regeneration_started',
      title: 'Report Regeneration Started',
      message: `Regenerating report for ${propertyAddress} using ${engine === 'compass-40' ? 'Compass-40 (Trimmed Legacy)' : 'Legacy Compass (Stable)'} engine...`,
      entityId: reportId
    });

    await regenerate({
      reportId,
      propertyAddress,
      generationEngine: engine,
      onProgress: (section, total) => {
        console.log(`[RegenerateReportButton] Progress: ${section}/${total}`);
      },
      onComplete: () => {
        logActivity({
          actionType: 'report_regenerated',
          entityType: 'investment_report',
          entityId: reportId,
          entityName: propertyAddress,
          metadata: { regenerationType: 'chunked', generationEngine: engine }
        });
        onRegenerated?.();
      },
      onError: (error) => {
        console.error('[RegenerateReportButton] Error:', error);
      }
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowConfirm(true)}
        disabled={isRegenerating}
      >
        {isRegenerating ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            {currentSection}/{totalSections}
          </>
        ) : (
          <>
            <RefreshCw className="mr-1 h-3 w-3" />
            Regenerate
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Report</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Choose which generation engine to use. Your manual overrides and financial calculations are always injected as context.
                </p>

                <RadioGroup
                  value={engine}
                  onValueChange={(v) => setEngine(v as GenerationEngine)}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="engine-legacy"
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      engine === 'legacy' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <RadioGroupItem id="engine-legacy" value="legacy" className="mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-success" />
                        <span className="font-medium text-foreground">Legacy Compass</span>
                        <Badge variant="secondary" className="text-[10px]">Stable</Badge>
                        {currentEngine === 'legacy' && (
                          <Badge variant="outline" className="text-[10px]">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Original engine using the database-managed structure template. Battle-tested output, predictable formatting, ~12 chunks.
                      </p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="engine-compass40"
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      engine === 'compass-40' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <RadioGroupItem id="engine-compass40" value="compass-40" className="mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">Compass-40 (Trimmed Legacy)</span>
                        <Badge className="text-[10px]">New</Badge>
                        {currentEngine === 'compass-40' && (
                          <Badge variant="outline" className="text-[10px]">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Same legacy structure, trimmed to ~38–42 pages. Keeps location, demand, risk and recommendation in full; compresses education / transport / amenity sections; removes all purchase price, yield, LVR, loan and 10-year cashflow content. Financial modelling lives in the separate Financial Analysis Report.
                      </p>

                    </div>
                  </Label>
                </RadioGroup>

                <p className="text-xs text-muted-foreground">
                  The previous version will be archived for comparison.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
