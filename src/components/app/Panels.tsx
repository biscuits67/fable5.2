import { useEffect, useState, type CSSProperties } from 'react';
import { AGENT_START_BALANCE, AGENT_TARGET_BALANCE, agentSnapshot, formatPercent, formatSignedEth } from '../../data/agentRun';
import { MODELS, accessTier, formatEth, isUnlocked } from '../../data/models';
import { useI18n } from '../../i18n';
import type { Dict } from '../../i18n/locales/en';
import { DEMO_ADDRESS, useWallet } from '../../state/wallet';
import { LockIcon, ModelIcon } from '../icons';
import { HISTORY_SCENARIOS } from './types';
import type { Workspace } from './useWorkspace';

function tierLabel(t: Dict, balance: number): string {
  const tier = accessTier(balance);
  if (tier === 'full') return t.app.allUnlocked;
  return tier === 'entry' ? t.app.lumenOnly : t.app.noneUnlocked;
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Left column: new chat, models, conversation history and the account card. */
export function Sidebar({ ws, onNavigate }: { ws: Workspace; onNavigate: () => void }) {
  const { t } = useI18n();
  const { account, openModal } = useWallet();
  const balance = account?.balance ?? null;
  const act = (fn: () => void) => () => {
    fn();
    onNavigate();
  };

  return (
    <aside className="ws-side">
      <button type="button" className="btn btn-p ws-new" onClick={act(() => ws.newChat())}>
        <PlusIcon />
        {t.ws.newChat}
      </button>

      <div className="a-lab">{t.app.models}</div>
      <div className="ws-models">
        {MODELS.map((model) => {
          const open = isUnlocked(model, balance);
          const selected = model.id === ws.active.modelId;
          return (
            <button key={model.id} type="button" className={`m ${open ? 'open' : ''} ${selected ? 'sel' : ''}`} aria-pressed={selected} onClick={act(() => ws.selectModel(model))}>
              <span className="m-ic" style={{ '--mc': model.color } as CSSProperties}>
                <ModelIcon id={model.id} />
              </span>
              <span className="m-tx">
                <b>{model.name}</b>
                <small>{t.models.items[model.id].role}</small>
              </span>
              {!open && (
                <em>
                  <LockIcon size={10} /> {formatEth(model.minBalance, 1)}
                </em>
              )}
            </button>
          );
        })}
      </div>

      <div className="a-lab">{t.ws.history}</div>
      <div className="ws-history">
        {ws.history.map((chat) => (
          <button key={chat.id} type="button" className={chat.id === ws.activeId ? 'on' : ''} onClick={act(() => ws.openChat(chat.id))}>
            {chat.title}
          </button>
        ))}
        {ws.seedHistory.map((key) => (
          <button key={key} type="button" onClick={act(() => ws.openHistory(key))}>
            {t.ws.historyItems[HISTORY_SCENARIOS.indexOf(key)]}
          </button>
        ))}
      </div>

      <div className="ws-acct">
        {account ? (
          <>
            <span className="ws-ava d" aria-hidden="true">
              {account.nickname.slice(0, 1).toUpperCase()}
            </span>
            <span className="ws-acct-tx">
              <b>{account.nickname}</b>
              <small className="mono">{DEMO_ADDRESS}</small>
              <em>{tierLabel(t, account.balance)}</em>
            </span>
            <button type="button" className="ws-acct-btn" onClick={openModal}>
              {t.ws.account}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-p ws-connect" onClick={openModal}>
            {t.nav.connect}
          </button>
        )}
      </div>
    </aside>
  );
}

interface Ticker {
  symbol: string;
  unit: string;
  digits: number;
  values: number[];
}

const TICK_MS = 2600;
const HISTORY = 24;
const SEED: readonly { symbol: string; unit: string; digits: number; start: number; drift: number }[] = [
  { symbol: 'ETH', unit: '$', digits: 0, start: 3480, drift: 0.004 },
  { symbol: 'BTC', unit: '$', digits: 0, start: 97200, drift: 0.003 },
  { symbol: 'GAS', unit: 'gwei', digits: 1, start: 14.2, drift: 0.03 },
];

/** Deterministic wobble so the tickers move without pretending to be a live feed. */
const wobble = (index: number, tick: number) => Math.sin(tick * 0.9 + index * 2.1) * 0.6 + Math.sin(tick * 0.37 + index) * 0.4;

function buildTickers(tick: number): Ticker[] {
  return SEED.map((seed, index) => ({
    symbol: seed.symbol,
    unit: seed.unit,
    digits: seed.digits,
    values: Array.from({ length: HISTORY }, (_, i) => seed.start * (1 + seed.drift * wobble(index, tick - HISTORY + i + 1))),
  }));
}

function useTickers(): Ticker[] {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((v) => v + 1), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);
  return buildTickers(tick);
}

function Spark({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(1)},${(30 - ((v - min) / span) * 28 - 1).toFixed(1)}`).join(' ');
  return (
    <svg className="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

/** Right column: portfolio (wallet or agent run) and simulated market tickers. */
export function InfoPanel({ ws }: { ws: Workspace }) {
  const { t } = useI18n();
  const { account } = useWallet();
  const tickers = useTickers();
  const run = ws.agentRun;
  const snapshot = run ? agentSnapshot(run.step) : null;
  const balance = snapshot?.balance ?? account?.balance ?? 0;
  const change = snapshot ? snapshot.balance / AGENT_START_BALANCE - 1 : 0;
  const progress = snapshot ? Math.min(1, snapshot.balance / AGENT_TARGET_BALANCE) : 0;

  return (
    <aside className="ws-info">
      <section className="tile">
        <div className="a-lab">{t.ws.portfolio}</div>
        <b className="tile-num d">{balance.toFixed(snapshot ? 4 : 3)} ETH</b>
        {snapshot ? (
          <>
            <div className="kv">
              <span>{t.ws.result}</span>
              <b className={change >= 0 ? 'up' : 'down'}>{formatPercent(change)}</b>
            </div>
            <div className="kv">
              <span>{t.ws.earned}</span>
              <b className={change >= 0 ? 'up' : 'down'}>{formatSignedEth(snapshot.balance - AGENT_START_BALANCE)}</b>
            </div>
            <div className="kv">
              <span>{t.agent.target}</span>
              <b>{formatEth(AGENT_TARGET_BALANCE, 0)} ETH</b>
            </div>
            <div className="goal" role="img" aria-label={`${t.agent.target}: ${Math.round(progress * 100)}%`}>
              <i style={{ width: `${progress * 100}%` }} />
            </div>
          </>
        ) : (
          <p className="tile-sub">{account ? tierLabel(t, account.balance) : t.app.connectFirst}</p>
        )}
      </section>

      <section className="tile">
        <div className="a-lab">{t.ws.positions}</div>
        {snapshot && snapshot.positions.length > 0 ? (
          <ul className="pos">
            {snapshot.positions.map((position) => (
              <li key={position.pair}>
                <b>{position.pair}</b>
                <span className="mono">{position.size}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tile-sub">{t.ws.noPositions}</p>
        )}
      </section>

      <section className="tile">
        <div className="a-lab">
          {t.ws.market}
          <span>{t.ws.simulated}</span>
        </div>
        <ul className="tick">
          {tickers.map((ticker) => {
            const last = ticker.values[ticker.values.length - 1];
            const first = ticker.values[0];
            return (
              <li key={ticker.symbol} className={last >= first ? 'up' : 'down'}>
                <b>{ticker.symbol === 'GAS' ? t.ws.gas : ticker.symbol}</b>
                <Spark values={ticker.values} />
                <span className="mono">
                  {ticker.unit === '$' ? '$' : ''}
                  {last.toLocaleString('en-US', { minimumFractionDigits: ticker.digits, maximumFractionDigits: ticker.digits })}
                  {ticker.unit === '$' ? '' : ` ${ticker.unit}`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
