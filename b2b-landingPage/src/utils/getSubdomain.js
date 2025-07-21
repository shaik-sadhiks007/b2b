// Utility to extract subdomain from current hostname
export function getSubdomain() {
  const host = window.location.hostname;
  // Remove www. if present
  const cleanHost = host.replace(/^www\./, '');
  // Handle test environment
  // If host is customer.test.shopatb2b.com, treat as main domain
  if (cleanHost === 'customer.test.shopatb2b.com') {
    return null;
  }
  // If host ends with .test.shopatb2b.com and is not customer, extract subdomain
  const testMatch = cleanHost.match(/^([^.]+)\.test\.shopatb2b\.com$/);
  if (testMatch && testMatch[1] !== 'customer') {
    return testMatch[1];
  }
  // Production: shopatb2b.com => no subdomain
  // pantulugaarimess.shopatb2b.com => subdomain = pantulugaarimess
  const parts = cleanHost.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return null;
} 