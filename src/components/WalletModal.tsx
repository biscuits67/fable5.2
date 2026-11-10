import { useEffect, useId, useState, type FormEvent } from 'react';
import { ENTRY_BALANCE, FULL_BALANCE, formatEth } from '../data/models';
import { NICKNAME_MAX, nicknameIssue } from '../data/nicknames';
import { RECOMMENDED_WALLET, SUPPORTED_WALLETS } from '../data/wallets';
import { useI18n } from '../i18n';
import { useWallet } from '../state/wallet';
import { CheckIcon, EthMark } from './icons';
import { Modal } from './Modal';

/** Pause before the availability verdict, so the check reads as a lookup. */
const NICKNAME_CHECK_MS = 600;
const TITLE_ID = 'signup-modal-title';

/**
 * Sign-up dialog: access tiers, nickname, supported wallets and a confirmation.
 * Submitting keeps it open. No account is created and no wallet is contacted.
 */
export function WalletModal() {
  const { t } = useI18n();
  const s = t.signup;
  const { isModalOpen, closeModal } = useWallet();
  const nicknameId = useId();

  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [checkedName, setCheckedName] = useState('');

  useEffect(() => {
    if (isModalOpen) setAgreed(false);
  }, [isModalOpen]);

  const trimmedName = nickname.trim();
  const issue = nicknameIssue(nickname);
  const checking = issue !== 'short' && issue !== 'invalid' && checkedName !== trimmedName;
  const canSubmit = issue === null && !checking && agreed;

  useEffect(() => {
    const timer = window.setTimeout(() => setCheckedName(trimmedName), NICKNAME_CHECK_MS);
    return () => window.clearTimeout(timer);
  }, [trimmedName]);

  let nameStatus: { tone: 'hint' | 'bad' | 'good'; text: string } = { tone: 'hint', text: s.nicknameHint };
  if (trimmedName && issue === 'invalid') nameStatus = { tone: 'bad', text: s.nickInvalid };
  else if (trimmedName && issue !== 'short' && checking) nameStatus = { tone: 'hint', text: s.nickChecking };
  else if (issue === 'taken') nameStatus = { tone: 'bad', text: s.nickTaken };
  else if (issue === null) nameStatus = { tone: 'good', text: s.nickFree };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <Modal open={isModalOpen} onClose={closeModal} labelledBy={TITLE_ID} wide>
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
              aria-invalid={nameStatus.tone === 'bad'}
              className={nameStatus.tone}
            />
            <small id={`${nicknameId}-hint`} className={nameStatus.tone} aria-live="polite">
              {nameStatus.text}
            </small>
          </label>

          <div className="field">
            <span>{s.supported}</span>
            <ul className="sw">
              {SUPPORTED_WALLETS.map(({ name, icon }) => (
                <li key={name} className={name === RECOMMENDED_WALLET ? 'rec' : ''}>
                  <img src={icon} alt="" width={26} height={26} />
                  {name}
                  {name === RECOMMENDED_WALLET && <em>{s.recommendedWallet}</em>}
                </li>
              ))}
            </ul>
          </div>

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
    </Modal>
  );
}
