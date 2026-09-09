// Set VITE_SITE_URL at build time when deploying on a custom domain.
const configuredUrl = new URL(import.meta.env.VITE_SITE_URL || 'https://pdfedittools.netlify.app');
if (configuredUrl.protocol !== 'https:' || configuredUrl.pathname !== '/' || configuredUrl.search || configuredUrl.hash || configuredUrl.username || configuredUrl.password) {
  throw new Error('VITE_SITE_URL must be an HTTPS origin without a path, credentials, query, or fragment.');
}
export const SITE_URL = configuredUrl.origin;
