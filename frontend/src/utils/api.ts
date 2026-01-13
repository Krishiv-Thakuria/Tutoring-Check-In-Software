const rawBaseUrl = process.env.REACT_APP_API_BASE_URL ?? '';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

const baseUrl = normalizeBaseUrl(rawBaseUrl);

/**
 * Build an absolute API URL when REACT_APP_API_BASE_URL is set, otherwise use a relative URL.
 * This keeps local dev working via CRA's proxy while allowing deployments (e.g. Vercel)
 * to point at a separately deployed backend.
 */
export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

