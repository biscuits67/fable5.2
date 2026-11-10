import type { ModelId } from '../../data/models';

export interface Thinking {
  steps: string[];
  /** How many steps are visible so far. */
  shown: number;
  /** Total thinking time, set once thinking is finished. */
  seconds: number | null;
}

export type Block =
  | { kind: 'code' }
  | { kind: 'plan'; rows: string[][] }
  | { kind: 'confirm'; chosen: { days: number; loss: number } | null }
  | { kind: 'run'; step: number; done: boolean; loss: number };

export interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
  files?: string[];
  thinking?: Thinking;
  block?: Block;
}

export interface Chat {
  id: number;
  title: string;
  modelId: ModelId;
  messages: Message[];
}

export interface Modes {
  think: boolean;
  chain: boolean;
  agent: boolean;
}

export type ScenarioKey = 'code' | 'plan' | 'ask' | 'apex';

export const SCENARIO_BY_MODEL: Record<ModelId, ScenarioKey> = { lumen: 'ask', vector: 'plan', forge: 'code', apex: 'apex' };
export const MODEL_BY_SCENARIO: Record<ScenarioKey, ModelId> = { ask: 'lumen', plan: 'vector', code: 'forge', apex: 'apex' };
/** Scenarios offered as ready-made conversations in the history list, in display order. */
export const HISTORY_SCENARIOS: readonly ScenarioKey[] = ['code', 'plan', 'ask'];
