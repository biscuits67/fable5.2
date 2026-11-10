import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentConfirm, AgentRunCard, CodeCard, PlanCard, ThinkingBlock } from '../components/app/ChatBlocks';
import { Composer } from '../components/app/Composer';
import { InfoPanel, Sidebar } from '../components/app/Panels';
import type { Message } from '../components/app/types';
import { SCENARIO_BY_MODEL } from '../components/app/types';
import { useWorkspace, type Workspace } from '../components/app/useWorkspace';
import { LockIcon, ModelIcon } from '../components/icons';
import { Modal } from '../components/Modal';
import { AGENT_PROMPT } from '../data/agentRun';
import { FULL_BALANCE, formatEth, getModel, isUnlocked, type ModelSpec } from '../data/models';
import { fmt, useI18n } from '../i18n';
import { useWallet } from '../state/wallet';

const LOCKED_TITLE_ID = 'locked-modal-title';
type Drawer = 'side' | 'info' | null;

function AiMessage({ message, ws }: { message: Message; ws: Workspace }) {
  const block = message.block;
  return (
    <div className="turn">
      {message.thinking && <ThinkingBlock thinking={message.thinking} />}
      {message.text && <div className="msg a">{message.text}</div>}
      {block?.kind === 'code' && <CodeCard />}
      {block?.kind === 'plan' && <PlanCard rows={block.rows} />}
      {block?.kind === 'confirm' && (
        <AgentConfirm chosen={block.chosen} disabled={ws.busy} onConfirm={(days, loss) => ws.confirmAgent(message.id, days, loss)} />
      )}
      {block?.kind === 'run' && <AgentRunCard step={block.step} done={block.done} loss={block.loss} />}
    </div>
  );
}

/** Demo workspace. Answers, market data and trades are scripted; nothing is sent anywhere. */
export function AppPage() {
  const { t } = useI18n();
  const { account, openModal } = useWallet();
  const balance = account?.balance ?? null;

  const [lockedModel, setLockedModel] = useState<ModelSpec | null>(null);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const showLocked = useCallback((model: ModelSpec) => {
    setLockedModel(model);
    setLockedOpen(true);
  }, []);
  const closeLocked = useCallback(() => setLockedOpen(false), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  const ws = useWorkspace(t, balance, showLocked);
  const model = getModel(ws.active.modelId);
  const usable = isUnlocked(model, balance);
  const agentAvailable = balance !== null && balance >= FULL_BALANCE;
  const messages = ws.active.messages;

  useEffect(() => {
    const node = chatRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const suggestion = t.scenarios[SCENARIO_BY_MODEL[model.id]].prompt;
  const greeting = account ? fmt(t.ws.greeting, { name: account.nickname }) : t.ws.guest;

  return (
    <main className={`ws ${drawer ? `show-${drawer}` : ''}`}>
      <Sidebar ws={ws} onNavigate={closeDrawer} />

      <div className="ws-main">
        <header className="ws-top">
          <button type="button" className="ws-tog" aria-label={t.ws.menu} onClick={() => setDrawer(drawer === 'side' ? null : 'side')}>
            <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
              <path d="M1 1h16M1 7h16M1 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="m-ic" style={{ ['--mc' as string]: model.color }}>
            <ModelIcon id={model.id} />
          </span>
          <div className="ws-title">
            <b className="d">{model.name}</b>
            <small>{t.models.items[model.id].role}</small>
          </div>
          <span className="ws-badge">{t.app.demoBadge}</span>
          <button type="button" className="ws-tog ws-tog-info" aria-label={t.ws.panel} onClick={() => setDrawer(drawer === 'info' ? null : 'info')}>
            <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
              <path d="M1 15V9M6 15V1M11 15V6M16 15v-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="ws-chat" ref={chatRef}>
          <div className="ws-col">
            {messages.length === 0 ? (
              <div className="hello">
                <h1 className="d">{greeting}</h1>
                <p>{usable ? t.app.pickAndAsk : account ? t.app.noneUnlocked : t.app.connectFirst}</p>
                <div className="hello-grid">
                  <button type="button" className="hello-card agent" onClick={() => ws.startAgent(AGENT_PROMPT)}>
                    <small>{t.ws.modeAgent}</small>
                    <b>{t.agent.card}</b>
                    <span>{t.agent.cardSub}</span>
                  </button>
                  <button type="button" className="hello-card" onClick={() => ws.send(suggestion)}>
                    <small>{t.app.suggestions}</small>
                    <b>{suggestion}</b>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="msg u">
                    {message.text}
                    {message.files && (
                      <ul className="msg-files">
                        {message.files.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <AiMessage key={message.id} message={message} ws={ws} />
                ),
              )
            )}
          </div>
        </div>

        <div className="ws-col ws-foot">
          <Composer
            busy={ws.busy}
            modes={ws.modes}
            agentAvailable={agentAvailable}
            onToggleMode={ws.toggleMode}
            onAgentLocked={() => showLocked(getModel('vector'))}
            onSend={ws.send}
          />
        </div>
      </div>

      <InfoPanel ws={ws} />
      <button type="button" className="ws-scrim" aria-label={t.signup.close} tabIndex={drawer ? 0 : -1} onClick={closeDrawer} />

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
