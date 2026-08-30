import { forwardRef } from 'react';
import { useGlobalReportSettings } from '@/hooks/useGlobalReportSettings';
import { useBrand } from '@/branding/BrandProvider';
import { getBrandPdfPalette } from '@/branding/brandPalette';

interface HybridPDFTemplateProps {
  suburb: string;
  state: string;
  profileContent: string;
  marketData: {
    medianPrice: string;
    weeklyRent: string;
    rentalYield: string;
  };
  performanceContent: string;
  demographicsContent: string;
  infrastructureContent: string;
  investmentInsights: string;
  investmentScore?: number;
}

export const HybridPDFTemplate = forwardRef<HTMLDivElement, HybridPDFTemplateProps>(
  ({ suburb, state, profileContent, marketData, performanceContent, demographicsContent, infrastructureContent, investmentInsights, investmentScore }, ref) => {
    const { settings } = useGlobalReportSettings();
    const { contactDetails, disclaimer } = settings;
    const { settings: brand } = useBrand();
    const palette = getBrandPdfPalette(brand.brandColor);

    const cleanText = (text: string) => {
      return text
        .replace(/^[*#]+\s*/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .trim();
    };

    const formatContent = (content: string) => {
      const lines = content.split('\n').filter(line => line.trim());
      return lines.map((line, i) => (
        <p key={i} style={{ 
          marginBottom: '8pt', 
          fontSize: '11pt', 
          lineHeight: '1.5',
          color: '#333'
        }}>
          {cleanText(line)}
        </p>
      ));
    };

    return (
      <div ref={ref} style={{ width: '210mm', background: 'white' }}>
        {/* COVER PAGE - Keeping original design */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          position: 'relative',
          padding: '40pt',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
          pageBreakAfter: 'always'
        }}>
          {/* Logo/Header */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              letterSpacing: '2pt',
              color: '#00d4ff'
            }}>
              {(contactDetails.company_name || 'Property Consulting').toUpperCase()}
            </div>
            <div style={{
              fontSize: '9pt',
              color: '#888',
              marginTop: '5pt'
            }}>
              PROPERTY INTELLIGENCE
            </div>
          </div>

          {/* Main Title */}
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontSize: '72pt',
              fontWeight: 'bold',
              marginBottom: '20pt',
              lineHeight: '1',
              textTransform: 'uppercase',
              letterSpacing: '3pt'
            }}>
              {suburb}
            </div>
            <div style={{
              fontSize: '48pt',
              fontWeight: 'bold',
              color: '#00d4ff',
              marginBottom: '30pt'
            }}>
              {state}
            </div>
            <div style={{
              fontSize: '24pt',
              color: '#ccc',
              letterSpacing: '4pt',
              textTransform: 'uppercase'
            }}>
              SUBURB SNAPSHOT
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '10pt', color: '#666' }}>
            <div style={{ marginBottom: '5pt' }}>COMPREHENSIVE PROPERTY MARKET ANALYSIS</div>
            <div>{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* PAGE 2: Location Profile */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'white',
          padding: '30pt',
          pageBreakAfter: 'always',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ 
            borderBottom: '3pt solid #00d4ff', 
            paddingBottom: '15pt',
            marginBottom: '20pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '28pt', 
              color: '#1a1a2e',
              margin: 0
            }}>
              Location Profile
            </h1>
            <div style={{ fontSize: '10pt', color: '#666', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{suburb}, {state}</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ fontSize: '11pt', color: '#333', lineHeight: '1.6' }}>
            {formatContent(profileContent)}
          </div>

          {/* Market Data Highlights */}
          {marketData.medianPrice !== 'N/A' && (
            <div style={{ marginTop: '30pt' }}>
              <h2 style={{ fontSize: '16pt', color: '#1a1a2e', marginBottom: '15pt', borderLeft: '4pt solid #00d4ff', paddingLeft: '10pt' }}>
                Key Market Metrics
              </h2>
              <div style={{ display: 'flex', gap: '15pt', flexWrap: 'wrap' }}>
                <div style={{ 
                  flex: '1', 
                  minWidth: '150pt',
                  background: '#f8f9fa',
                  padding: '15pt',
                  borderRadius: '5pt',
                  border: '1pt solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '9pt', color: '#666', marginBottom: '5pt' }}>MEDIAN PRICE</div>
                  <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#1a1a2e' }}>{marketData.medianPrice}</div>
                </div>
                <div style={{ 
                  flex: '1', 
                  minWidth: '150pt',
                  background: '#f8f9fa',
                  padding: '15pt',
                  borderRadius: '5pt',
                  border: '1pt solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '9pt', color: '#666', marginBottom: '5pt' }}>WEEKLY RENT</div>
                  <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#1a1a2e' }}>{marketData.weeklyRent}</div>
                </div>
                <div style={{ 
                  flex: '1', 
                  minWidth: '150pt',
                  background: '#f8f9fa',
                  padding: '15pt',
                  borderRadius: '5pt',
                  border: '1pt solid #e0e0e0'
                }}>
                  <div style={{ fontSize: '9pt', color: '#666', marginBottom: '5pt' }}>RENTAL YIELD</div>
                  <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#00d4ff' }}>{marketData.rentalYield}</div>
                </div>
              </div>
            </div>
          )}

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '30pt',
            bottom: '30pt',
            fontSize: '10pt',
            color: '#666'
          }}>
            2
          </div>
        </div>

        {/* PAGE 3: Market Performance */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'white',
          padding: '30pt',
          pageBreakAfter: 'always',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: '3pt solid #00d4ff', 
            paddingBottom: '15pt',
            marginBottom: '20pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '28pt', 
              color: '#1a1a2e',
              margin: 0
            }}>
              Market Performance
            </h1>
            <div style={{ fontSize: '10pt', color: '#666', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{suburb}, {state}</div>
            </div>
          </div>

          <div style={{ fontSize: '11pt', color: '#333', lineHeight: '1.6' }}>
            {formatContent(performanceContent)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '30pt',
            bottom: '30pt',
            fontSize: '10pt',
            color: '#666'
          }}>
            3
          </div>
        </div>

        {/* PAGE 4: Demographics */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'white',
          padding: '30pt',
          pageBreakAfter: 'always',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: '3pt solid #00d4ff', 
            paddingBottom: '15pt',
            marginBottom: '20pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '28pt', 
              color: '#1a1a2e',
              margin: 0
            }}>
              Demographics & Demand
            </h1>
            <div style={{ fontSize: '10pt', color: '#666', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{suburb}, {state}</div>
            </div>
          </div>

          <div style={{ fontSize: '11pt', color: '#333', lineHeight: '1.6' }}>
            {formatContent(demographicsContent)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '30pt',
            bottom: '30pt',
            fontSize: '10pt',
            color: '#666'
          }}>
            4
          </div>
        </div>

        {/* PAGE 5: Infrastructure */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'white',
          padding: '30pt',
          pageBreakAfter: 'always',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: '3pt solid #00d4ff', 
            paddingBottom: '15pt',
            marginBottom: '20pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '28pt', 
              color: '#1a1a2e',
              margin: 0
            }}>
              Infrastructure & Amenities
            </h1>
            <div style={{ fontSize: '10pt', color: '#666', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{suburb}, {state}</div>
            </div>
          </div>

          <div style={{ fontSize: '11pt', color: '#333', lineHeight: '1.6' }}>
            {formatContent(infrastructureContent)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '30pt',
            bottom: '30pt',
            fontSize: '10pt',
            color: '#666'
          }}>
            5
          </div>
        </div>

        {/* PAGE 6: Investment Insights */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'white',
          padding: '30pt',
          pageBreakAfter: 'always',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: '3pt solid #00d4ff', 
            paddingBottom: '15pt',
            marginBottom: '20pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '28pt', 
              color: '#1a1a2e',
              margin: 0
            }}>
              Investment Insights
            </h1>
            <div style={{ fontSize: '10pt', color: '#666', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{suburb}, {state}</div>
            </div>
          </div>

          {investmentScore && (
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              padding: '20pt',
              borderRadius: '8pt',
              marginBottom: '25pt',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12pt', marginBottom: '10pt', color: '#ccc' }}>
                OVERALL INVESTMENT SCORE
              </div>
              <div style={{ fontSize: '48pt', fontWeight: 'bold', color: '#00d4ff' }}>
                {investmentScore}/100
              </div>
            </div>
          )}

          <div style={{ fontSize: '11pt', color: '#333', lineHeight: '1.6' }}>
            {formatContent(investmentInsights)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '30pt',
            bottom: '30pt',
            fontSize: '10pt',
            color: '#666'
          }}>
            6
          </div>
        </div>

        {/* CONTACT PAGE - Using global settings */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '40pt',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24pt',
              fontWeight: 'bold',
              letterSpacing: '3pt',
              color: '#00d4ff',
              marginBottom: '10pt'
            }}>
              {contactDetails.company_name || 'Property Consulting'}
            </div>
            <div style={{
              fontSize: '12pt',
              color: '#888',
              letterSpacing: '1pt'
            }}>
              PROPERTY INTELLIGENCE & ADVISORY
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ 
              fontSize: '32pt', 
              marginBottom: '30pt',
              color: '#00d4ff'
            }}>
              Contact Us
            </h2>
            
            <div style={{ fontSize: '14pt', lineHeight: '2', color: '#ccc' }}>
              {contactDetails.email && (
                <div style={{ marginBottom: '15pt' }}>
                  <strong style={{ color: 'white' }}>Email:</strong> {contactDetails.email}
                </div>
              )}
              {contactDetails.phone && (
                <div style={{ marginBottom: '15pt' }}>
                  <strong style={{ color: 'white' }}>Phone:</strong> {contactDetails.phone}
                </div>
              )}
              {contactDetails.website && (
                <div style={{ marginBottom: '15pt' }}>
                  <strong style={{ color: 'white' }}>Website:</strong> {contactDetails.website}
                </div>
              )}
              {contactDetails.address && (
                <div style={{ marginBottom: '15pt' }}>
                  <strong style={{ color: 'white' }}>Address:</strong> {contactDetails.address}
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ 
            fontSize: '8pt', 
            color: '#666', 
            textAlign: 'center',
            borderTop: '1pt solid #333',
            paddingTop: '15pt'
          }}>
            {disclaimer.is_enabled && disclaimer.text ? (
              <p style={{ margin: '5pt 0' }}>
                {disclaimer.text}
              </p>
            ) : (
              <p style={{ margin: '5pt 0' }}>
                This report is for informational purposes only and should not be considered as financial or investment advice.
              </p>
            )}
            <p style={{ margin: '5pt 0' }}>
              © {new Date().getFullYear()} {contactDetails.company_name || 'Property Report'}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

HybridPDFTemplate.displayName = 'HybridPDFTemplate';
