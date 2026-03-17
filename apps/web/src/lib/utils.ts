/**
 * Extracts the display domain from a URL, stripping the www. prefix.
 * Falls back to the raw URL string if parsing fails.
 */
export function getDomain(url: string): string {
   try {
      return new URL(url).hostname.replace('www.', '');
   } catch {
      return url;
   }
}

/**
 * Returns the URL if its protocol is http or https, otherwise '#'.
 * Prevents javascript: and other unsafe protocols from being used as hrefs.
 */
export function getSafeUrl(url: string): string {
   try {
      const { protocol } = new URL(url);
      return protocol === 'https:' || protocol === 'http:' ? url : '#';
   } catch {
      return '#';
   }
}
