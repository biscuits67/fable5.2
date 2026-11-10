# Ethereum AI

Demo website for a wallet-gated AI product: a landing page and an interactive demo workspace.
Everything is simulated. There is no real wallet connection, no network calls and no AI backend.

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

## Structure

| Path | Purpose |
| --- | --- |
| `src/pages/Landing.tsx` | Landing page sections |
| `src/pages/AppPage.tsx` | Demo workspace (`#/app`): chat, history, portfolio and market panels |
| `src/components/app/` | Workspace pieces: scripted chat logic, thinking block, composer, trading-agent run |
| `src/data/agentRun.ts` | Scripted, deliberately modest trading-agent simulation |
| `src/components/demo/` | Laptop mockup and the scripted demo player |
| `src/components/WalletModal.tsx` | Sign-up style dialog: nickname, simulated wallet, demo balance, confirmation |
| `src/data/models.ts` | The four models and balance thresholds (0.1 / 0.5 ETH) |
| `src/i18n/locales/` | Translations: en, es, it, fr, de, pt |
| `src/state/` | Theme (dark / light) and demo wallet state |

## Adding a language

Copy `src/i18n/locales/en.ts`, translate it, type it as `Dict`, then register it in `src/i18n/index.tsx`
(`DICTS` and `LOCALES`). TypeScript reports any missing key.

## Third-party assets

Wallet logos in `src/assets/wallets/` come from the MIT-licensed `@web3icons/core` package. The logos themselves are trademarks of their owners and are used only to name supported wallets.
