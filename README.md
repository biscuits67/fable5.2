# Ethereum AI

Landing page for a wallet-gated AI product.
Nothing on it is live yet: there is no wallet connection, no network calls and no AI backend.
The laptop animation and the trading run are scripted illustrations.

## Stack

- Vite, React 19, TypeScript (strict)
- Plain CSS, self-hosted variable fonts (Unbounded, Onest, JetBrains Mono)
- No runtime dependencies beyond React

## Run

```bash
npm install
npm run dev
```

Build a static site into `dist/` (works from any path or static host):

```bash
npm run build
npm run preview
```

## Search engines and link previews

Set the public address before building, so the absolute URLs are correct:

```bash
cp .env.example .env
```

Then edit `VITE_SITE_URL` in `.env` and run `npm run build`. The build adds the canonical URL, `hreflang` links
for the six languages (`/?lang=de` and so on), structured data, `robots.txt` and `sitemap.xml`.
Without `VITE_SITE_URL` the build still works, but those parts are skipped and a warning is printed.

After deploying, add the site in Google Search Console and submit `/sitemap.xml`.

## Structure

| Path | Purpose |
| --- | --- |
| `src/pages/Landing.tsx` | Landing page sections |
| `src/data/agentRun.ts` | Scripted, deliberately modest trading-agent simulation |
| `src/components/demo/` | Laptop mockup and the scripted demo player |
| `src/components/WalletModal.tsx` | Sign-up dialog: access tiers, nickname check and confirmation, followed by wallet selection. Selecting a wallet does not connect it |
| `src/components/AgentRunCard.tsx` | Card showing the scripted trading run |
| `src/data/models.ts` | The four models and balance thresholds (0.1 / 0.5 ETH) |
| `src/i18n/locales/` | Translations: en, es, it, fr, de, pt |
| `src/state/` | Theme (dark / light) and the sign-up dialog's open state |

## Adding a language

Copy `src/i18n/locales/en.ts`, translate it, type it as `Dict`, then register it in `src/i18n/index.tsx`
(`DICTS` and `LOCALES`). TypeScript reports any missing key.

## Third-party assets

Wallet logos in `src/assets/wallets/` come from the MIT-licensed `@web3icons/core` package. The logos themselves are trademarks of their owners and are used only to name supported wallets.
