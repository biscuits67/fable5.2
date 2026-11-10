import { escapeHtml, highlightSolidity } from '../../lib/highlight';
import { AGENT_EVENTS, AGENT_SIMULATED_DAYS, AGENT_START_BALANCE, agentSnapshot, baselineY, equityPoints, formatPercent } from '../../data/agentRun';
import type { ModelId } from '../../data/models';

export interface DemoScenario {
  model: ModelId;
  balance: number;
  prompt: string;
  reply: string;
  code?: { file: string; source: string };
  plan?: { rows: string[][]; chartLabel: string };
  agent?: DemoAgentCopy;
}

/** Labels for the trading-agent card. `day` contains an `{n}` placeholder. */
export interface DemoAgentCopy {
  running: string;
  done: string;
  day: string;
  balance: string;
  result: string;
  note: string;
  events: string[];
}

export interface DemoLabels {
  selectModel: string;
  connectFirst: string;
  pickAndAsk: string;
  unlocked: string;
  allUnlocked: string;
  lumenOnly: string;
}

export interface DemoPlayer {
  play: (index: number) => void;
  destroy: () => void;
}

/** The mock app is drawn on a fixed 1000×625 canvas and scaled to the laptop screen. */
const CANVAS_WIDTH = 1000;
const FULL_ACCESS_BALANCE = 0.5;
const AGENT_CHART = { width: 300, height: 60 };
const AGENT_STEP_MS = 520;
const AGENT_LOG_LINES = 3;

class Cancelled extends Error {}

const CHART_SVG =
  '<svg viewBox="0 0 300 120" preserveAspectRatio="none"><path class="l" d="M4 70C30 50 44 92 70 84S104 30 130 44s30 58 56 50 34-62 60-58 30 26 50 8"/>' +
  '<circle cx="70" cy="84" r="5" style="animation-delay:.7s"/><circle cx="186" cy="94" r="7" style="animation-delay:1.3s"/><circle cx="246" cy="36" r="5" style="animation-delay:1.7s"/></svg>';

function must<T extends Element>(root: Element, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Demo markup is missing ${selector}`);
  return node;
}

/**
 * Drives the scripted product demo inside the laptop mockup: a fake cursor connects a wallet,
 * the balance unlocks models, a prompt is typed and the answer streams in.
 * The markup is owned by React but its dynamic parts are mutated here, imperatively,
 * because the sequence is a timeline rather than state.
 */
export function createDemoPlayer(
  root: HTMLElement,
  scenarios: readonly DemoScenario[],
  labels: DemoLabels,
  onScenarioChange: (index: number) => void,
): DemoPlayer {
  const screen = must<HTMLElement>(root, '.mac-screen');
  const app = must<HTMLElement>(root, '.app');
  const cursor = must<SVGElement>(root, '.cur');
  const el = {
    connect: must<HTMLElement>(app, '.a-connect'),
    pop: must<HTMLElement>(app, '.pop'),
    walletOption: must<HTMLElement>(app, '.pw'),
    balance: must<HTMLElement>(app, '.a-bal'),
    tier: must<HTMLElement>(app, '.a-tier'),
    title: must<HTMLElement>(app, '.a-title'),
    chat: must<HTMLElement>(app, '.chat'),
    input: must<HTMLElement>(app, '.inp'),
    inputText: must<HTMLElement>(app, '.inp-t'),
    send: must<HTMLElement>(app, '.send'),
  };
  const models = [...app.querySelectorAll<HTMLElement>('.m')];

  const scale = () => screen.clientWidth / CANVAS_WIDTH;
  const fit = () => app.style.setProperty('--k', String(scale()));
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(screen);
  fit();

  let runId = 0;
  const sleep = (ms: number, id: number) =>
    new Promise<void>((resolve, reject) => {
      window.setTimeout(() => (id === runId ? resolve() : reject(new Cancelled())), ms);
    });

  const moveTo = async (target: HTMLElement, id: number) => {
    const k = scale();
    const a = app.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const x = (r.left - a.left + r.width * 0.5) / k;
    const y = (r.top - a.top + r.height * 0.55) / k;
    cursor.style.transform = `translate(${x}px,${y}px)`;
    await sleep(800, id);
  };

  const click = async (target: HTMLElement, id: number) => {
    await moveTo(target, id);
    cursor.classList.add('down');
    target.classList.add('press');
    await sleep(170, id);
    cursor.classList.remove('down');
    target.classList.remove('press');
  };

  const append = (html: string, className: string) => {
    const node = document.createElement('div');
    node.className = className;
    node.innerHTML = html;
    el.chat.append(node);
    return node;
  };

  const badge = (model: HTMLElement) => must<HTMLElement>(model, 'em');

  const reset = () => {
    app.classList.remove('on');
    el.pop.classList.remove('show', 'wait');
    for (const model of models) {
      model.classList.remove('open', 'sel');
      badge(model).textContent = `${model.dataset.min} ETH`;
    }
    el.title.textContent = labels.selectModel;
    el.chat.innerHTML = `<div class="empty">${escapeHtml(labels.connectFirst)}</div>`;
    el.inputText.textContent = '';
    el.input.classList.remove('focus');
    el.balance.textContent = '0.00';
    el.tier.textContent = '';
  };

  const connect = async (scenario: DemoScenario, id: number) => {
    await click(el.connect, id);
    el.pop.classList.add('show');
    await sleep(500, id);
    await click(el.walletOption, id);
    el.pop.classList.add('wait');
    await sleep(1100, id);
    el.pop.classList.remove('show', 'wait');
    app.classList.add('on');

    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      el.balance.textContent = ((scenario.balance * i) / steps).toFixed(3);
      await sleep(28, id);
    }
    el.tier.textContent = scenario.balance >= FULL_ACCESS_BALANCE ? labels.allUnlocked : labels.lumenOnly;
    must<HTMLElement>(el.chat, '.empty').textContent = labels.pickAndAsk;

    for (const model of models) {
      if (scenario.balance < Number(model.dataset.min)) continue;
      model.classList.add('open');
      badge(model).textContent = labels.unlocked;
      await sleep(140, id);
    }
  };

  const ask = async (scenario: DemoScenario, id: number) => {
    const model = models.find((m) => m.dataset.model === scenario.model);
    if (!model) throw new Error(`Demo markup has no model ${scenario.model}`);
    await click(model, id);
    model.classList.add('sel');
    el.title.textContent = must<HTMLElement>(model, 'b').textContent;

    await click(el.input, id);
    el.input.classList.add('focus');
    for (const ch of scenario.prompt) {
      el.inputText.textContent += ch;
      await sleep(26, id);
    }
    await click(el.send, id);
    el.inputText.textContent = '';
    el.input.classList.remove('focus');
    el.chat.innerHTML = '';
    append(escapeHtml(scenario.prompt), 'msg u');
  };

  const answer = async (scenario: DemoScenario, id: number) => {
    const bubble = append('<span class="dots"><i></i><i></i><i></i></span>', 'msg a');
    await sleep(1000, id);
    const chunk = 3;
    for (let i = chunk; i < scenario.reply.length + chunk; i += chunk) {
      bubble.textContent = scenario.reply.slice(0, i);
      await sleep(16, id);
    }

    if (scenario.code) {
      const block = append(`<header><i></i><i></i><i></i><span>${escapeHtml(scenario.code.file)}</span></header><pre></pre>`, 'code');
      const pre = must<HTMLElement>(block, 'pre');
      for (const line of scenario.code.source.split('\n')) {
        pre.insertAdjacentHTML('beforeend', `${highlightSolidity(line)}\n`);
        await sleep(70, id);
      }
    }

    if (scenario.plan) {
      const rows = scenario.plan.rows
        .map(([key, value], i) => `<li style="animation-delay:${i * 180}ms"><small>${escapeHtml(key)}</small><b>${escapeHtml(value)}</b></li>`)
        .join('');
      append(`<ul>${rows}</ul><div class="chart"><small>${escapeHtml(scenario.plan.chartLabel)}</small>${CHART_SVG}</div>`, 'plan');
    }

    if (scenario.agent) await runAgent(scenario.agent, id);
  };

  const runAgent = async (copy: DemoAgentCopy, id: number) => {
    const { width, height } = AGENT_CHART;
    const y = baselineY(height);
    const card = append(
      `<header><i class="pulse"></i><b>${escapeHtml(copy.running)}</b><span></span></header>` +
        `<div class="arun-stats"><div><small>${escapeHtml(copy.balance)}</small><b data-bal></b></div><div><small>${escapeHtml(copy.result)}</small><b data-res></b></div></div>` +
        `<svg class="arun-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><line x1="0" x2="${width}" y1="${y}" y2="${y}"/><polyline/></svg>` +
        `<ul class="arun-log"></ul><p class="arun-note">${escapeHtml(copy.note)}</p>`,
      'arun',
    );
    const day = must<HTMLElement>(card, 'header span');
    const balance = must<HTMLElement>(card, '[data-bal]');
    const result = must<HTMLElement>(card, '[data-res]');
    const line = must<SVGPolylineElement>(card, 'polyline');
    const log = must<HTMLElement>(card, '.arun-log');

    for (let step = 0; step <= AGENT_EVENTS.length; step++) {
      const snapshot = agentSnapshot(step);
      const change = snapshot.balance / AGENT_START_BALANCE - 1;
      day.textContent = `${copy.day.replace('{n}', String(snapshot.day))} / ${AGENT_SIMULATED_DAYS}`;
      balance.textContent = `${snapshot.balance.toFixed(4)} ETH`;
      result.textContent = formatPercent(change);
      result.className = change >= 0 ? 'up' : 'down';
      line.setAttribute('points', equityPoints(snapshot.equity, width, height));
      if (step > 0) {
        log.insertAdjacentHTML('beforeend', `<li><span>${escapeHtml(copy.events[step - 1])}</span></li>`);
        while (log.children.length > AGENT_LOG_LINES) log.firstElementChild?.remove();
      }
      await sleep(AGENT_STEP_MS, id);
    }
    card.classList.add('done');
    must<HTMLElement>(card, 'header b').textContent = copy.done;
  };

  const play = async (index: number) => {
    const id = ++runId;
    const scenario = scenarios[index];
    onScenarioChange(index);
    reset();
    try {
      await sleep(700, id);
      await connect(scenario, id);
      await sleep(500, id);
      await ask(scenario, id);
      await answer(scenario, id);
      await sleep(4500, id);
      void play((index + 1) % scenarios.length);
    } catch (error) {
      if (!(error instanceof Cancelled)) throw error;
    }
  };

  // Start only once the laptop is actually on screen.
  const startObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        startObserver.disconnect();
        void play(0);
      }
    },
    { threshold: 0.3 },
  );
  reset();
  startObserver.observe(screen);

  return {
    play: (index) => void play(index),
    destroy: () => {
      runId++;
      resizeObserver.disconnect();
      startObserver.disconnect();
    },
  };
}
