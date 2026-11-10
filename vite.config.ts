import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const LOCALES = ['en', 'es', 'it', 'fr', 'de', 'pt'] as const;
const DEFAULT_LOCALE = 'en';
const OG_IMAGE = 'og.png';

const localeUrl = (siteUrl: string, locale: string) => (locale === DEFAULT_LOCALE ? `${siteUrl}/` : `${siteUrl}/?lang=${locale}`);

function alternateLinks(siteUrl: string): { hreflang: string; href: string }[] {
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale, href: localeUrl(siteUrl, locale) })),
    { hreflang: 'x-default', href: `${siteUrl}/` },
  ];
}

function sitemap(siteUrl: string): string {
  const alternates = alternateLinks(siteUrl)
    .map(({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href.replace(/&/g, '&amp;')}"/>`)
    .join('\n');
  const urls = LOCALES.map((locale) => `  <url>\n    <loc>${localeUrl(siteUrl, locale)}</loc>\n${alternates}\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

/**
 * Adds everything in SEO that needs the site's absolute address: canonical and hreflang links,
 * absolute social image URLs, structured data, robots.txt and sitemap.xml.
 * Without VITE_SITE_URL the build still works; those parts are skipped and a warning is printed.
 */
function seo(siteUrl: string | undefined): Plugin {
  return {
    name: 'ethereum-ai-seo',
    transformIndexHtml() {
      const image = siteUrl ? `${siteUrl}/${OG_IMAGE}` : `./${OG_IMAGE}`;
      const tags: HtmlTagDescriptor[] = [
        { tag: 'meta', attrs: { property: 'og:image', content: image }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: image }, injectTo: 'head' },
      ];
      if (!siteUrl) return tags;

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Ethereum AI',
        url: `${siteUrl}/`,
        inLanguage: [...LOCALES],
        description: 'Four AI models for crypto trading, smart contract code and everyday questions, unlocked by an active wallet.',
      };
      return [
        ...tags,
        { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' },
        ...alternateLinks(siteUrl).map(
          ({ hreflang, href }): HtmlTagDescriptor => ({ tag: 'link', attrs: { rel: 'alternate', hreflang, href }, injectTo: 'head' }),
        ),
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(structuredData), injectTo: 'head' },
      ];
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? ['', `Sitemap: ${siteUrl}/sitemap.xml`] : [])].join('\n');
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` });
      if (siteUrl) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(siteUrl) });
      else this.warn('VITE_SITE_URL is not set: canonical URL, hreflang links and sitemap.xml were skipped. See .env.example.');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const siteUrl = env.VITE_SITE_URL?.trim().replace(/\/+$/, '') || undefined;
  if (siteUrl && !/^https?:\/\/[^\s/]+/.test(siteUrl)) throw new Error(`VITE_SITE_URL must be an absolute http(s) URL, got "${siteUrl}"`);

  return {
    // Relative base so the static build works from any path (GitHub Pages, a subfolder, a CDN).
    base: './',
    plugins: [react(), seo(siteUrl)],
  };
});
