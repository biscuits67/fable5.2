/**
 * Scripted run for the trading-agent demo. All figures are invented and deliberately modest:
 * the demo must not suggest that large or guaranteed returns are realistic.
 */
export const AGENT_START_BALANCE = 0.5;
export const AGENT_SIMULATED_DAYS = 14;

const FEE = 0.0002;

export interface AgentPosition {
  pair: string;
  size: string;
}

/** One step of the run. Its index matches the translated line in `agent.events`. */
export interface AgentEvent {
  day: number;
  pnl: number;
  fee: number;
  opens?: AgentPosition;
  closes?: string;
}

export const AGENT_EVENTS: readonly AgentEvent[] = [
  { day: 1, pnl: 0, fee: FEE, opens: { pair: 'ETH → USDC', size: '30%' } },
  { day: 3, pnl: 0.0066, fee: FEE, closes: 'ETH → USDC' },
  { day: 4, pnl: 0, fee: FEE, opens: { pair: 'LDO/ETH', size: '0.10 ETH' } },
  { day: 6, pnl: 0.0061, fee: FEE, closes: 'LDO/ETH' },
  { day: 7, pnl: 0, fee: FEE, opens: { pair: 'ARB/ETH', size: '0.08 ETH' } },
  { day: 8, pnl: -0.0032, fee: FEE, closes: 'ARB/ETH' },
  { day: 9, pnl: 0, fee: 0 },
  { day: 10, pnl: 0, fee: FEE, opens: { pair: 'ETH → USDC', size: '40%' } },
  { day: 12, pnl: 0.0088, fee: FEE, closes: 'ETH → USDC' },
  { day: 12, pnl: 0, fee: FEE, opens: { pair: 'LINK/ETH', size: '0.10 ETH' } },
  { day: 14, pnl: 0.0038, fee: FEE, closes: 'LINK/ETH' },
];

export interface AgentSnapshot {
  day: number;
  balance: number;
  fees: number;
  /** Balance after each applied step, starting with the initial balance. */
  equity: number[];
  positions: AgentPosition[];
}

/** State of the run after the first `step` events. */
export function agentSnapshot(step: number): AgentSnapshot {
  let balance = AGENT_START_BALANCE;
  let fees = 0;
  let positions: AgentPosition[] = [];
  const equity = [balance];

  for (const event of AGENT_EVENTS.slice(0, step)) {
    balance += event.pnl - event.fee;
    fees += event.fee;
    if (event.closes) positions = positions.filter((p) => p.pair !== event.closes);
    if (event.opens) positions = [...positions, event.opens];
    equity.push(balance);
  }
  const day = step > 0 ? AGENT_EVENTS[Math.min(step, AGENT_EVENTS.length) - 1].day : 0;
  return { day, balance, fees, equity, positions };
}

export function formatPercent(ratio: number): string {
  const pct = ratio * 100;
  return `${pct >= 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%`;
}

export function formatSignedEth(value: number): string {
  return `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(4)} ETH`;
}

const CHART_MIN = 0.494;
const CHART_MAX = 0.526;

/** Polyline points for the equity curve. The x axis spans the whole run, so the line grows to the right. */
export function equityPoints(equity: readonly number[], width: number, height: number): string {
  const stepWidth = width / AGENT_EVENTS.length;
  return equity
    .map((value, index) => {
      const y = height - ((value - CHART_MIN) / (CHART_MAX - CHART_MIN)) * height;
      return `${(index * stepWidth).toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/** Height of the starting-balance line on the same scale. */
export function baselineY(height: number): number {
  return height - ((AGENT_START_BALANCE - CHART_MIN) / (CHART_MAX - CHART_MIN)) * height;
}
