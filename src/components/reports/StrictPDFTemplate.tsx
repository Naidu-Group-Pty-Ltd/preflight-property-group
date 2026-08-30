import { forwardRef } from 'react';
import { useGlobalReportSettings } from '@/hooks/useGlobalReportSettings';
import { useBrand } from '@/branding/BrandProvider';
import { getBrandPdfPalette } from '@/branding/brandPalette';

interface StrictPDFTemplateProps {
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

export const StrictPDFTemplate = forwardRef<HTMLDivElement, StrictPDFTemplateProps>(
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

    const formatContent = (content: string, maxLines = 25) => {
      const lines = content.split('\n').filter(line => line.trim()).slice(0, maxLines);
      return lines.map((line, i) => (
        <p key={i} style={{ 
          marginBottom: '6pt', 
          fontSize: '9pt', 
          lineHeight: '1.4',
          color: '#333',
          fontFamily: 'Arial, sans-serif'
        }}>
          {cleanText(line)}
        </p>
      ));
    };

    return (
      <div ref={ref} style={{ width: '210mm', background: 'white' }}>
        {/* COVER PAGE */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(180deg, #1E3A5F 0%, #2B4F7D 100%)',
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
              fontSize: '18pt',
              fontWeight: 'bold',
              letterSpacing: '3pt',
              color: palette.goldSoft,
              fontFamily: 'Arial, sans-serif'
            }}>
              {(contactDetails.company_name || 'Property Consulting').toUpperCase()}
            </div>
            <div style={{
              fontSize: '10pt',
              color: palette.goldSoft,
              marginTop: '8pt',
              letterSpacing: '2pt',
              fontFamily: 'Arial, sans-serif'
            }}>
              PROPERTY INTELLIGENCE
            </div>
          </div>

          {/* Main Title */}
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              fontSize: '60pt',
              fontWeight: 'bold',
              marginBottom: '15pt',
              lineHeight: '1.1',
              textTransform: 'uppercase',
              letterSpacing: '2pt',
              fontFamily: 'Arial, sans-serif',
              color: '#FFFFFF'
            }}>
              {suburb}
            </div>
            <div style={{
              fontSize: '42pt',
              fontWeight: 'bold',
              color: palette.goldSoft,
              marginBottom: '25pt',
              fontFamily: 'Arial, sans-serif'
            }}>
              {state}
            </div>
            <div style={{
              fontSize: '20pt',
              color: '#FFFFFF',
              letterSpacing: '4pt',
              textTransform: 'uppercase',
              fontFamily: 'Arial, sans-serif',
              opacity: 0.9
            }}>
              SUBURB SNAPSHOT
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '9pt', color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '5pt', letterSpacing: '1pt' }}>COMPREHENSIVE PROPERTY MARKET ANALYSIS</div>
            <div>{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* PAGE 2: Location Profile */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: '#FFFFFF',
          padding: '25pt',
          pageBreakAfter: 'always',
          fontFamily: 'Arial, sans-serif',
          position: 'relative'
        }}>
          {/* Header with brand colors */}
          <div style={{ 
            borderBottom: `2pt solid ${palette.goldSoft}`, 
            paddingBottom: '12pt',
            marginBottom: '15pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '20pt', 
                color: '#1E3A5F',
                margin: 0,
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif'
              }}>
                LOCATION PROFILE
              </h1>
            </div>
            <div style={{ 
              fontSize: '8pt', 
              color: '#666', 
              textAlign: 'right',
              lineHeight: '1.3'
            }}>
              <div style={{ fontWeight: 'bold', color: '#1E3A5F' }}>{suburb}, {state}</div>
              <div>{contactDetails.company_name || 'Property Report'}</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ fontSize: '9pt', color: '#333', lineHeight: '1.5' }}>
            {formatContent(profileContent)}
          </div>

          {/* Market Data Highlights with brand colors */}
          {marketData.medianPrice !== 'N/A' && (
            <div style={{ marginTop: '20pt' }}>
              <h2 style={{ 
                fontSize: '12pt', 
                color: '#1E3A5F', 
                marginBottom: '10pt', 
                borderLeft: `3pt solid ${palette.goldSoft}`, 
                paddingLeft: '8pt',
                fontWeight: 'bold'
              }}>
                KEY MARKET METRICS
              </h2>
              <div style={{ display: 'flex', gap: '10pt', flexWrap: 'wrap' }}>
                <div style={{ 
                  flex: '1', 
                  minWidth: '120pt',
                  background: '#F5F5F5',
                  padding: '12pt',
                  border: '1pt solid #E0E0E0'
                }}>
                  <div style={{ fontSize: '7pt', color: '#666', marginBottom: '4pt', letterSpacing: '0.5pt' }}>MEDIAN PRICE</div>
                  <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#1E3A5F' }}>{marketData.medianPrice}</div>
                </div>
                <div style={{ 
                  flex: '1', 
                  minWidth: '120pt',
                  background: '#F5F5F5',
                  padding: '12pt',
                  border: '1pt solid #E0E0E0'
                }}>
                  <div style={{ fontSize: '7pt', color: '#666', marginBottom: '4pt', letterSpacing: '0.5pt' }}>WEEKLY RENT</div>
                  <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#1E3A5F' }}>{marketData.weeklyRent}</div>
                </div>
                <div style={{ 
                  flex: '1', 
                  minWidth: '120pt',
                  background: '#F5F5F5',
                  padding: '12pt',
                  border: '1pt solid #E0E0E0'
                }}>
                  <div style={{ fontSize: '7pt', color: '#666', marginBottom: '4pt', letterSpacing: '0.5pt' }}>RENTAL YIELD</div>
                  <div style={{ fontSize: '16pt', fontWeight: 'bold', color: palette.goldSoft }}>{marketData.rentalYield}</div>
                </div>
              </div>
            </div>
          )}

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '25pt',
            bottom: '25pt',
            fontSize: '9pt',
            color: '#666'
          }}>
            2
          </div>
        </div>

        {/* PAGE 3: Market Performance */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: '#FFFFFF',
          padding: '25pt',
          pageBreakAfter: 'always',
          fontFamily: 'Arial, sans-serif',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: `2pt solid ${palette.goldSoft}`, 
            paddingBottom: '12pt',
            marginBottom: '15pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <h1 style={{ 
              fontSize: '20pt', 
              color: '#1E3A5F',
              margin: 0,
              fontWeight: 'bold'
            }}>
              MARKET PERFORMANCE
            </h1>
            <div style={{ fontSize: '8pt', color: '#666', textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontWeight: 'bold', color: '#1E3A5F' }}>{suburb}, {state}</div>
              <div>{contactDetails.company_name || 'Property Report'}</div>
            </div>
          </div>

          <div style={{ fontSize: '9pt', color: '#333', lineHeight: '1.5' }}>
            {formatContent(performanceContent)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '25pt',
            bottom: '25pt',
            fontSize: '9pt',
            color: '#666'
          }}>
            3
          </div>
        </div>

        {/* PAGE 4: Demographics */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: '#FFFFFF',
          padding: '25pt',
          pageBreakAfter: 'always',
          fontFamily: 'Arial, sans-serif',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: `2pt solid ${palette.goldSoft}`, 
            paddingBottom: '12pt',
            marginBottom: '15pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <h1 style={{ 
              fontSize: '20pt', 
              color: '#1E3A5F',
              margin: 0,
              fontWeight: 'bold'
            }}>
              DEMOGRAPHICS & DEMAND
            </h1>
            <div style={{ fontSize: '8pt', color: '#666', textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontWeight: 'bold', color: '#1E3A5F' }}>{suburb}, {state}</div>
              <div>{contactDetails.company_name || 'Property Report'}</div>
            </div>
          </div>

          <div style={{ fontSize: '9pt', color: '#333', lineHeight: '1.5' }}>
            {formatContent(demographicsContent)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '25pt',
            bottom: '25pt',
            fontSize: '9pt',
            color: '#666'
          }}>
            4
          </div>
        </div>

        {/* PAGE 5: Infrastructure */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: '#FFFFFF',
          padding: '25pt',
          pageBreakAfter: 'always',
          fontFamily: 'Arial, sans-serif',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: `2pt solid ${palette.goldSoft}`, 
            paddingBottom: '12pt',
            marginBottom: '15pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <h1 style={{ 
              fontSize: '20pt', 
              color: '#1E3A5F',
              margin: 0,
              fontWeight: 'bold'
            }}>
              INFRASTRUCTURE & AMENITIES
            </h1>
            <div style={{ fontSize: '8pt', color: '#666', textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontWeight: 'bold', color: '#1E3A5F' }}>{suburb}, {state}</div>
              <div>{contactDetails.company_name || 'Property Report'}</div>
            </div>
          </div>

          <div style={{ fontSize: '9pt', color: '#333', lineHeight: '1.5' }}>
            {formatContent(infrastructureContent)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '25pt',
            bottom: '25pt',
            fontSize: '9pt',
            color: '#666'
          }}>
            5
          </div>
        </div>

        {/* PAGE 6: Investment Insights */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: '#FFFFFF',
          padding: '25pt',
          pageBreakAfter: 'always',
          fontFamily: 'Arial, sans-serif',
          position: 'relative'
        }}>
          <div style={{ 
            borderBottom: `2pt solid ${palette.goldSoft}`, 
            paddingBottom: '12pt',
            marginBottom: '15pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <h1 style={{ 
              fontSize: '20pt', 
              color: '#1E3A5F',
              margin: 0,
              fontWeight: 'bold'
            }}>
              INVESTMENT INSIGHTS
            </h1>
            <div style={{ fontSize: '8pt', color: '#666', textAlign: 'right', lineHeight: '1.3' }}>
              <div style={{ fontWeight: 'bold', color: '#1E3A5F' }}>{suburb}, {state}</div>
              <div>{contactDetails.company_name || 'Property Report'}</div>
            </div>
          </div>

          {investmentScore && (
            <div style={{
              background: '#1E3A5F',
              padding: '15pt',
              marginBottom: '20pt',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10pt', marginBottom: '8pt', color: palette.goldSoft, letterSpacing: '1pt' }}>
                OVERALL INVESTMENT SCORE
              </div>
              <div style={{ fontSize: '36pt', fontWeight: 'bold', color: '#FFFFFF' }}>
                {investmentScore}/100
              </div>
            </div>
          )}

          <div style={{ fontSize: '9pt', color: '#333', lineHeight: '1.5' }}>
            {formatContent(investmentInsights)}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '25pt',
            bottom: '25pt',
            fontSize: '9pt',
            color: '#666'
          }}>
            6
          </div>
        </div>

        {/* CONTACT PAGE */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(180deg, #1E3A5F 0%, #2B4F7D 100%)',
          padding: '40pt',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '28pt',
              fontWeight: 'bold',
              letterSpacing: '4pt',
              color: palette.goldSoft,
              marginBottom: '12pt'
            }}>
              {contactDetails.company_name || 'Property Consulting'}
            </div>
            <div style={{
              fontSize: '13pt',
              color: palette.goldSoft,
              letterSpacing: '2pt'
            }}>
              PROPERTY INTELLIGENCE & ADVISORY
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ 
              fontSize: '32pt', 
              marginBottom: '30pt',
              color: palette.goldSoft,
              fontWeight: 'bold'
            }}>
              Contact Us
            </h2>
            
            <div style={{ fontSize: '14pt', lineHeight: '2.2', color: 'rgba(255,255,255,0.9)' }}>
              {contactDetails.email && (
                <div style={{ marginBottom: '18pt' }}>
                  <strong style={{ color: palette.goldSoft }}>Email:</strong> {contactDetails.email}
                </div>
              )}
              {contactDetails.phone && (
                <div style={{ marginBottom: '18pt' }}>
                  <strong style={{ color: palette.goldSoft }}>Phone:</strong> {contactDetails.phone}
                </div>
              )}
              {contactDetails.website && (
                <div style={{ marginBottom: '18pt' }}>
                  <strong style={{ color: palette.goldSoft }}>Website:</strong> {contactDetails.website}
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ 
            fontSize: disclaimer.font_size === 'large' ? '10pt' : disclaimer.font_size === 'medium' ? '8pt' : '7pt', 
            color: 'rgba(255,255,255,0.5)', 
            textAlign: 'center',
            borderTop: '1pt solid rgba(197,165,114,0.3)',
            paddingTop: '15pt',
            lineHeight: disclaimer.font_size === 'large' ? '1.6' : disclaimer.font_size === 'medium' ? '1.5' : '1.4'
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

StrictPDFTemplate.displayName = 'StrictPDFTemplate';
