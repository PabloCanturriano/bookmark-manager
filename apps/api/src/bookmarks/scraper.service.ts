import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as net from 'net';
import * as dns from 'dns/promises';

export interface ScrapedMetadata {
   title: string | null;
   description: string | null;
   ogImage: string | null;
   favicon: string | null;
}

@Injectable()
export class ScraperService {
   private readonly logger = new Logger(ScraperService.name);

   async scrape(url: string): Promise<ScrapedMetadata> {
      try {
         await this.assertPublicHost(url);

         const res = await fetch(url, {
            headers: { 'User-Agent': 'BookmarkManager/1.0' },
            // 10s timeout
            signal: AbortSignal.timeout(10_000),
         });

         if (!res.ok) return this.empty();

         const html = await res.text();
         const $ = cheerio.load(html);

         const origin = new URL(url).origin;

         const title =
            $('meta[property="og:title"]').attr('content') ??
            $('title').first().text().trim() ??
            null;

         const description =
            $('meta[property="og:description"]').attr('content') ??
            $('meta[name="description"]').attr('content') ??
            null;

         const ogImage = $('meta[property="og:image"]').attr('content') ?? null;

         const faviconHref =
            $('link[rel="icon"]').attr('href') ??
            $('link[rel="shortcut icon"]').attr('href') ??
            '/favicon.ico';

         const favicon = faviconHref.startsWith('http')
            ? faviconHref
            : `${origin}${faviconHref.startsWith('/') ? '' : '/'}${faviconHref}`;

         return {
            title: title || null,
            description: description || null,
            ogImage,
            favicon,
         };
      } catch (err) {
         this.logger.warn(`Scraping failed for ${url}: ${(err as Error).message}`);
         return this.empty();
      }
   }

   /**
    * Resolves the hostname and rejects if any resulting IP is private/reserved.
    * Prevents SSRF attacks targeting internal services or cloud metadata endpoints
    * (e.g. http://169.254.169.254 on AWS).
    */
   private async assertPublicHost(url: string): Promise<void> {
      let hostname: string;
      try {
         hostname = new URL(url).hostname;
      } catch {
         throw new BadRequestException('Invalid URL');
      }

      // Reject if the hostname is already a private IP literal
      if (net.isIP(hostname) && isPrivateIp(hostname)) {
         throw new BadRequestException('URL resolves to a private address');
      }

      // Resolve DNS and check all returned addresses
      try {
         const addresses = await dns.lookup(hostname, { all: true });
         for (const { address } of addresses) {
            if (isPrivateIp(address)) {
               throw new BadRequestException('URL resolves to a private address');
            }
         }
      } catch (err) {
         if (err instanceof BadRequestException) throw err;
         // DNS resolution failure — treat as unscrapeable, not a hard error
         this.logger.warn(`DNS lookup failed for ${hostname}: ${(err as Error).message}`);
      }
   }

   private empty(): ScrapedMetadata {
      return { title: null, description: null, ogImage: null, favicon: null };
   }
}

// Private/reserved IP ranges that must never be fetched (SSRF prevention)
const PRIVATE_RANGES = [
   /^127\./, // loopback
   /^10\./, // RFC 1918
   /^172\.(1[6-9]|2\d|3[01])\./, // RFC 1918
   /^192\.168\./, // RFC 1918
   /^169\.254\./, // link-local (AWS/GCP metadata)
   /^::1$/, // IPv6 loopback
   /^fc00:/, // IPv6 unique local
   /^fe80:/, // IPv6 link-local
];

function isPrivateIp(ip: string): boolean {
   return PRIVATE_RANGES.some((re) => re.test(ip));
}
