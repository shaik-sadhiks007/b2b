// Utility to extract subdomain from current hostname
export function getSubdomain() {
  const host = window.location.hostname;
  // Remove www. if present
  const cleanHost = host.replace(/^www\./, '');
  // shopatb2b.com => no subdomain
  // pantulugaarimess.shopatb2b.com => subdomain = pantulugaarimess
  const parts = cleanHost.split('.');
  if (parts.length > 2) {
    return parts[0];
  }
  return null;
} 