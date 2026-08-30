import { forwardRef } from 'react';
import { useGlobalReportSettings } from '@/hooks/useGlobalReportSettings';
import { useBrand } from '@/branding/BrandProvider';
import { getBrandPdfPalette } from '@/branding/brandPalette';

interface ClientPDFTemplateProps {
  suburb: string;
  state: string;
  profileContent: string;
  marketData: {
    medianPrice?: string;
    weeklyRent?: string;
    rentalYield?: string;
  };
  performanceContent: string;
  demographicsContent: string;
  infrastructureContent: string;
  investmentInsights: string;
  investmentScore?: number;
}

export const ClientPDFTemplate = forwardRef<HTMLDivElement, ClientPDFTemplateProps>(
  ({ suburb, state, profileContent, marketData, performanceContent, demographicsContent, infrastructureContent, investmentInsights, investmentScore }, ref) => {
    const { settings, isLoading } = useGlobalReportSettings();
    const { contactDetails, disclaimer } = settings;
    const { settings: brand } = useBrand();
    const palette = getBrandPdfPalette(brand.brandColor);

    const cleanText = (text: string) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/^[-*]\s+/gm, '• ')
        .replace(/^\d+\.\s+/gm, '')
        .trim();
    };

    return (
      <div ref={ref} style={{ width: '210mm', background: 'white' }}>
        {/* Page 1: Cover */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Decorative curves */}
          <div style={{
            position: 'absolute',
            left: '-50px',
            top: '0',
            width: '200px',
            height: '100%',
            background: `linear-gradient(90deg, rgba(${palette.goldRgb}, 0.15) 0%, transparent 100%)`,
            borderRadius: '0 50% 50% 0',
          }} />
          <div style={{
            position: 'absolute',
            right: '-50px',
            top: '0',
            width: '200px',
            height: '100%',
            background: `linear-gradient(270deg, rgba(${palette.goldRgb}, 0.15) 0%, transparent 100%)`,
            borderRadius: '50% 0 0 50%',
          }} />
          
          {/* Logo */}
          <div style={{
            width: '120px',
            height: '120px',
            border: `3px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            background: `rgba(${palette.goldRgb}, 0.1)`,
          }}>
            <span style={{ fontSize: '64px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>
              {(contactDetails.company_name || 'P').charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '48px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 20px 0',
            letterSpacing: '4px',
          }}>
            {(contactDetails.company_name || 'Property Consulting').toUpperCase()}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            color: '#ffffff',
            textAlign: 'center',
            margin: '0',
            letterSpacing: '2px',
          }}>
            YOUR DEDICATED PROPERTY PARTNER
          </p>
        </div>

      {/* Page 2: Location & Profile */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}>
          {/* Chevron pattern */}
          <div style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100px',
            height: '100%',
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(${palette.goldRgb}, 0.05) 10px, rgba(${palette.goldRgb}, 0.05) 20px)`,
            transform: 'skewY(-45deg)',
            transformOrigin: 'top left',
          }} />

          {/* Logo */}
          <div style={{
            position: 'absolute',
            right: '40px',
            top: '40px',
            width: '60px',
            height: '60px',
            border: `2px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>N</span>
          </div>

          {/* Header */}
          <h2 style={{
            fontSize: '42px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            margin: '0 0 40px 0',
            letterSpacing: '3px',
          }}>
            SUBURB SNAPSHOT
          </h2>

          {/* Location Section */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}>
              LOCATION
            </h3>
            <p style={{ fontSize: '14px', color: palette.gold, margin: '0 0 10px 0', lineHeight: '1.6' }}>
              SUBURB / AREA : {suburb.toUpperCase()}
            </p>
            <p style={{ fontSize: '14px', color: palette.gold, margin: '0', lineHeight: '1.6' }}>
              STATE : {state.toUpperCase()}
            </p>
          </div>

          {/* Profile Section */}
          <div>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}>
              PROFILE
            </h3>
            <p style={{
              fontSize: '12px',
              color: palette.gold,
              lineHeight: '1.8',
              margin: '0',
              textAlign: 'justify',
            }}>
              {cleanText(profileContent).substring(0, 800)}
            </p>
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '40px',
            bottom: '40px',
            fontSize: '12px',
            color: palette.gold,
            fontFamily: 'serif',
          }}>
            2
          </div>

          {/* Decorative curve */}
          <div style={{
            position: 'absolute',
            right: '-50px',
            bottom: '0',
            width: '200px',
            height: '400px',
            background: `linear-gradient(270deg, rgba(${palette.goldRgb}, 0.15) 0%, transparent 100%)`,
            borderRadius: '50% 0 0 0',
          }} />
        </div>

      {/* Page 3: Property Market */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}>
          {/* Logo */}
          <div style={{
            position: 'absolute',
            right: '40px',
            top: '40px',
            width: '60px',
            height: '60px',
            border: `2px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>N</span>
          </div>

          <h2 style={{
            fontSize: '42px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            margin: '0 0 40px 0',
            letterSpacing: '3px',
          }}>
            SUBURB SNAPSHOT
          </h2>

          <div>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 30px 0',
              letterSpacing: '2px',
            }}>
              PROPERTY MARKET
            </h3>

            {/* Market data table */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: `1px solid rgba(${palette.goldRgb}, 0.3)`,
              }}>
                <span style={{ fontSize: '14px', color: palette.gold, fontWeight: 'bold' }}>MEDIAN HOUSE PRICE</span>
                <span style={{ fontSize: '14px', color: palette.gold }}>{marketData.medianPrice || 'N/A'}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: `1px solid rgba(${palette.goldRgb}, 0.3)`,
              }}>
                <span style={{ fontSize: '14px', color: palette.gold, fontWeight: 'bold' }}>MEDIAN WEEKLY RENT</span>
                <span style={{ fontSize: '14px', color: palette.gold }}>{marketData.weeklyRent || 'N/A'}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 20px',
              }}>
                <span style={{ fontSize: '14px', color: palette.gold, fontWeight: 'bold' }}>GROSS RENTAL YIELD</span>
                <span style={{ fontSize: '14px', color: palette.gold }}>{marketData.rentalYield || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '40px',
            bottom: '40px',
            fontSize: '12px',
            color: palette.gold,
            fontFamily: 'serif',
          }}>
            3
          </div>
        </div>

      {/* Page 4: Market Performance */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute',
            right: '40px',
            top: '40px',
            width: '60px',
            height: '60px',
            border: `2px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>N</span>
          </div>

          <h2 style={{
            fontSize: '42px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            margin: '0 0 40px 0',
            letterSpacing: '3px',
          }}>
            SUBURB SNAPSHOT
          </h2>

          <div>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}>
              MARKET PERFORMANCE
            </h3>
            <div style={{
              fontSize: '12px',
              color: palette.gold,
              lineHeight: '2',
              whiteSpace: 'pre-wrap',
            }}>
              {cleanText(performanceContent)}
            </div>
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '40px',
            bottom: '40px',
            fontSize: '12px',
            color: palette.gold,
            fontFamily: 'serif',
          }}>
            4
          </div>
        </div>

      {/* Page 5: Demographics */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute',
            right: '40px',
            top: '40px',
            width: '60px',
            height: '60px',
            border: `2px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>N</span>
          </div>

          <h2 style={{
            fontSize: '42px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            margin: '0 0 40px 0',
            letterSpacing: '3px',
          }}>
            SUBURB SNAPSHOT
          </h2>

          <div>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}>
              DEMOGRAPHICS
            </h3>
            <div style={{
              fontSize: '12px',
              color: palette.gold,
              lineHeight: '2',
              whiteSpace: 'pre-wrap',
            }}>
              {cleanText(demographicsContent)}
            </div>
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '40px',
            bottom: '40px',
            fontSize: '12px',
            color: palette.gold,
            fontFamily: 'serif',
          }}>
            5
          </div>
        </div>

      {/* Page 6: Infrastructure */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute',
            right: '40px',
            top: '40px',
            width: '60px',
            height: '60px',
            border: `2px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>N</span>
          </div>

          <h2 style={{
            fontSize: '42px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            margin: '0 0 40px 0',
            letterSpacing: '3px',
          }}>
            SUBURB SNAPSHOT
          </h2>

          <div>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}>
              INFRASTRUCTURE & AMENITIES
            </h3>
            <div style={{
              fontSize: '12px',
              color: palette.gold,
              lineHeight: '2',
              whiteSpace: 'pre-wrap',
            }}>
              {cleanText(infrastructureContent)}
            </div>
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '40px',
            bottom: '40px',
            fontSize: '12px',
            color: palette.gold,
            fontFamily: 'serif',
          }}>
            6
          </div>
        </div>

      {/* Page 7: Investment Insights */}
      <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          pageBreakAfter: 'always',
          padding: '40px 60px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute',
            right: '40px',
            top: '40px',
            width: '60px',
            height: '60px',
            border: `2px solid ${palette.gold}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '32px', color: palette.gold, fontFamily: 'serif', fontWeight: 'bold' }}>N</span>
          </div>

          <h2 style={{
            fontSize: '42px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            margin: '0 0 40px 0',
            letterSpacing: '3px',
          }}>
            SUBURB SNAPSHOT
          </h2>

          <div>
            <h3 style={{
              fontSize: '24px',
              color: palette.gold,
              fontFamily: 'serif',
              margin: '0 0 20px 0',
              letterSpacing: '2px',
            }}>
              KEY INVESTOR INSIGHTS
            </h3>
            <div style={{
              fontSize: '12px',
              color: palette.gold,
              lineHeight: '2',
              whiteSpace: 'pre-wrap',
              marginBottom: '30px',
            }}>
              {cleanText(investmentInsights)}
            </div>

            {investmentScore && (
              <div style={{
                marginTop: '40px',
                padding: '20px',
                border: `2px solid ${palette.gold}`,
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                <span style={{
                  fontSize: '24px',
                  color: palette.gold,
                  fontFamily: 'serif',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                }}>
                  INVESTMENT SCORE: {investmentScore}/10
                </span>
              </div>
            )}
          </div>

          {/* Page Number */}
          <div style={{
            position: 'absolute',
            left: '40px',
            bottom: '40px',
            fontSize: '12px',
            color: palette.gold,
            fontFamily: 'serif',
          }}>
            7
          </div>
        </div>

        {/* Page 8: Contact */}
        <div className="pdf-page" style={{
          width: '210mm',
          height: '297mm',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '60px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontSize: '36px',
            color: palette.gold,
            fontFamily: 'serif',
            fontWeight: 'bold',
            marginBottom: '40px',
            letterSpacing: '3px',
          }}>
            CONTACT US
          </h2>

          <div style={{ marginBottom: '40px' }}>
            {contactDetails.website && (
              <p style={{ fontSize: '14px', color: palette.gold, margin: '0 0 10px 0' }}>
                <strong>WEBSITE:</strong> {contactDetails.website}
              </p>
            )}
            {contactDetails.email && (
              <p style={{ fontSize: '14px', color: palette.gold, margin: '0 0 10px 0' }}>
                <strong>EMAIL:</strong> {contactDetails.email}
              </p>
            )}
            {contactDetails.phone && (
              <p style={{ fontSize: '14px', color: palette.gold, margin: '0 0 10px 0' }}>
                <strong>PHONE:</strong> {contactDetails.phone}
              </p>
            )}
            {contactDetails.address && (
              <p style={{ fontSize: '14px', color: palette.gold, margin: '0 0 10px 0' }}>
                <strong>ADDRESS:</strong> {contactDetails.address}
              </p>
            )}
            {contactDetails.abn && (
              <p style={{ fontSize: '14px', color: palette.gold, margin: '0' }}>
                <strong>ABN:</strong> {contactDetails.abn}
              </p>
            )}
          </div>

          {disclaimer.is_enabled && disclaimer.text && (
            <p style={{
              fontSize: '9px',
              color: '#999',
              lineHeight: '1.6',
              textAlign: 'justify',
            }}>
              {disclaimer.text}
            </p>
          )}
        </div>
      </div>
    );
  }
);

ClientPDFTemplate.displayName = 'ClientPDFTemplate';
