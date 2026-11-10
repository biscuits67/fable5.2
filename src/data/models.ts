export const MODEL_IDS = ['lumen', 'vector', 'forge', 'apex'] as const;
export type ModelId = (typeof MODEL_IDS)[number];

export const ENTRY_BALANCE = 0.1;
export const FULL_BALANCE = 0.5;

/** Ratings are on a 1–3 scale and drive the comparison table. */
export interface ModelSpec {
  id: ModelId;
  name: string;
  minBalance: number;
  color: string;
  ink: string;
  ratings: { speed: number; depth: number; code: number; markets: number };
}

export const MODELS: readonly ModelSpec[] = [
  { id: 'lumen', name: 'Lumen', minBalance: ENTRY_BALANCE, color: '#5fe1ff', ink: '#04205a', ratings: { speed: 3, depth: 1, code: 1, markets: 1 } },
  { id: 'vector', name: 'Vector', minBalance: FULL_BALANCE, color: '#3d6bff', ink: '#ffffff', ratings: { speed: 2, depth: 2, code: 1, markets: 3 } },
  { id: 'forge', name: 'Forge', minBalance: FULL_BALANCE, color: '#7b6bff', ink: '#ffffff', ratings: { speed: 2, depth: 2, code: 3, markets: 1 } },
  { id: 'apex', name: 'Apex', minBalance: FULL_BALANCE, color: '#dbe6ff', ink: '#071038', ratings: { speed: 1, depth: 3, code: 3, markets: 3 } },
];

export function formatEth(value: number, digits = 2): string {
  return value.toFixed(digits);
}
