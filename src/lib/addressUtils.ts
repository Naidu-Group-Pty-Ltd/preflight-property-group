import { PropertyListing } from '@/lib/airtable';

/**
 * Extract Australian state abbreviation from an address string.
 */
export function extractAUState(address: string): string | null {
  const match = address.match(/\b(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\b/i);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Extract Australian postcode from an address string.
 */
export function extractPostcode(address: string): string | null {
  const match = address.match(/\b(\d{4})\b/);
  return match ? match[0] : null;
}

/**
 * Build a full formatted address: "Street, Suburb, STATE Postcode"
 */
export function buildFullAddress(listing: PropertyListing): string {
  const parts: string[] = [];
  if (listing.address && listing.address !== 'Unknown Address') parts.push(listing.address);
  if (listing.suburb && listing.suburb !== 'Unknown' && listing.suburb !== 'Unknown Suburb') parts.push(listing.suburb);

  const stateStr = listing.state || extractAUState(listing.address || '');
  const postcodeStr = listing.zipCode || extractPostcode(listing.address || '');
  if (stateStr || postcodeStr) {
    parts.push([stateStr, postcodeStr].filter(Boolean).join(' '));
  }

  return parts.join(', ') || listing.address || '';
}
