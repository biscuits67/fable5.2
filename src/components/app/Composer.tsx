import { useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { fmt, useI18n } from '../../i18n';
import { CloseIcon, LockIcon, SendIcon } from '../icons';
import type { Modes } from './types';

const MAX_FILES = 5;
const MAX_HEIGHT = 200;
const MAX_LENGTH = 2000;

interface ComposerProps {
  busy: boolean;
  modes: Modes;
  agentAvailable: boolean;
  onToggleMode: (key: keyof Modes) => void;
  onAgentLocked: () => void;
  onSend: (text: string, files: string[]) => void;
}

function ClipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 11.5l-8.2 8.2a5 5 0 01-7.1-7.1l8.6-8.6a3.4 3.4 0 014.8 4.8l-8.5 8.5a1.7 1.7 0 01-2.4-2.4l7.7-7.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Message input with attachments and mode toggles. Attached files stay in the browser; only names are shown. */
export function Composer({ busy, modes, agentAvailable, onToggleMode, onAgentLocked, onSend }: ComposerProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Grow the textarea with its content, up to a limit.
  useLayoutEffect(() => {
    const node = textRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, MAX_HEIGHT)}px`;
  }, [draft]);

  const canSend = !busy && (draft.trim().length > 0 || files.length > 0);

  const submit = () => {
    if (!canSend) return;
    onSend(draft, files);
    setDraft('');
    setFiles([]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const names = [...(e.target.files ?? [])].map((file) => file.name);
    setFiles((current) => [...new Set([...current, ...names])].slice(0, MAX_FILES));
    e.target.value = '';
  };

  const modeButtons: { key: keyof Modes; label: string }[] = [
    { key: 'think', label: t.ws.modeThink },
    { key: 'chain', label: t.ws.modeChain },
  ];

  return (
    <form className="cbox" onSubmit={handleSubmit}>
      {files.length > 0 && (
        <ul className="files">
          {files.map((name) => (
            <li key={name}>
              <span>{name}</span>
              <button type="button" aria-label={fmt(t.ws.remove, { name })} onClick={() => setFiles((list) => list.filter((f) => f !== name))}>
                <CloseIcon />
              </button>
            </li>
          ))}
          <li className="files-note">{t.ws.attachNote}</li>
        </ul>
      )}
      <textarea
        ref={textRef}
        rows={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.app.placeholder}
        aria-label={t.app.placeholder}
        maxLength={MAX_LENGTH}
      />
      <div className="cbox-row">
        <input ref={fileRef} type="file" multiple hidden onChange={handleFiles} />
        <button type="button" className="cbox-ic" aria-label={t.ws.attach} title={t.ws.attach} onClick={() => fileRef.current?.click()}>
          <ClipIcon />
        </button>
        {modeButtons.map(({ key, label }) => (
          <button key={key} type="button" className={`mode ${modes[key] ? 'on' : ''}`} aria-pressed={modes[key]} onClick={() => onToggleMode(key)}>
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`mode ${modes.agent ? 'on' : ''} ${agentAvailable ? '' : 'off'}`}
          aria-pressed={modes.agent}
          title={agentAvailable ? undefined : t.ws.agentLocked}
          onClick={() => (agentAvailable ? onToggleMode('agent') : onAgentLocked())}
        >
          {!agentAvailable && <LockIcon size={11} />}
          {t.ws.modeAgent}
        </button>
        <span className="cbox-hint">{t.ws.hint}</span>
        <button type="submit" className="send" aria-label={t.app.send} disabled={!canSend}>
          <SendIcon />
        </button>
      </div>
    </form>
  );
}
