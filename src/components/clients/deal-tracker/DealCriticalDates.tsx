import { useState } from 'react';
import { format, differenceInDays, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Deal, DealType } from './types';

interface DealCriticalDatesProps {
  deal: Deal;
  onUpdate: (data: Partial<Deal>) => void;
}

interface DateFieldConfig {
  key: keyof Deal;
  label: string;
  showFor: DealType[] | 'all';
  isUrgent?: boolean;
}

const DATE_FIELDS: DateFieldConfig[] = [
  // Shared
  { key: 'finance_clause_expiry', label: 'Finance Clause Expiry', showFor: ['existing_property', 'house_and_land'], isUrgent: true },
  { key: 'settlement_date', label: 'Settlement Date', showFor: 'all', isUrgent: true },
  // H&L only
  { key: 'land_settlement_date', label: 'Land Settlement Date', showFor: ['house_and_land'] },
  { key: 'expected_build_start', label: 'Expected Build Start', showFor: ['house_and_land'] },
  { key: 'estimated_completion', label: 'Estimated Completion', showFor: ['house_and_land'] },
  // Refinance only
  { key: 'lodgement_date', label: 'Lodgement Date', showFor: ['refinance'] },
  { key: 'valuation_date', label: 'Valuation Date', showFor: ['refinance'] },
  { key: 'conditional_approval_date', label: 'Conditional Approval', showFor: ['refinance'], isUrgent: true },
  { key: 'discharge_authority_date', label: 'Discharge Authority Submitted', showFor: ['refinance'], isUrgent: true },
  { key: 'formal_approval_date', label: 'Formal Approval', showFor: ['refinance'] },
  { key: 'loan_docs_signed_date', label: 'Loan Documents Signed', showFor: ['refinance'] },
  { key: 'clawback_expiry_date', label: 'Clawback Expiry', showFor: ['refinance'], isUrgent: true },
];

function DateWarningBadge({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  const daysAway = differenceInDays(date, new Date());

  if (isPast(date)) {
    return <Badge variant="destructive" className="text-[10px]">Overdue by {Math.abs(daysAway)}d</Badge>;
  }
  if (daysAway <= 5) {
    return <Badge className="text-[10px] bg-destructive">{daysAway}d away</Badge>;
  }
  if (daysAway <= 14) {
    return <Badge className="text-[10px] bg-brand-500">{daysAway}d away</Badge>;
  }
  return <Badge variant="outline" className="text-[10px]">{daysAway}d away</Badge>;
}

function DatePickerField({ value, label, onChange }: { value: string | null; label: string; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground truncate">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {value && <DateWarningBadge dateStr={value} />}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {value ? format(new Date(value), 'dd MMM yyyy') : 'Set'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => {
                onChange(date ? format(date, 'yyyy-MM-dd') : null);
                setOpen(false);
              }}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function DealCriticalDates({ deal, onUpdate }: DealCriticalDatesProps) {
  const visibleFields = DATE_FIELDS.filter(f => {
    if (f.showFor === 'all') return true;
    return f.showFor.includes(deal.deal_type);
  });

  const urgentDates = visibleFields.filter(f => {
    const val = deal[f.key] as string | null;
    if (!val || !f.isUrgent) return false;
    const daysAway = differenceInDays(new Date(val), new Date());
    return daysAway <= 7;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Critical Dates
          {urgentDates.length > 0 && (
            <Badge variant="destructive" className="text-[10px] ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {urgentDates.length} urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleFields.map((field) => {
            const value = deal[field.key] as string | null;
            return (
              <DatePickerField
                key={field.key}
                value={value}
                label={field.label}
                onChange={(d) => onUpdate({ [field.key]: d } as Partial<Deal>)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
