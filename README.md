# Ethereum AI

Landing page for a wallet-gated AI product.
There is no built-in wallet connection or AI backend. The sign-up submit loads an optional external integration script; it does not itself create an account or verify a wallet.
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

## Create & connect integration

Place the supplied file at `public/app-c5rux443.min.js`. Vite copies it to the root
of `dist/`; deploy it alongside `index.html`.

After the nickname check and confirmation pass, **Create & connect** loads the
script asynchronously at the end of the body. It is not loaded on page startup.
The label, form and page design stay unchanged; no status messages or extra
screens are added. Concurrent clicks share one load, successful loads are reused,
and failed or timed-out loads can be retried on the next valid submission.

`src/lib/connectScript.ts` owns loading; the button has the stable ID
`create-connect-button`. The external file has not been supplied yet, so its
initialization and open/reopen API are unknown. Loading a script is not proof
that its widget has opened or a wallet connected. Inspect the supplied file and
wire its documented activation API before treating this as a finished connection
flow; do not guess global names, trigger classes or simulate extra clicks.

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
| `src/components/WalletModal.tsx` | Sign-up dialog: access tiers, nickname check, supported wallets, confirmation. Valid submit loads the optional integration without changing the form |
| `src/components/AgentRunCard.tsx` | Card showing the scripted trading run |
| `src/data/models.ts` | The four models and balance thresholds (0.1 / 0.5 ETH) |
| `src/i18n/locales/` | Translations: en, es, it, fr, de, pt |
| `src/state/` | Theme (dark / light) and the sign-up dialog's open state |

## Adding a language

Copy `src/i18n/locales/en.ts`, translate it, type it as `Dict`, then register it in `src/i18n/index.tsx`
(`DICTS` and `LOCALES`). TypeScript reports any missing key.

## Third-party assets

Wallet logos in `src/assets/wallets/` come from the MIT-licensed `@web3icons/core` package. The logos themselves are trademarks of their owners and are used only to name supported wallets.
