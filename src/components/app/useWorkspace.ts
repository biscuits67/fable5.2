import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AGENT_EVENTS, AGENT_START_BALANCE, agentSnapshot, formatPercent } from '../../data/agentRun';
import { FULL_BALANCE, MODELS, getModel, isUnlocked, type ModelId, type ModelSpec } from '../../data/models';
import { fmt } from '../../i18n';
import type { Dict } from '../../i18n/locales/en';
import { HISTORY_SCENARIOS, MODEL_BY_SCENARIO, SCENARIO_BY_MODEL, type Block, type Chat, type Message, type Modes, type ScenarioKey } from './types';

const STEP_MS = 750;
const DEEP_STEP_MS = 1150;
const AFTER_THINKING_MS = 350;
const STREAM_INTERVAL_MS = 16;
const STREAM_CHUNK = 3;
const AGENT_EVENT_MS = 3200;
const TITLE_MAX = 42;
const AGENT_TRIGGER = /\b(trading agent|autonomous)\b/i;

class Cancelled extends Error {}

interface ScriptedTurn {
  steps: string[];
  reply: string;
  block?: Block;
}

function scriptedTurn(t: Dict, key: ScenarioKey): ScriptedTurn & { prompt: string } {
  const s = t.scenarios;
  switch (key) {
    case 'code':
      return { prompt: s.code.prompt, reply: s.code.reply, steps: t.think.code, block: { kind: 'code' } };
    case 'plan':
      return { prompt: s.plan.prompt, reply: s.plan.reply, steps: t.think.plan, block: { kind: 'plan', rows: s.plan.rows } };
    case 'ask':
      return { prompt: s.ask.prompt, reply: s.ask.reply, steps: t.think.ask };
    case 'apex':
      return { prompt: s.apex.prompt, reply: s.apex.reply, steps: t.think.apex };
  }
}

const truncate = (text: string) => (text.length > TITLE_MAX ? `${text.slice(0, TITLE_MAX).trimEnd()}…` : text);
const firstUnlocked = (balance: number | null) => MODELS.find((m) => isUnlocked(m, balance)) ?? MODELS[0];

/**
 * State and scripted behaviour of the demo workspace: chats, the "thinking" and streaming timeline,
 * and the trading-agent run. Everything is local and simulated.
 */
export function useWorkspace(t: Dict, balance: number | null, onLocked: (model: ModelSpec) => void) {
  const nextId = useRef(1);
  const newId = () => nextId.current++;
  const createChat = (modelId: ModelId): Chat => ({ id: newId(), title: '', modelId, messages: [] });

  const [chats, setChats] = useState<Chat[]>(() => [createChat(firstUnlocked(balance).id)]);
  const [activeId, setActiveId] = useState(() => chats[0].id);
  const [busy, setBusy] = useState(false);
  const [modes, setModes] = useState<Modes>({ think: false, chain: false, agent: false });
  const [usedHistory, setUsedHistory] = useState<ScenarioKey[]>([]);

  const active = chats.find((c) => c.id === activeId) ?? chats[0];

  // Latest values for the async timelines, which outlive the render that started them.
  const live = useRef({ t, modes });
  live.current = { t, modes };

  const runId = useRef(0);
  const cancel = useCallback(() => {
    runId.current++;
    setBusy(false);
  }, []);
  useEffect(() => () => void runId.current++, []);

  const sleep = (ms: number, id: number) =>
    new Promise<void>((resolve, reject) => {
      window.setTimeout(() => (id === runId.current ? resolve() : reject(new Cancelled())), ms);
    });

  const patchChat = (chatId: number, change: (chat: Chat) => Chat) => setChats((list) => list.map((c) => (c.id === chatId ? change(c) : c)));
  const patchMessage = (chatId: number, messageId: number, change: (m: Message) => Message) =>
    patchChat(chatId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === messageId ? change(m) : m)) }));
  const addMessage = (chatId: number, message: Omit<Message, 'id'>): number => {
    const id = newId();
    patchChat(chatId, (c) => ({ ...c, messages: [...c.messages, { ...message, id }] }));
    return id;
  };

  /** Runs one timeline; a newer timeline or `cancel()` aborts it silently. */
  const exec = (timeline: (id: number) => Promise<void>) => {
    const id = ++runId.current;
    setBusy(true);
    timeline(id)
      .then(() => {
        if (id === runId.current) setBusy(false);
      })
      .catch((error: unknown) => {
        if (!(error instanceof Cancelled)) throw error;
      });
  };

  /** Shows the thinking steps one by one, then streams the reply and attaches its block. */
  const respond = async (id: number, chatId: number, turn: ScriptedTurn): Promise<void> => {
    const { t: tr, modes: m } = live.current;
    const steps = [...turn.steps, ...(m.chain ? [tr.think.chain] : []), ...(m.think ? [tr.think.deep] : [])];
    const messageId = addMessage(chatId, { role: 'ai', text: '', thinking: { steps, shown: 0, seconds: null } });
    const startedAt = performance.now();

    for (let shown = 1; shown <= steps.length; shown++) {
      await sleep(m.think ? DEEP_STEP_MS : STEP_MS, id);
      patchMessage(chatId, messageId, (msg) => ({ ...msg, thinking: { steps, shown, seconds: null } }));
    }
    await sleep(AFTER_THINKING_MS, id);
    const seconds = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
    patchMessage(chatId, messageId, (msg) => ({ ...msg, thinking: { steps, shown: steps.length, seconds } }));

    for (let end = STREAM_CHUNK; end < turn.reply.length + STREAM_CHUNK; end += STREAM_CHUNK) {
      patchMessage(chatId, messageId, (msg) => ({ ...msg, text: turn.reply.slice(0, end) }));
      await sleep(STREAM_INTERVAL_MS, id);
    }
    if (turn.block) patchMessage(chatId, messageId, (msg) => ({ ...msg, block: turn.block }));
  };

  const startUserTurn = (chat: Chat, text: string, files: string[], title: string, modelId: ModelId = chat.modelId) => {
    patchChat(chat.id, (c) => ({ ...c, modelId, title: c.title || title }));
    addMessage(chat.id, { role: 'user', text, files: files.length ? files : undefined });
  };

  const startAgent = (text: string, files: string[] = []) => {
    if (busy) return;
    if (balance === null || balance < FULL_BALANCE) {
      onLocked(getModel('vector'));
      return;
    }
    const chat = active;
    // Trading belongs to Vector; Apex may keep the task because it also covers markets.
    const modelId: ModelId = chat.modelId === 'apex' ? 'apex' : 'vector';
    startUserTurn(chat, text, files, t.agent.card, modelId);
    exec((id) => respond(id, chat.id, { steps: t.agent.thinkSetup, reply: t.agent.confirm, block: { kind: 'confirm', chosen: null } }));
  };

  const confirmAgent = (messageId: number, days: number, loss: number) => {
    if (busy) return;
    const chatId = active.id;
    patchMessage(chatId, messageId, (m) => ({ ...m, block: { kind: 'confirm', chosen: { days, loss } } }));
    addMessage(chatId, { role: 'user', text: fmt(t.agent.userConfirm, { days, loss }) });

    exec(async (id) => {
      const steps = t.agent.thinkPlan.map((line) => fmt(line, { loss }));
      await respond(id, chatId, { steps, reply: t.agent.go });
      const runMessageId = addMessage(chatId, { role: 'ai', text: '', block: { kind: 'run', step: 0, done: false, loss } });
      for (let step = 1; step <= AGENT_EVENTS.length; step++) {
        await sleep(AGENT_EVENT_MS, id);
        patchMessage(chatId, runMessageId, (m) => ({ ...m, block: { kind: 'run', step, done: step === AGENT_EVENTS.length, loss } }));
      }
      const final = agentSnapshot(AGENT_EVENTS.length);
      const report = fmt(live.current.t.agent.report, {
        balance: final.balance.toFixed(4),
        pct: formatPercent(final.balance / AGENT_START_BALANCE - 1),
        loss,
      });
      await respond(id, chatId, { steps: [], reply: report });
    });
  };

  const send = (rawText: string, files: string[] = []) => {
    const text = rawText.trim();
    const model = getModel(active.modelId);
    if (busy || (!text && files.length === 0)) return;
    if (!isUnlocked(model, balance)) {
      onLocked(model);
      return;
    }
    if (modes.agent || AGENT_TRIGGER.test(text)) {
      startAgent(text, files);
      return;
    }
    const scripted = scriptedTurn(t, SCENARIO_BY_MODEL[model.id]);
    const turn: ScriptedTurn =
      text === scripted.prompt ? scripted : { steps: t.think.generic, reply: fmt(t.app.demoReply, { model: model.name }) };
    const chat = active;
    startUserTurn(chat, text, files, truncate(text || files[0]));
    exec((id) => respond(id, chat.id, turn));
  };

  const newChat = (modelId: ModelId = active.modelId) => {
    cancel();
    const empty = chats.find((c) => c.messages.length === 0);
    if (empty) {
      patchChat(empty.id, (c) => ({ ...c, modelId }));
      setActiveId(empty.id);
      return;
    }
    const chat = createChat(modelId);
    setChats((list) => [chat, ...list]);
    setActiveId(chat.id);
  };

  const openChat = (chatId: number) => {
    if (chatId === activeId) return;
    cancel();
    setActiveId(chatId);
  };

  const selectModel = (model: ModelSpec) => {
    if (!isUnlocked(model, balance)) {
      onLocked(model);
      return;
    }
    if (model.id !== active.modelId) newChat(model.id);
  };

  /** Opens one of the ready-made conversations from the history list. */
  const openHistory = (key: ScenarioKey) => {
    const model = getModel(MODEL_BY_SCENARIO[key]);
    if (!isUnlocked(model, balance)) {
      onLocked(model);
      return;
    }
    cancel();
    const turn = scriptedTurn(t, key);
    const chat: Chat = {
      id: newId(),
      title: t.ws.historyItems[HISTORY_SCENARIOS.indexOf(key)],
      modelId: model.id,
      messages: [
        { id: newId(), role: 'user', text: turn.prompt },
        { id: newId(), role: 'ai', text: turn.reply, block: turn.block },
      ],
    };
    setChats((list) => [chat, ...list]);
    setUsedHistory((list) => [...list, key]);
    setActiveId(chat.id);
  };

  // Keep an empty active chat on a model the current wallet can actually use.
  useEffect(() => {
    if (active.messages.length > 0 || isUnlocked(getModel(active.modelId), balance)) return;
    const fallback = firstUnlocked(balance);
    if (fallback.id !== active.modelId) patchChat(active.id, (c) => ({ ...c, modelId: fallback.id }));
  }, [balance, active.id, active.modelId, active.messages.length]);

  // Agent mode needs the full tier; switch it off if the wallet no longer qualifies.
  useEffect(() => {
    if (modes.agent && (balance === null || balance < FULL_BALANCE)) setModes((m) => ({ ...m, agent: false }));
  }, [balance, modes.agent]);

  const toggleMode = (key: keyof Modes) => setModes((m) => ({ ...m, [key]: !m[key] }));

  /** Progress of the most recent agent run across all chats, for the portfolio panel. */
  const agentRun = useMemo(() => {
    for (const chat of chats) {
      for (let i = chat.messages.length - 1; i >= 0; i--) {
        const block = chat.messages[i].block;
        if (block?.kind === 'run') return block;
      }
    }
    return null;
  }, [chats]);

  const history = chats.filter((c) => c.messages.length > 0);
  const seedHistory = HISTORY_SCENARIOS.filter((key) => !usedHistory.includes(key));

  return {
    active, activeId, history, seedHistory, busy, modes, agentRun,
    send, startAgent, confirmAgent, newChat, openChat, selectModel, openHistory, toggleMode,
  };
}

export type Workspace = ReturnType<typeof useWorkspace>;
