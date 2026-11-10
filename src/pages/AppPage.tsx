import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ModelIcon, LockIcon, SendIcon } from '../components/icons';
import { Modal } from '../components/Modal';
import { BURN_TOKEN_FILE, BURN_TOKEN_SOURCE } from '../data/contract';
import { MODELS, accessTier, formatEth, getModel, isUnlocked, type ModelId, type ModelSpec } from '../data/models';
import { fmt, useI18n } from '../i18n';
import type { Dict } from '../i18n/locales/en';
import { highlightSolidity } from '../lib/highlight';
import { DEMO_ADDRESS, useWallet } from '../state/wallet';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
  pending?: boolean;
  code?: boolean;
  plan?: string[][];
}

interface ScriptedReply {
  prompt: string;
  reply: string;
  code?: boolean;
  plan?: string[][];
}

const THINKING_MS = 900;
const STREAM_INTERVAL_MS = 16;
const STREAM_CHUNK = 3;
const LOCKED_TITLE_ID = 'locked-modal-title';

function scriptedReply(t: Dict, id: ModelId): ScriptedReply {
  const s = t.scenarios;
  switch (id) {
    case 'lumen':
      return s.ask;
    case 'vector':
      return { ...s.plan, plan: s.plan.rows };
    case 'forge':
      return { ...s.code, code: true };
    case 'apex':
      return s.apex;
  }
}

function tierLabel(t: Dict, balance: number): string {
  const tier = accessTier(balance);
  if (tier === 'full') return t.app.allUnlocked;
  return tier === 'entry' ? t.app.lumenOnly : t.app.noneUnlocked;
}

function PlanCard({ rows, label }: { rows: string[][]; label: string }) {
  return (
    <div className="plan">
      <ul>
        {rows.map(([key, value], index) => (
          <li key={key} style={{ animationDelay: `${index * 180}ms` }}>
            <small>{key}</small>
            <b>{value}</b>
          </li>
        ))}
      </ul>
      <div className="chart">
        <small>{label}</small>
        <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
          <path className="l" d="M4 70C30 50 44 92 70 84S104 30 130 44s30 58 56 50 34-62 60-58 30 26 50 8" />
          <circle cx="70" cy="84" r="5" style={{ animationDelay: '.7s' }} />
          <circle cx="186" cy="94" r="7" style={{ animationDelay: '1.3s' }} />
          <circle cx="246" cy="36" r="5" style={{ animationDelay: '1.7s' }} />
        </svg>
      </div>
    </div>
  );
}

function CodeCard() {
  return (
    <div className="code">
      <header>
        <i />
        <i />
        <i />
        <span>{BURN_TOKEN_FILE}</span>
      </header>
      {/* Source is a local constant and is HTML-escaped by the highlighter. */}
      <pre dangerouslySetInnerHTML={{ __html: highlightSolidity(BURN_TOKEN_SOURCE) }} />
    </div>
  );
}

/** Interactive demo workspace. Answers are scripted; nothing is sent anywhere. */
export function AppPage() {
  const { t } = useI18n();
  const { account, openModal } = useWallet();
  const balance = account?.balance ?? null;

  const [selectedId, setSelectedId] = useState<ModelId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [lockedModel, setLockedModel] = useState<ModelSpec | null>(null);
  const [lockedOpen, setLockedOpen] = useState(false);

  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timers.current = [];
  }, []);

  const resetChat = useCallback(() => {
    clearTimers();
    setMessages([]);
    setBusy(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  // Keep the selection valid when the wallet changes: pick the best unlocked model, or none.
  useEffect(() => {
    const current = selectedId ? getModel(selectedId) : null;
    if (current && isUnlocked(current, balance)) return;
    const fallback = MODELS.find((model) => isUnlocked(model, balance)) ?? null;
    setSelectedId(fallback?.id ?? null);
    resetChat();
  }, [balance, selectedId, resetChat]);

  useEffect(() => {
    const node = chatRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const closeLocked = useCallback(() => setLockedOpen(false), []);
  const selected = selectedId ? getModel(selectedId) : null;
  const script = selected ? scriptedReply(t, selected.id) : null;

  const pickModel = (model: ModelSpec) => {
    if (!isUnlocked(model, balance)) {
      setLockedModel(model);
      setLockedOpen(true);
      return;
    }
    if (model.id === selectedId) return;
    setSelectedId(model.id);
    resetChat();
  };

  const send = (prompt: string, reply: Omit<ScriptedReply, 'prompt'>) => {
    if (busy || !selected) return;
    const userId = nextId.current++;
    const aiId = nextId.current++;
    setBusy(true);
    setMessages((list) => [...list, { id: userId, role: 'user', text: prompt }, { id: aiId, role: 'ai', text: '', pending: true }]);

    const patch = (changes: Partial<Message>) => setMessages((list) => list.map((m) => (m.id === aiId ? { ...m, ...changes } : m)));

    const thinking = window.setTimeout(() => {
      let shown = 0;
      const stream = window.setInterval(() => {
        shown = Math.min(shown + STREAM_CHUNK, reply.reply.length);
        patch({ text: reply.reply.slice(0, shown), pending: false });
        if (shown < reply.reply.length) return;
        window.clearInterval(stream);
        patch({ code: reply.code, plan: reply.plan });
        setBusy(false);
      }, STREAM_INTERVAL_MS);
      timers.current.push(stream);
    }, THINKING_MS);
    timers.current.push(thinking);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const prompt = draft.trim();
    if (!prompt || !selected) return;
    setDraft('');
    send(prompt, { reply: fmt(t.app.demoReply, { model: selected.name }) });
  };

  const emptyText = !account ? t.app.connectFirst : selected ? t.app.pickAndAsk : t.app.noneUnlocked;

  return (
    <main className="ap wrap">
      <aside className="ap-side">
        <div className="a-lab">{t.app.models}</div>
        <div className="ap-models">
          {MODELS.map((model) => {
            const open = isUnlocked(model, balance);
            return (
              <button
                key={model.id}
                type="button"
                className={`m ${open ? 'open' : ''} ${model.id === selectedId ? 'sel' : ''}`}
                aria-pressed={model.id === selectedId}
                onClick={() => pickModel(model)}
              >
                <span className="m-ic" style={{ '--mc': model.color } as CSSProperties}>
                  <ModelIcon id={model.id} />
                </span>
                <span className="m-tx">
                  <b>{model.name}</b>
                  <small>{t.models.items[model.id].role}</small>
                </span>
                <em>
                  {open ? (
                    t.app.unlocked
                  ) : (
                    <>
                      <LockIcon size={10} /> {formatEth(model.minBalance, 1)} ETH
                    </>
                  )}
                </em>
              </button>
            );
          })}
        </div>
        <div className="a-wallet">
          {account ? (
            <div className="ap-acct">
              <small>
                {DEMO_ADDRESS} · {t.app.readOnly}
              </small>
              <b className="d">{formatEth(account.balance, 3)} ETH</b>
              <em>{tierLabel(t, account.balance)}</em>
              <button type="button" className="ap-change" onClick={openModal}>
                {t.app.changeWallet}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-p ap-connect" onClick={openModal}>
              {t.nav.connect}
            </button>
          )}
        </div>
      </aside>

      <div className="ap-main">
        <header className="a-top">
          <b className="d">{selected ? selected.name : t.app.selectModel}</b>
          <span>{t.app.demoBadge}</span>
        </header>

        <div className="ap-chat" ref={chatRef} aria-live="polite">
          {messages.length === 0 && (
            <div className="empty">
              <p>{emptyText}</p>
              {script && (
                <>
                  <small>{t.app.suggestions}</small>
                  <button type="button" className="chip" onClick={() => send(script.prompt, script)}>
                    {script.prompt}
                  </button>
                </>
              )}
            </div>
          )}
          {messages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} className="msg u">
                {message.text}
              </div>
            ) : (
              <div key={message.id} className="ap-turn">
                <div className="msg a">
                  {message.pending ? (
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    message.text
                  )}
                </div>
                {message.code && <CodeCard />}
                {message.plan && <PlanCard rows={message.plan} label={t.app.planChart} />}
              </div>
            ),
          )}
        </div>

        <form className="a-in" onSubmit={handleSubmit}>
          <input
            className="ap-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.app.placeholder}
            aria-label={t.app.placeholder}
            disabled={!selected}
            maxLength={500}
          />
          <button type="submit" className="send" aria-label={t.app.send} disabled={!selected || busy || !draft.trim()}>
            <SendIcon />
          </button>
        </form>
      </div>

      <Modal open={lockedOpen} onClose={closeLocked} labelledBy={LOCKED_TITLE_ID}>
        {lockedModel && (
          <div className="step center">
            <div className="ok no">
              <LockIcon size={22} />
            </div>
            <h3 id={LOCKED_TITLE_ID}>{fmt(t.app.lockedTitle, { model: lockedModel.name, min: formatEth(lockedModel.minBalance, 1) })}</h3>
            <p className="ms">
              {account
                ? fmt(t.app.lockedBody, { balance: formatEth(account.balance) })
                : fmt(t.app.lockedNoWallet, { min: formatEth(lockedModel.minBalance, 1) })}
            </p>
            <button
              type="button"
              className="mbtn"
              onClick={() => {
                closeLocked();
                openModal();
              }}
            >
              {account ? t.app.lockedCta : t.nav.connect}
            </button>
          </div>
        )}
      </Modal>
    </main>
  );
}
