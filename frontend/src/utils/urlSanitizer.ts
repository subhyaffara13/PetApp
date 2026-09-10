/**
 * Sanitizes a media URL before rendering in DOM attributes (img src, video src, etc.)
 * Prevents Cross-Site Scripting (XSS) via javascript: or data:text/html payloads.
 */
export function sanitizeMediaUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Allow blob: URLs (from local file uploads) and relative URLs
  if (trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Allow safe data URIs for images/videos
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:video/')
  ) {
    return trimmed;
  }

  // Check valid http/https protocol
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // If not a valid absolute URL, check if it's a safe relative path
    if (/^[a-zA-Z0-9_\-./%?&=#+]+$/.test(trimmed)) {
      return trimmed;
    }
  }

  return '';
}
