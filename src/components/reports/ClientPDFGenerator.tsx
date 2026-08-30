import { forwardRef } from 'react';
import { PixelPerfectPDFGenerator, type PixelPerfectPDFGeneratorHandle } from './PixelPerfectPDFGenerator';

type ReportTier = 'compass' | 'briefing' | 'snapshot' | 'financial';

interface InvestmentReportData {
  id: string;
  property_address: string;
  report_content: string;
  demographics_data?: any;
  economic_data?: any;
  financial_calculations?: any;
  investment_score?: any;
  location_intelligence?: any;
  manual_overrides?: any;
  report_tier?: string;
  report_variant?: string | null;
  pdf_url?: string | null;
}

interface ClientPDFGeneratorProps {
  report: InvestmentReportData;
  includeSources?: boolean;
  includeScoring?: boolean;
}

export const ClientPDFGenerator = forwardRef<PixelPerfectPDFGeneratorHandle, ClientPDFGeneratorProps>(({ report, includeSources = true, includeScoring = true }, ref) => {
  // Merge manual_overrides with financial_calculations for PDF generation
  const mergedFinancialData = (() => {
    if (!report.manual_overrides || Object.keys(report.manual_overrides).length === 0) {
      return report.financial_calculations;
    }

    console.log('📊 PDF Generator: Merging manual overrides into financial data');
    console.log('  Override fields:', Object.keys(report.manual_overrides));

    // Create deep copy of financial calculations
    const merged = JSON.parse(JSON.stringify(report.financial_calculations || {}));
    
    // Map flat override keys to nested structure
    const overrideMapping: Record<string, string> = {
      'purchasePrice': 'initialCosts.propertyValue',
      'stampDuty': 'initialCosts.stampDuty',
      'depositValue': 'initialCosts.deposit',
      'loanToValueRatio': 'keyMetrics.lvr',
      'interestRate': 'loanDetails.interestRate',
      'weeklyRent': 'income.weeklyRent',
      'councilRates': 'annualCosts.councilRates',
      'waterRates': 'annualCosts.waterRates',
      'bodyCorporateFees': 'annualCosts.strataFees',
      'buildingLandlordInsurance': 'annualCosts.landlordInsurance',
      'propertyManagementFees': 'annualCosts.propertyManagementPercent',
      'solicitorFees': 'initialCosts.legalFees',
      'repairsMaintenance': 'annualCosts.maintenance',
      'lettingFees': 'annualCosts.lettingFees',
      'landTax': 'annualCosts.landTax',
      'capitalGrowth': 'assumptions.capitalGrowth',
      'buildPrice': 'initialCosts.buildPrice',
      'landPrice': 'initialCosts.landPrice',
      // Cash flow specific fields
      'marketValueNow': 'cashFlow.marketValueNow',
      'cpiGrowthRate': 'cashFlow.cpiGrowthRate',
    };
    
    // Apply overrides to the nested structure
    for (const [flatKey, overrideValue] of Object.entries(report.manual_overrides)) {
      const nestedPath = overrideMapping[flatKey];
      if (nestedPath) {
        const keys = nestedPath.split('.');
        let current = merged;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = overrideValue;
        console.log(`  ✓ Applied override: ${flatKey} -> ${nestedPath} = ${overrideValue}`);
      }
    }
    
    return merged;
  })();

  // Transform the report data to match PixelPerfectPDFGenerator expectations
  // Ensure address has a fallback to prevent .trim() errors in PDF generation
  const transformedReport = {
    id: report.id,
    address: report.property_address || 'Property Report',
    content: report.report_content || '',
    created_at: new Date().toISOString(),
    pdf_url: report.pdf_url,
    enhanced_data: {
      domainData: null,
      absData: report.demographics_data,
      rbaData: report.economic_data,
      financialData: mergedFinancialData,
      locationData: report.location_intelligence,
      investmentScore: report.investment_score,
    }
  };

  // Pass report tier to the PDF generator (defaults to 'compass' for backward compatibility)
  const reportTier = (report.report_variant || report.report_tier || 'compass') as ReportTier;

  return <PixelPerfectPDFGenerator ref={ref} report={transformedReport} includeSources={includeSources} includeScoring={includeScoring} reportTier={reportTier} />;
});

ClientPDFGenerator.displayName = 'ClientPDFGenerator';
