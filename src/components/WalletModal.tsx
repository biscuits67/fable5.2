import { useEffect, useState } from 'react';
import { accessTier, formatEth, type AccessTier } from '../data/models';
import { fmt, useI18n } from '../i18n';
import type { Dict } from '../i18n/locales/en';
import { APP_HASH, navigate } from '../lib/route';
import { DEMO_ADDRESS, useWallet } from '../state/wallet';
import { CheckIcon, LockIcon } from './icons';
import { Modal } from './Modal';

type Step = 'wallet' | 'balance' | 'checking' | 'result';
type WalletKind = keyof Dict['wallet']['kinds'];

const WALLETS: readonly { name: string; kind: WalletKind }[] = [
  { name: 'MetaMask', kind: 'browser' },
  { name: 'WalletConnect', kind: 'mobile' },
  { name: 'Coinbase Wallet', kind: 'app' },
  { name: 'Ledger', kind: 'hardware' },
];

/** Demo balances, one per access level, so every state of the product can be explored. */
const DEMO_BALANCES = [0.04, 0.14, 0.52] as const;
const CHECK_DURATION_MS = 1500;
const TITLE_ID = 'wallet-modal-title';

function resultText(t: Dict, tier: AccessTier): string {
  if (tier === 'full') return t.wallet.resAll;
  return tier === 'entry' ? t.wallet.resLumen : t.wallet.resNone;
}

export function WalletModal() {
  const { t } = useI18n();
  const { account, connect, disconnect, isModalOpen, closeModal } = useWallet();
  const [step, setStep] = useState<Step>('wallet');
  const [walletName, setWalletName] = useState(WALLETS[0].name);
  const [pending, setPending] = useState<number | null>(null);

  // Each opening starts fresh: account summary if connected, wallet list otherwise.
  useEffect(() => {
    if (isModalOpen) setStep(account ? 'result' : 'wallet');
    // Only the opening transition should reset the step, not later account changes.
  }, [isModalOpen]);

  useEffect(() => {
    if (step !== 'checking' || pending === null) return;
    const timer = window.setTimeout(() => {
      connect({ walletName, balance: pending });
      setStep('result');
    }, CHECK_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [step, pending, walletName, connect]);

  const optionLabels = [t.wallet.optLow, t.wallet.optMid, t.wallet.optHigh];
  const tier = account ? accessTier(account.balance) : 'none';

  return (
    <Modal open={isModalOpen} onClose={closeModal} labelledBy={TITLE_ID}>
      {step === 'wallet' && (
        <div className="step">
          <p className="eb">{t.wallet.demoMode}</p>
          <h3 id={TITLE_ID}>{t.wallet.title}</h3>
          <p className="ms">{t.wallet.sub}</p>
          {WALLETS.map((wallet) => (
            <button
              key={wallet.name}
              type="button"
              className="wo"
              onClick={() => {
                setWalletName(wallet.name);
                setStep('balance');
              }}
            >
              <i>{wallet.name[0]}</i>
              <span>{wallet.name}</span>
              <em>{t.wallet.kinds[wallet.kind]}</em>
            </button>
          ))}
        </div>
      )}

      {step === 'balance' && (
        <div className="step">
          <p className="eb">{t.wallet.demoMode}</p>
          <h3 id={TITLE_ID}>{t.wallet.pickTitle}</h3>
          <p className="ms">{t.wallet.pickSub}</p>
          {DEMO_BALANCES.map((balance, index) => (
            <button
              key={balance}
              type="button"
              className="wo"
              onClick={() => {
                setPending(balance);
                setStep('checking');
              }}
            >
              <i className="mono">{index + 1}</i>
              <span>{optionLabels[index]}</span>
              <em>{formatEth(balance)} ETH</em>
            </button>
          ))}
        </div>
      )}

      {step === 'checking' && (
        <div className="step center">
          <div className="spin" />
          <h3 id={TITLE_ID}>{t.wallet.checking}</h3>
          <p className="ms">{fmt(t.wallet.checkingSub, { wallet: walletName })}</p>
        </div>
      )}

      {step === 'result' && account && (
        <div className="step center">
          <div className={`ok ${tier === 'none' ? 'no' : ''}`}>{tier === 'none' ? <LockIcon size={22} /> : <CheckIcon />}</div>
          <h3 id={TITLE_ID}>{tier === 'none' ? t.wallet.notEnough : t.wallet.verified}</h3>
          <p className="ms mono addr">
            {DEMO_ADDRESS} · {account.walletName}
          </p>
          <div className="bal">
            <span>{t.wallet.balance}</span>
            <b className="mono">{formatEth(account.balance)} ETH</b>
          </div>
          <p className="ms">{resultText(t, tier)}</p>
          {tier !== 'none' && (
            <button
              type="button"
              className="mbtn"
              onClick={() => {
                closeModal();
                navigate(APP_HASH);
              }}
            >
              {t.wallet.open}
            </button>
          )}
          <div className="mrow">
            <button type="button" className="mlink" onClick={() => setStep('balance')}>
              {t.wallet.tryOther}
            </button>
            <button
              type="button"
              className="mlink"
              onClick={() => {
                disconnect();
                setStep('wallet');
              }}
            >
              {t.wallet.disconnect}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
