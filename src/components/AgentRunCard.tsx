import { AGENT_EVENTS, AGENT_SIMULATED_DAYS, AGENT_START_BALANCE, agentSnapshot, baselineY, equityPoints, formatPercent, formatSignedEth } from '../data/agentRun';
import { fmt, useI18n } from '../i18n';

const CHART_W = 300;
const CHART_H = 80;

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
