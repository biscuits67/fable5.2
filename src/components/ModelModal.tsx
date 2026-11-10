import type { CSSProperties } from 'react';
import { formatEth, isUnlocked, type ModelSpec } from '../data/models';
import { useI18n } from '../i18n';
import { APP_HASH, navigate } from '../lib/route';
import { useWallet } from '../state/wallet';
import { CheckIcon, ModelIcon } from './icons';
import { Modal } from './Modal';

const TITLE_ID = 'model-modal-title';

interface ModelModalProps {
  /** The model to show. Kept after closing so the exit animation still has content. */
  model: ModelSpec | null;
  open: boolean;
  onClose: () => void;
}

export function ModelModal({ model, open, onClose }: ModelModalProps) {
  const { t } = useI18n();
  const { account, openModal } = useWallet();
  if (!model) return null;

  const copy = t.models.items[model.id];
  const unlocked = isUnlocked(model, account?.balance ?? null);

  const handleAction = () => {
    onClose();
    if (unlocked) navigate(APP_HASH);
    else openModal();
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={TITLE_ID}>
      <div className="step">
        <span className="mm-ic" style={{ '--mc': model.color } as CSSProperties}>
          <ModelIcon id={model.id} />
        </span>
        <p className="eb">{copy.role}</p>
        <h3 id={TITLE_ID}>{model.name}</h3>
        <p className="ms">{copy.text}</p>
        <ul className="mm-list">
          {copy.points.map((point) => (
            <li key={point}>
              <CheckIcon size={18} />
              {point}
            </li>
          ))}
        </ul>
        <div className="bal">
          <span>{t.models.unlockAt}</span>
          <b className="mono">{formatEth(model.minBalance, 1)} ETH</b>
        </div>
        <button type="button" className="mbtn" onClick={handleAction}>
          {unlocked ? t.models.modalOpen : t.models.modalCta}
        </button>
      </div>
    </Modal>
  );
}
