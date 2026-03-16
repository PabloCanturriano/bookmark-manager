import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";

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
      const res = await fetch(url, {
        headers: { "User-Agent": "BookmarkManager/1.0" },
        // 10s timeout
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) return this.empty();

      const html = await res.text();
      const $ = cheerio.load(html);

      const origin = new URL(url).origin;

      const title =
        $('meta[property="og:title"]').attr("content") ??
        $("title").first().text().trim() ??
        null;

      const description =
        $('meta[property="og:description"]').attr("content") ??
        $('meta[name="description"]').attr("content") ??
        null;

      const ogImage =
        $('meta[property="og:image"]').attr("content") ?? null;

      const faviconHref =
        $('link[rel="icon"]').attr("href") ??
        $('link[rel="shortcut icon"]').attr("href") ??
        "/favicon.ico";

      const favicon = faviconHref.startsWith("http")
        ? faviconHref
        : `${origin}${faviconHref.startsWith("/") ? "" : "/"}${faviconHref}`;

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

  private empty(): ScrapedMetadata {
    return { title: null, description: null, ogImage: null, favicon: null };
  }
}
