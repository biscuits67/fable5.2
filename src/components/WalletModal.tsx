import { useEffect, useId, useState, type FormEvent } from 'react';
import { ENTRY_BALANCE, FULL_BALANCE, accessTier, formatEth, type AccessTier } from '../data/models';
import { fmt, useI18n } from '../i18n';
import type { Dict } from '../i18n/locales/en';
import { APP_HASH, navigate } from '../lib/route';
import { DEMO_ADDRESS, useWallet } from '../state/wallet';
import { CheckIcon, EthMark, LockIcon } from './icons';
import { Modal } from './Modal';

type Step = 'form' | 'progress' | 'result';
type WalletKind = keyof Dict['signup']['kinds'];

const WALLETS: readonly { name: string; kind: WalletKind }[] = [
  { name: 'MetaMask', kind: 'browser' },
  { name: 'WalletConnect', kind: 'mobile' },
  { name: 'Coinbase Wallet', kind: 'app' },
  { name: 'Ledger', kind: 'hardware' },
];

/** Demo balances, one per access level, so every state of the product can be explored. */
const DEMO_BALANCES = [0.04, 0.14, 0.52] as const;
const DEFAULT_BALANCE = DEMO_BALANCES[2];
const NICKNAME_MIN = 2;
const NICKNAME_MAX = 20;
const PROGRESS_STEP_MS = 750;
const TITLE_ID = 'signup-modal-title';

function resultText(t: Dict, tier: AccessTier): string {
  if (tier === 'full') return t.signup.resAll;
  return tier === 'entry' ? t.signup.resLumen : t.signup.resNone;
}

/** Sign-up style dialog. The "account" is a nickname plus a simulated wallet; nothing leaves the page. */
export function WalletModal() {
  const { t } = useI18n();
  const s = t.signup;
  const { account, connect, disconnect, isModalOpen, closeModal } = useWallet();
  const nicknameId = useId();

  const [step, setStep] = useState<Step>('form');
  const [nickname, setNickname] = useState('');
  const [walletName, setWalletName] = useState(WALLETS[0].name);
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE);
  const [agreed, setAgreed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Each opening starts fresh: account summary if signed in, the form otherwise.
  useEffect(() => {
    if (!isModalOpen) return;
    setStep(account ? 'result' : 'form');
    setAgreed(false);
    // Only the opening transition should reset the step, not later account changes.
  }, [isModalOpen]);

  const trimmedName = nickname.trim();
  const nameValid = trimmedName.length >= NICKNAME_MIN && trimmedName.length <= NICKNAME_MAX;
  const canSubmit = nameValid && agreed;

  useEffect(() => {
    if (step !== 'progress') return;
    if (progress >= s.progress.length) {
      connect({ nickname: trimmedName, walletName, balance });
      setStep('result');
      return;
    }
    const timer = window.setTimeout(() => setProgress((p) => p + 1), PROGRESS_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [step, progress, s.progress.length, connect, trimmedName, walletName, balance]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setProgress(0);
    setStep('progress');
  };

  const tier = account ? accessTier(account.balance) : 'none';

  return (
    <Modal open={isModalOpen} onClose={closeModal} labelledBy={TITLE_ID} wide={step === 'form'}>
      {step === 'form' && (
        <div className="su step">
          <aside className="su-info">
            <div className="su-brand d">
              <EthMark className="eth" />
              ETHEREUM AI
            </div>
            <h4 className="d">{s.howTitle}</h4>
            <ul className="su-tiers">
              <li>
                <b className="d">{formatEth(ENTRY_BALANCE, 1)} ETH</b>
                <span>{s.tierEntry}</span>
              </li>
              <li>
                <b className="d">{formatEth(FULL_BALANCE, 1)} ETH</b>
                <span>{s.tierFull}</span>
                <em>{s.recommended}</em>
              </li>
            </ul>
            <p>{s.notPayment}</p>
          </aside>

          <form className="su-form" onSubmit={handleSubmit} noValidate>
            <p className="eb">{s.demoMode}</p>
            <h3 id={TITLE_ID}>{s.title}</h3>
            <p className="ms">{s.sub}</p>

            <label className="field" htmlFor={nicknameId}>
              <span>{s.nickname}</span>
              <input
                id={nicknameId}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={s.nicknamePlaceholder}
                maxLength={NICKNAME_MAX}
                autoComplete="nickname"
                aria-describedby={`${nicknameId}-hint`}
              />
              <small id={`${nicknameId}-hint`}>{s.nicknameHint}</small>
            </label>

            <fieldset className="field">
              <legend>{s.wallet}</legend>
              <div className="wl">
                {WALLETS.map((wallet) => (
                  <button
                    key={wallet.name}
                    type="button"
                    className={wallet.name === walletName ? 'on' : ''}
                    aria-pressed={wallet.name === walletName}
                    onClick={() => setWalletName(wallet.name)}
                  >
                    <i>{wallet.name[0]}</i>
                    <span>
                      {wallet.name}
                      <small>{s.kinds[wallet.kind]}</small>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend>{s.demoBalance}</legend>
              <div className="seg">
                {DEMO_BALANCES.map((value) => (
                  <button key={value} type="button" className={value === balance ? 'on' : ''} aria-pressed={value === balance} onClick={() => setBalance(value)}>
                    {formatEth(value)} ETH
                  </button>
                ))}
              </div>
              <small>{s.demoBalanceHint}</small>
            </fieldset>

            <label className="chk">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <i aria-hidden="true">
                <CheckIcon size={16} />
              </i>
              <span>{s.confirm}</span>
            </label>

            <button type="submit" className="mbtn" disabled={!canSubmit}>
              {s.create}
            </button>
          </form>
        </div>
      )}

      {step === 'progress' && (
        <div className="step center">
          <div className="spin" />
          <h3 id={TITLE_ID}>{s.title}</h3>
          <ul className="su-progress">
            {s.progress.map((label, index) => (
              <li key={label} className={index < progress ? 'done' : index === progress ? 'now' : ''}>
                <i aria-hidden="true">{index < progress && <CheckIcon size={14} />}</i>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'result' && account && (
        <div className="step center">
          <div className={`ok ${tier === 'none' ? 'no' : ''}`}>{tier === 'none' ? <LockIcon size={22} /> : <CheckIcon />}</div>
          <h3 id={TITLE_ID}>{tier === 'none' ? s.notEnough : fmt(s.welcome, { name: account.nickname })}</h3>
          <p className="ms mono addr">
            {DEMO_ADDRESS} · {account.walletName}
          </p>
          <div className="bal">
            <span>{s.balance}</span>
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
              {s.open}
            </button>
          )}
          <div className="mrow">
            <button type="button" className="mlink" onClick={() => setStep('form')}>
              {s.edit}
            </button>
            <button
              type="button"
              className="mlink"
              onClick={() => {
                disconnect();
                setStep('form');
              }}
            >
              {s.signOut}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
