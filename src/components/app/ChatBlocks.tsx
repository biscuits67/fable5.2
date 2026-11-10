import { useState } from 'react';
import {
  AGENT_EVENTS, AGENT_LOSS_LIMITS, AGENT_SIMULATED_DAYS, AGENT_START_BALANCE, AGENT_TIMEFRAMES,
  agentSnapshot, baselineY, equityPoints, formatPercent, formatSignedEth,
} from '../../data/agentRun';
import { BURN_TOKEN_FILE, BURN_TOKEN_SOURCE } from '../../data/contract';
import { fmt, useI18n } from '../../i18n';
import { highlightSolidity } from '../../lib/highlight';
import { CheckIcon, ChevronIcon } from '../icons';
import type { Thinking } from './types';

const CHART_W = 300;
const CHART_H = 80;

/** Visible reasoning: steps appear while the model "thinks", then collapse into a summary line. */
export function ThinkingBlock({ thinking }: { thinking: Thinking }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const running = thinking.seconds === null;
  if (thinking.steps.length === 0) return null;
  const open = running || expanded;

  return (
    <div className={`think ${running ? 'run' : ''} ${open ? 'open' : ''}`}>
      <button type="button" className="think-h" aria-expanded={open} disabled={running} onClick={() => setExpanded((v) => !v)}>
        <i className="think-orb" aria-hidden="true" />
        <span>{running ? t.think.label : fmt(t.think.done, { s: thinking.seconds ?? 0 })}</span>
        {!running && <ChevronIcon />}
      </button>
      {open && (
        <ol className="think-l">
          {thinking.steps.slice(0, running ? thinking.shown + 1 : thinking.steps.length).map((step, index) => {
            const done = !running || index < thinking.shown;
            return (
              <li key={step} className={done ? 'done' : 'now'}>
                <i aria-hidden="true">{done && <CheckIcon size={12} />}</i>
                {step}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function CodeCard() {
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

export function PlanCard({ rows }: { rows: string[][] }) {
  const { t } = useI18n();
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
        <small>{t.app.planChart}</small>
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

interface AgentConfirmProps {
  chosen: { days: number; loss: number } | null;
  disabled: boolean;
  onConfirm: (days: number, loss: number) => void;
}

/** The agent's question before trading: the user picks a timeframe and a maximum loss. */
export function AgentConfirm({ chosen, disabled, onConfirm }: AgentConfirmProps) {
  const { t } = useI18n();
  const [days, setDays] = useState<number>(chosen?.days ?? AGENT_TIMEFRAMES[1]);
  const [loss, setLoss] = useState<number>(chosen?.loss ?? AGENT_LOSS_LIMITS[1]);
  const locked = chosen !== null;

  return (
    <div className={`aconf ${locked ? 'locked' : ''}`}>
      <fieldset disabled={locked}>
        <legend>{t.agent.timeframe}</legend>
        <div className="seg">
          {AGENT_TIMEFRAMES.map((value) => (
            <button key={value} type="button" className={value === days ? 'on' : ''} aria-pressed={value === days} onClick={() => setDays(value)}>
              {fmt(t.agent.days, { n: value })}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={locked}>
        <legend>{t.agent.maxLoss}</legend>
        <div className="seg">
          {AGENT_LOSS_LIMITS.map((value) => (
            <button key={value} type="button" className={value === loss ? 'on' : ''} aria-pressed={value === loss} onClick={() => setLoss(value)}>
              −{value}%
            </button>
          ))}
        </div>
      </fieldset>
      {!locked && (
        <button type="button" className="btn btn-p aconf-go" disabled={disabled} onClick={() => onConfirm(days, loss)}>
          {t.agent.start}
        </button>
      )}
    </div>
  );
}

interface AgentRunCardProps {
  step: number;
  done: boolean;
  loss: number;
  /** Show only the most recent log lines (used where space is tight). */
  maxLog?: number;
}

/** Live view of the simulated trading run: stats, equity curve and trade log. */
export function AgentRunCard({ step, done, loss, maxLog }: AgentRunCardProps) {
  const { t } = useI18n();
  const a = t.agent;
  const snapshot = agentSnapshot(step);
  const change = snapshot.balance / AGENT_START_BALANCE - 1;
  const events = AGENT_EVENTS.slice(0, step).map((event, index) => ({ event, text: a.events[index] }));
  const visible = maxLog ? events.slice(-maxLog) : events;

  return (
    <div className={`arun ${done ? 'done' : ''}`}>
      <header>
        <i className="pulse" aria-hidden="true" />
        <b>{done ? a.done : a.running}</b>
        <span>
          {fmt(a.day, { n: snapshot.day })} / {AGENT_SIMULATED_DAYS}
        </span>
      </header>
      <div className="arun-stats">
        <div>
          <small>{a.balance}</small>
          <b>{snapshot.balance.toFixed(4)} ETH</b>
        </div>
        <div>
          <small>{a.result}</small>
          <b className={change >= 0 ? 'up' : 'down'}>{formatPercent(change)}</b>
        </div>
        <div>
          <small>{a.fees}</small>
          <b>{snapshot.fees.toFixed(4)} ETH</b>
        </div>
        <div>
          <small>{a.lossLimit}</small>
          <b>−{loss}%</b>
        </div>
      </div>
      <svg className="arun-chart" viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2={CHART_W} y1={baselineY(CHART_H)} y2={baselineY(CHART_H)} />
        <polyline points={equityPoints(snapshot.equity, CHART_W, CHART_H)} />
      </svg>
      <ul className="arun-log" aria-live="polite">
        {visible.map(({ event, text }) => (
          <li key={text + event.day}>
            <small>{fmt(a.day, { n: event.day })}</small>
            <span>{text}</span>
            {event.pnl !== 0 && <em className={event.pnl > 0 ? 'up' : 'down'}>{formatSignedEth(event.pnl)}</em>}
          </li>
        ))}
      </ul>
      <p className="arun-note">{a.simNote}</p>
    </div>
  );
}
